# json-patch

> Immutable JSON Patch implementation based on [RFC 6902](https://tools.ietf.org/html/rfc6902) which adds operational
> transformation (OT) and last-writer-wins (LWW) support for syncing between client and server. Does not support the
> full OT algorithm because `copy` and `move` operations cannot be transformed correctly in all cases, so operations
> must always be applied in correct order. This means a central server is required to determine order.
>
> The JSON Patch implementation was originally from https://github.com/mohayonao/json-touch-patch which is no longer
> supported. It was refactored heavily and converted to TypeScript.

## Features

- **Immutable**: The original JSON is not changed and data is shared as much as possible.
- **Rollback**: If an error occurs, all patches are rejected unless requested. Return the original JSON.
- **Customizable**: You can add custom operators.
- **Patch API**: A JSONPatch object to simplify the creation and transformation of patches.
- **Multiplayer**: You can transform patches against each other for collaborative systems using Operational
  Transformation (OT).
- **Syncable**: You can sync objects across server-clients using last-writer-wins (LWW) at the field level.

## Installation

```
$ npm install --save @typewriter/json-patch
```

## Quick Start

The easiest way to use json-patch is with the `JSONPatch` API.

```js
import { JSONPatch } from '@typewriter/json-patch';

const prevObject = { baz: 'qux', foo: 'bar' };

const patch = new JSONPatch();
patch.replace('/baz', 'boo');

const nextObject = patch.apply(prevObject);
// → { baz: "boo", foo: "bar" }
//              |
//             replaced

console.log(prevObject);
// → { baz: "qux", foo: "bar" }
//              |
//
```

## Operational Transformation Quick Start

Using OT with JSON Patch requires operations to be applied in the same order on the server and across clients. This
requires clients to keep a last-known-server version of the object in memory or storage as well as a current-local-state
version of the object in memory or storage. The first is for applying changes in order and the second is for the app to
have the current local state. A version/revision number should be used to track what version of the data a change was
applied to in order to know what changes to transform it against, if any. As this is an advanced topic, a bare minimum
is provided here to display usage of the API.

```js
// client.js
import { JSONPatch } from '@typewriter/json-patch';

// The latest version synced from the server
let committedObject = { baz: 'qux', foo: 'bar' };
let rev = 1;

// Start off using this version in our app
let localObject = committedObject;

const localChange = new JSONPatch();
localChange.replace('/baz', 'boo');

// Update app data immediately
localObject = patch.apply(committedObject);

// Receive a change patch from the server
const { patch: serverChange, rev: latestRev } = getChangeFromServer();

// Apply server changes to our committed version
committedObject = serverChange.apply(committedObject);
rev = latestRev; // Keep track of the revsion so the server knows whether to transform incoming changes

// Transform local changes against committed server changes
const localChangeTransformed = serverChange.transform(committedObject, localChange);

// Re-apply local changes to get the new version
localObject = localChangeTransformed.apply(committedObject);

// Send local change to server with the revision it was applied at
sendChange(localChangeTransformed, rev);
```

## Low-level API

If you don't want to use `JSONPatch` you can use these methods on plain JSON Patch objects.

- `applyPatch(prevObject: object, patches: object[], [ opts: object ]): object`
  - `opts.custom: object` custom operator definition.
  - `opts.partial: boolean` not reject patches if error occurs (partial patching)
  - `opts.strict: boolean` throw an exception if error occurs
  - `opts.error: object` point to a cause patch if error occurs
  - returns `nextObject: object`

## Quick example

```js
import { applyPatch } from '@typewriter/json-patch';

const prevObject = { baz: 'qux', foo: 'bar' };
const patches = [
  { op: 'replace', path: '/baz', value: 'boo' },
];
const nextObject = applyPatch(prevObject, patches);
// → { baz: "boo", foo: "bar" }
//              |
//             replaced

console.log(prevObject);
// → { baz: "qux", foo: "bar" }
//              |
//             not changed
```

## How to apply patches

### add

```js
const patches = [
  { op: "add", path: "/matrix/1/-", value: 9 },
];
```

Return a new JSON. It contains shallow-copied elements that have some changes into child elements. And it contains original elements that were not updated.

![add](assets/patch-add.png)

```js
assert(prevObject.matrix[0] === nextObject.matrix[0]);
assert(prevObject.matrix[1] !== nextObject.matrix[1]);
assert(prevObject.matrix[2] === nextObject.matrix[2]);
```

### remove

```js
const patches = [
  { op: "remove", path: "/matrix/1" },
];
```

Return a new JSON. It contains shallow-copied elements that have some changes into child elements. And it contains original elements that are not updated any.

![remove](assets/patch-remove.png)

```js
assert(prevObject.matrix[0] === nextObject.matrix[0]);
assert(prevObject.matrix[1] !== nextObject.martix[1]);
assert(prevObject.matrix[2] === nextObject.matrix[1]);
```

### replace

```js
const patches = [
  { op: "replace", path: "/matrix/1/1", value: 9 },
];
```

Return a new JSON. It contains shallow-copied elements that have some changes into child elements. And it contains original elements that are not updated any.

![replace](assets/patch-replace.png)

```js
assert(prevObject.matrix[0] === nextObject.matrix[0]);
assert(prevObject.matrix[1] !== nextObject.matrix[1]);
assert(prevObject.matrix[2] === nextObject.matrix[2]);
```

### replace (no changes)

```js
const patches = [
  { op: "replace", path: "/matrix/1/1", value: 4 },
];
```

Return the original JSON. Because all elements are not changed.

![replace](assets/patch-no-change.png)

`prevObject.matrix[1][1]` is already `4`. So, this patch is need not to update any.

```js
assert(prevObject === nextObject);
```

### move

```js
const patches = [
  { op: "move", from: "/matrix/1", path: "/matrix/2" },
];
```

Return a new JSON. `[op:move]` works as `[op:get(from)]` -> `[op:remove(from)]` -> `[op:add(path)]`.

![move](assets/patch-move.png)

```js
assert(prevObject.matrix[0] === nextObject.matrix[0]);
assert(prevObject.matrix[1] === nextObject.martix[2]);
assert(prevObject.matrix[2] === nextObject.matrix[1]);
```

### copy

```js
const patches = [
  { op: "copy", from: "/matrix/1", path: "/matrix/1" },
];
```

Return a new JSON. `[op:copy]` works as `[op:get(from)]` -> `[op:add(path)]`.

![copy](assets/patch-copy.png)

```js
assert(prevObject.matrix[0] === nextObject.matrix[0]);
assert(prevObject.matrix[1] === nextObject.martix[1]);
assert(prevObject.matrix[1] === nextObject.martix[2]);
assert(prevObject.matrix[2] === nextObject.matrix[3]);
```

### test failed

```js
const patch = [
  { op: "add" , path: "/matrix/1/-", value: 9 },
  { op: "test", path: "/matrix/1/1", value: 0 },
];
```

Return the original JSON. Because a test op is failed. All patches are rejected.

![test](assets/patch-no-change.png)

`prevObject.matrix[1][1]` is not `0` but `4`. So, this test is failed.

```js
assert(prevObject === nextObject);
```

### invalid patch

```js
const json = [
  { op: "replace", path: "/matrix/1/100", value: 9 },
];
```

Return the original JSON. Because all patches are rejected when error occurs.

![invalid](assets/patch-no-change.png)

`prevObject.matrix[1][100]` is not defined. So, this patch is invalid.

```js
assert(prevObject === nextObject);
```

## Syncable Object Store

json-patch provides a utility that will help sync an object field-by-field using the Last-Writer-Wins (LWW) algorithm.
This sync method is not as robust as operational transformation, but it only stores a little data in addition to the
object and is much simpler. It does not handle adding/removing array items, though entire arrays can
be set. It should work great for documents that don't need merging text like Figma describes in
https://www.figma.com/blog/how-figmas-multiplayer-technology-works/ and for objects like user preferences.

It works by using metadata to track the current revision of the object, any outstanding changes needing to be sent to
the server from the client, and the revisions of each added value on the server so that one may get all changes since
the last revision was synced. The metadata will be minuscule on the client, and small-ish on the server. The metadata
must be stored with the rest of the object to work. This is a tool to help with the harder part of LWW syncing.

Syncable will auto-create objects in paths that need them. This helps with preventing data from being overwritten
during merging that shouldn't be.

It should work with offline, though clients will "win" when they come back online, even after days/weeks being offline.
If offline is not desired, send the complete data from the server down when first connecting and then receive changes.
If offline is desired but not allowed to "win" when coming online with changes that occurred while offline, you may
use `changesSince(rev)` on the server and `receive(patch, serverRev, true /* overwrite local changes */)` to ensure
local changes while offline do not win over changes made online on the server.

Use whitelist and blacklist options to prevent property changes from being set by the client, only set by the server.
This allows one-way syncable objects such as global configs, plans, billing information, etc. that can be set by trusted
sources using `receive(patch, null, true /* ignoreLists */)` on the server.

Example usage on the client:
```js
import { syncable } from '@typewriter/json-patch';

// Create a new syncable object
const newObject = syncable({ baz: 'qux', foo: 'bar' });

// Send the initial object to the server
newObject.send(async patch => {
  // A function you define using fetch, websockets, etc
  return await sendJSONPatchChangesToServer(patch);
});

// Or load a syncable object from storage (or from the server)
const { data, metadata } = JSON.parse(localStorage.getItem('my-object-key'));
const object = syncable(data, metadata);

// Automatically send changes when changes happen.
// This will be called immediately if there are outstanding changes needing to be sent.
object.subscribe((data, meta, hasUnsentChanges) => {
  if (hasUnsentChanges) {
    object.send(async patch => {
      // A function you define using fetch, websockets, etc. Be sure to use await/promises to know when it is complete
      // or errored. Place the try/catch around send, not inside
      await sendJSONPatchChangesToServer(patch);
    });
  }
});

// Get changes since last synced after sending any outstanding changes
const response = await getJSONPatchChangesFromServer(object.getRev());
if (response.patch && response.rev) {
  object.receive(response.patch, response.rev);
}

// When receiving a change from the server, call receive
// (`onReceiveChanges` is a method created by you, could use websockets or polling, etc)
onReceiveChanges((patch, rev) => {
  object.receive(patch, rev);
});

// persist to storage for offline use if desired. Will persist unsynced changes made offline.
object.subscribe((data, metadata) => {
  localStorage.setItem('my-object-key', JSON.stringify({
    data, metadata,
  }));
});


// Auto-create empty objects
object.change(new JSONPatch().add(`/docs/${docId}/prefs/color`, 'blue'))
```

On the server:
```js
import { syncable } from '@typewriter/json-patch';

// Create a new syncable object
const newObject = syncable({ baz: 'qux', foo: 'bar' }, undefined, { server: true });

// Or load syncable object from storage or from the server
const { data, metadata } = db.loadObject('my-object');
const object = syncable(data, metadata, { server: true });

// Get changes from a client
const [ returnPatch, rev, patch ] = object.receive(request.body.patch);

// Automatically send changes to clients when changes happen
object.onPatch((patch, rev) => {
  clients.forEach(client => {
    client.send({ patch, rev });
  });
});

// Auto merge received changes from the client
onReceiveChanges((clientSocket, patch) => {
  // Notice this is different than the client. No rev is provided. The server sets the next rev
  const [ returnPatch, rev, broadcastPatch ] = object.receive(patch);
  storeObject();
  sendToClient(clientSocket, [ returnPatch, rev ]);
  sendToClientsExcept(clientSocket, [ broadcastPatch, rev ]);
});

// persist to storage
function storeObject() {
  db.put('my-object-key', {
    data: object.get(),
    metadata: object.getMeta(),
  });
}
```

## License

MIT
