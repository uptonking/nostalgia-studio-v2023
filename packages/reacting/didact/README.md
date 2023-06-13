# didact

# overview

- [Build your own React: didact_pombo_201911_v16.8](https://pomb.us/build-your-own-react/)
  - https://github.com/pomber/didact
  - https://codesandbox.io/s/6b0kl

Step 0: Review React app from vanillajs
Step I: The createElement Function
Step II: The render Function
Step III: Concurrent Mode
Step IV: Fibers
Step V: Render and Commit Phases
Step VI: Reconciliation
Step VII: Function Components
Step VIII: Hooks

- these are a few things that React does differently
  - In Didact, we are walking the whole tree during the render phase. 
    - React instead follows some hints and heuristics to skip entire sub-trees where nothing changed.
  - We are also walking the whole tree in the commit phase. 
    - React keeps a linked list with just the fibers that have effects and only visit those fibers.
  - Every time we build a new work in progress tree, we create new objects for each fiber. 
    - React recycles the fibers from the previous trees.
  - **When Didact receives a new update during the render phase, it throws away the work in progress tree and starts again from the root**. 
    - React tags each update with an expiration timestamp and uses it to decide which update has a higher priority.
# todo
- fiber-vdom
  - children can be arrays
  - fragment

- useState
  - allow setState(newState)

- useEffect

- better reconciler
  - element key

- commitWork
  - should not be triggered further in the fiber tree for old fibers

- features
  - className, style prop
# discuss
- ## [help: Confused with 'requestIdleCallback(workLoop)'](https://github.com/pomber/didact/issues/43)
- So `deadline.timeRemaining() < 1` means that there is no remaining time to do the work, we should break the while loop and request another callback.

- ## [Setting value in useState hooks](https://github.com/pomber/didact/issues/21)
# ref
- https://github.com/pomber/didact/issues
- https://github.com/pomber/didact/pulls
