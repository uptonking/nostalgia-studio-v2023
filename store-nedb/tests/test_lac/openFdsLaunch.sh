#!/bin/sh
ulimit -n 128
node ./tests/test_lac/openFds.test.js
# node --experimental-specifier-resolution=node --loader=ts-node/esm/transpile-only ./test_lac/openFds.test.ts
