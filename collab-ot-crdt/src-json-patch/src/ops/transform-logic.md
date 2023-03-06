# Transform Logic

This document is to help think through the logic and edge cases for each transform combination so that we may be
**correct** as well as find the common logic for code reuse.

I will go through each operation and think through how it transforms against every other operation.

### op vs op

add vs add, move vs copy, these should all be explored for edge cases or specific treatments. The first operation is
`thisOp` which the second operation `otherOp` is being transformed over. The result is the transformed version of the
`otherOp`, or `null` if the `otherOp` should be dropped and is no longer valid.

Inverse operations are not always inverse logic. An add vs remove will not have the same logic as a remove vs add.

### Variables used

`thisOp` is always an operation that has *already* been applied to the local object. `thisFirst` indicates `thisOp` is
considered to have happened first. When `thisFirst` is `true`, it means that the `otherOp` arrived second to the server.
If `thisFirst` is `false` then the `otherOp` arrived first.

When a client sends its operations to the server, any operations that come in with a rev `>=` to the outgoing changes,
those incoming changes are transformed against the outgoing change with `thisFirst` set to `false` since they were
committed first. The client will always transform changes with `thisFirst` set to `false`. A client may transform a
local operation before sending it as well.

On the server, operations will only be transformed if they arrived out of order which will be verified by the rev number
of the operation. E.g. if the last operation was rev 10 and an operation comes in with the rev of 9, it will be
transformed over the last 2 operations before being applied. The incoming change will be transformed with `thisFirst`
set to `true` over rev 9 and 10 since those operations landed first. The server will always transform changes with
`thisFirst` set to `true`.

### A note about drops

Actions are used to indicate how to handle alterations. Increment and decrement indicate altering array indexes. Keep
and drop indicate whether to keep an operation (as-is) or drop it by returning null. During a transform, if an add,
replace, or copy is dropped, all operations that occur at subpaths of that dropped item until another add/replace/copy
occurs at the same path, should also be discarded.



## Operations

### add

Add a value. For non-array cases, this and replace are synonymous, but inside an array, an add will insert into the
array where a replace will replace an existing index.

#### add vs add

* If `thisOp.path` is an array index:
  * if `thisFirst` is `true`
    * if `otherOp.path` is `>` the index, **increment** the index
  * if `thisFirst` is `false`
    * if `otherOp.path` is `>=` the index, **increment** the index
* else if they are the same path, the one that wins is the one that came last (last write wins)
  * if `thisFirst` is `true`, **keep** the `otherOp` as it came second and overwrote the first
  * if `thisFirst` is `false`, **drop** the `otherOp` as it came first and `thisOp` overwrote it

#### add vs remove

* If `thisOp.path` is an array index:
  * if `thisFirst` is `true`
    * if `otherOp.path` is `>=` the index, **increment** the index
  * if `thisFirst` is `false`
    * if `otherOp.path` is `>=` the index, **increment** the index
* else if they are the same path, the one that wins is the add (write wins over delete)
  * if `thisFirst` is `true`, **drop** the `otherOp` as we want to favor the write
  * if `thisFirst` is `false`, **drop** the `otherOp` as we want to favor the write

#### add vs replace

* If `thisOp.path` is an array index:
  * if `thisFirst` is `true`
    * if `otherOp.path` is `>` the index, **increment** the index
  * if `thisFirst` is `false`
    * if `otherOp.path` is `>=` the index, **increment** the index
* else if they are the same path, the one that wins is the one that came last (last write wins)
  * if `thisFirst` is `true`, **keep** the `otherOp` as it came second and overwrote the first
  * if `thisFirst` is `false`, **drop** the `otherOp` as it came first and `thisOp` overwrote it

#### add vs copy

* If `thisOp.path` is an array index:
  * if `thisFirst` is `true`
    * if `otherOp.from` is `>` the index, **increment** the index
    * if `otherOp.path` is `>` the index, **increment** the index
  * if `thisFirst` is `false`
    * if `otherOp.from` is `>=` the index, **increment** the index
    * if `otherOp.path` is `>=` the index, **increment** the index
* else if `thisOp.path` is the same as `otherOp.from`
  * **drop** the `otherOp` as we cannot know its old value on all clients
* else if `thisOp.path` is the same as `otherOp.path`
  * if `thisFirst` is `true`, **keep** the `otherOp` as it came second and overwrote the first
  * if `thisFirst` is `false`, **drop** the `otherOp` as it came first and `thisOp` overwrote it

#### add vs move

* If `thisOp.path` is an array index:
  * if the move is within the same array and the index is `<` `otherOp.from` and `otherOp.path` or index is `>` `otherOp.from` and `otherOp.path` do nothing
  * if `thisFirst` is `true`
    * if `otherOp.from` is `>` the index, **increment** the index
    * if the move is within the same array and `otherOp.from` is `<` `otherOp.path`
      * if `otherOp.path` is `>` the index + 1, **increment** the index
    * else if `otherOp.path` is `>` the index, **increment** the index
  * if `thisFirst` is `false`
    * if `otherOp.from` is `>=` the index, **increment** the index
    * if the move is within the same array and `otherOp.from` is `<` `otherOp.path`
      * if `otherOp.path` is `>=` the index + 1, **increment** the index
    * else if `otherOp.path` is `>=` the index, **increment** the index
* else if `thisOp.path` is the same as `otherOp.from`
  * **drop** the `otherOp` as we cannot know its old value on all clients
* else if `thisOp.path` is the same as `otherOp.path`
  * if `thisFirst` is `true`, **keep** the `otherOp` as it came second and overwrote the first
  * if `thisFirst` is `false`, **drop** the `otherOp` as it came first and `thisOp` overwrote it

### remove

Remove a value

#### remove vs add

* If `thisOp.path` is an array index:
  * if `thisFirst` is `true`
    * if `otherOp.path` is `>` the index, **decrement** the index
  * if `thisFirst` is `false`
    * if `otherOp.path` is `>` the index, **decrement** the index
* else the one that wins is the add (write wins over delete)
  * if `thisFirst` is `true`, **keep** the `otherOp` as we want to favor the write
  * if `thisFirst` is `false`, **keep** the `otherOp` as we want to favor the write

#### remove vs remove

*

#### remove vs replace

*

#### remove vs copy

*

#### remove vs move

*

### replace

Replace a value

#### replace vs add

*

#### replace vs remove

*

#### replace vs replace

*

#### replace vs copy

*

#### replace vs move

*



### copy

Copy a value

#### copy vs add

* If `thisOp.path` is an array index:
  * if `thisFirst` is `true`
    * if `otherOp.from` is `>` the index, **increment** the index
    * if `otherOp.path` is `>` the index, **increment** the index
  * if `thisFirst` is `false`
    * if `otherOp.from` is `>=` the index, **increment** the index
    * if `otherOp.path` is `>=` the index, **increment** the index
* else if `thisOp.from` is the same as `otherOp.path`
  * **change** `otherOp` to a `remove` as we cannot know its old value on all clients
* else if they are the same path, the one that wins is the one that came last (last write wins)
  * if `thisFirst` is `true`, **keep** the `otherOp` as it came second and overwrote the first
  * if `thisFirst` is `false`, **drop** the `otherOp` as it came first and `thisOp` overwrote it

#### copy vs remove

*

#### copy vs replace

*

#### copy vs copy

*

#### copy vs move

*



### move

Move a value

#### move vs add

*

#### move vs remove

*

#### move vs replace

*

#### move vs copy

*

#### move vs move

*

