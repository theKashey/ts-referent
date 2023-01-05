Typescript `project-reference` builder for monorepos focused on "cutting" relations.

While other solutions are focused on [Infering project references from common monorepo patterns / tools](https://github.com/microsoft/TypeScript/issues/25376)
this one is trying to manage actually _project_ references, not _package_.

It still will generate configs for all your packages and do that for **any package manager**, but can do more than just this.

## Known flaws

> yes, better to know them upfront

- official caveats can be found at [typescript package references page](https://www.typescriptlang.org/docs/handbook/project-references.html#caveats-for-project-references)
- types are no longer "real time", as derived `d.ts` are used instead
  - you have to run `tsc -b --watch` to update types as you go
  - affects only "other" projects, not the one you currently work with
- `typescript-eslin`t` does not support project references. You need to give some another config to it and not all things can work with "one config for all"
  - known to break `@typescript-eslint/no-unsafe-call` and `@typescript-eslint/no-unsafe-member-access`
  - see [Support for Project References](https://github.com/typescript-eslint/typescript-eslint/issues/2094)
- build produces at least the same (at max double) of files you already had. That is a lot of files
  - consider adding `.referent` directory containing all generated configs and typescript output files into `.gitignore`
    - really a recommendation, but this will delay "spin up" of repo in local or CI as everything has to be build first

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

- `Kind` is an include pattern and a `slice` of your code you can `reference`
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
      types: [...(base.types || []), 'node'],
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

### Altering kinds

Just yesterday you were able to put whatever you need to any tsconfig you want. This is no longer possible.
While it might sound as a good idea to _preserve_ some settings from the original config, "slicing" everything into the pieces has to follow different logic

This is why, as you might see in the example above - in order to alter config you have to alter an applied kind.
This is relatively rare operation, still worth a few handy tools.

```tsx
// packages/some/package/tsconfig.referent.ts
import { alter } from 'ts-referent';

export default alter((currentPackage) => ({
  base: {
    // is equal to the implicit logic in the example above
    externals: currentPackage.packageJson.externals,
    types: ['node'],
    exclude: ['**/*.spec.*'],
  },
  tests: {
    include: ['**/*.spec.*'],
    // tests can "access" base. base cannot access tests
    references: ['base'],
  },
}));
```

The last example is a good demonstration of the essence of project references, the [one from the official documentation](https://www.typescriptlang.org/docs/handbook/project-references.html).

## See also

- https://github.com/azu/monorepo-utils/tree/master/packages/@monorepo-utils/workspaces-to-typescript-project-references
- https://github.com/Bessonov/set-project-references

# License

MIT
