Typescript `project-reference` builder for monorepos focused on "cutting" relations.

While other solutions are focused on [Infering project references from common monorepo patterns / tools](https://github.com/microsoft/TypeScript/issues/25376)
this one is trying to manage actually _project_ references, not _package_.

It still will generate configs for all your packages and do that for **any package manager**, but can do more than just this.

# API

```bash
yarn add --dev ts-referent
```

## CLI

- `ts-referent build` - creates tsconfigs for every package in the monorepo
- `ts-referent glossary tsconfig.packages.json` - creates a "global" tsconfig for all packages in the monorepo
- `ts-referent paths tscofig.paths.json` - creates tsconfigs you might want to extend your "base" one from, as it
  contains all links to all local packages

## Configuration

Project references are the perfect answer to these problems, but are quite painful to configure manually.
So let's automate what we could, leaving any complex and manual implementation... aside.

Different packages can be broken down into different kinds. Think: source, tests, cypress test:

- sources are your main code. Only it can be _referenced_ by other projects.
- tests are internal to your code. Nobody can import them, no matter what.
- cypress are given as an example, due to cypress definition clashing with jest ones, so you cannot have them both
  simultaneously.

### Kinds

- `Kind` is an include pattern
  - and every include pattern can specify exclude pattern as well
- Every `kind` can specify
  - which `external definitions` it should include
  - which _other kinds_ it should address
    - this enables configuration when source cannot import tests. Just cannot. For other restriction related
      configuration see [eslint-plugin-relations](https://github.com/theKashey/eslint-plugin-relations)

### Specifying kinds

Kinds can be specified via `tsconfig.referent.js` file you can place at any folder affecting all packages "below".

> note configuration file name - it is designed to _blend_ with your tsconfig.json

Every such file can define 3 entities - `extends`, `entrypointResolver` and `kinds`

```tsx
exports.baseConfig = "tsconfig you should extends from"
// only if you use them
exports.entrypointResolver = (packageJSON, dir) => [string, string][]

// the kinds
exports.kinds = {
    kindName: {
        includes: ['glob'],
        excludes: ['glob'],
        types: ['jest'],

    }
};

// or - a single entrypoint
/** @type {import('ts-referent').ConfigurationFile} */
module.exports/*: ConfigrationFile*/ = {
    baseConfig,
    entrypointResolver,
    kinds
}

//or

import {configure} from 'ts-referent';
export default configure({baseConfig, kinds});
```

##### Using ESM or Typescript as configuration

Just call ts-referent via ts-node, tsm, or others. Or the configuration file will not be found.

Depending on your package manager

> `node -r tsm ts-referent build` > `node -r tsm $(yarn bin ts-referent) build`

```tsx
import type {EntrypointResolver, Kinds} from "ts-referent";

export const baseConfig = "tsconfig you should extends from"

export const entrypointResolver: EntrypointResolver = (packageJSON, dir) => [string, string][]

// the kinds
export const kinds: Kinds = {
    kindName: {
        includes: ['glob'],
        excludes: ['glob'],
        types: ['jest'],
    }
};
```

or

```tsx
import { configure } from 'ts-referent';

export default configure({
  baseConfig: require.resolve('tsconfig.json'),
  entrypointResolver: (packageJSON, dir) => [],
  kinds: {
    base: {
      include: ['**/*'],
    },
  },
});
```

## Advanced

Kinds configuration can be nested and also can be based on functions

```tsx
export default configure({
  // yes, that could be a function
  kinds: ({ base, ...otherKindsDefinedAbove }, currentPackage) => ({
    ...otherKindsDefinedAbove,
    base: {
      ...base,
      // "wire" externals defined in package json as "extra" references to a given package
      externals: currentPackage.packageJson.externals,
      exclude: ['**/*.spec.*'],
    },
    tests: {
      include: ['**/*.spec.*'],
      // tests can "access" base. base cannot access tests
      references: ['base'],
    },
  }),
});
```

The last example is a good demonstraction of the essence of project references, the [one from the official documentation](https://www.typescriptlang.org/docs/handbook/project-references.html).

## See also

- https://github.com/azu/monorepo-utils/tree/master/packages/@monorepo-utils/workspaces-to-typescript-project-references
- https://github.com/Bessonov/set-project-references

# License

MIT
