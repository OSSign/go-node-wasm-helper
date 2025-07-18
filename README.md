# go-node-wasm-fs

A NodeJS module providing the following actions:

- `StringArgument(s: string)`
- `StringArguments(...s: string)`
- `ServeFS(basepath: string)`

Supports both JavaScript and TypeScript consumers.

## TODO
- Troubleshoot why string args + read file don't really work together
- Why the duck do the functions run backwards

## Usage

```js
const { StringArgument, StringArguments, ServeFS } = require('go-node-wasm-fs');
```

## Development
- Fill in the implementation for each action in `src/actions/`
