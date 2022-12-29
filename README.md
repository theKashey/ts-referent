Typescript `project-reference` builder for monorepos

# API

There is one CLI command - `ts-referent`, and yes, that is all 😏

## Configuration

Project references are the perfect answer to these problems, but are quite painful to configure manually.
So let's automate what we could, leaving any complex and manual implementation... aside.

Different packages can be broken down into different kinds. Think: source, tests, cypress test:

- sources are your main code. Only it can be _referenced_ by other projects.
- tests are internal to your code. Nobody can import them, no matter what.
- cypress are given as an example, due to cypress definition clashing with jest ones, so you cannot have them both simultaneously.

### Kinds

- `Kind` is an include pattern
  - and every include pattern can specify exclude pattern as well
- Every `kind` can specify
  - which `external definitions` it should include
  - which _other kinds_ it should address
    - this enables configuration when source cannot import tests. Just cannot. For other restriction related configuration see [eslint-plugin-relations](https://github.com/theKashey/eslint-plugin-relations)

### Specifying kinds

Kinds can be specified via `.referent.js` file you can place at any folder affecting all packages "below".

```tsx
module.exports = {
  kindName: {
    includes: 'glob',
    excludes: 'glob',
    extends: 'main.tsconfig.json',
    // types: ["extraTypes"],
    // compilerOptions: typescriptCompilerOptions
  },
};
```

# License

MIT
