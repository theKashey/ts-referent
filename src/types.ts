import type { CompilerOptions } from 'typescript';

import { Package, PackageJSON } from './package-interface';

export type RelationMapper = (defaultEntrypoint: string, pkg: PackageJSON, dir: string) => string[];

export interface Kind {
  /**
   * is it enabled? Can be configured via factory
   */
  enabled?: boolean;
  /**
   * isolates configuration for a given directly.
   * ⚠️ Warning - you will not be able to reference this kind from other workspace pacakges
   */
  /**
   * marks kind as internals disallowing references from the outside
   * Can be used to hard separate tests and code
   * requires {@see isolatedMode} setting enabled
   *
   * {@see isolatedInDirectory} are internal by default, but can be make public via this property
   */
  internal?: boolean;
  isolatedInDirectory?: string;
  /**
   * pattern to include files. Equal to tsconfig's `include` prop
   */
  include: ReadonlyArray<string>;
  /**
   * a static, non-relative version of includes. You can use it to import a particular file
   */
  import?: ReadonlyArray<string>;
  /**
   * pattern to exclude files. Equal to tsconfig's `include` prop
   */
  exclude?: ReadonlyArray<string>;
  /**
   * a static, non-relative version of includes. You can use it to ignore a particular file
   */
  ignore?: ReadonlyArray<string>;
  /**
   * additional types to use. Equal to tsconfig's `types` prop
   */
  types?: ReadonlyArray<string>;
  /**
   * particular files to include
   */
  files?: ReadonlyArray<string>;
  /**
   * An override to extends fields
   */
  extends?: string;
  /**
   * a pointer to output directly. Can be defined as a function
   * @deprecated use {@link outputDirectory} for more precise control
   */
  outDirRoot?: string | ((pkg: Package['packageJson'], currentDir: string) => string);
  /**
   * a pointer to output directly. Can be defined as a function
   */
  outputDirectory?: string | ((pkg: Package['packageJson'], currentDir: string) => string);
  /**
   * all other compiler options for a kind
   */
  compilerOptions?: CompilerOptions;
  /**
   * Sets kind to use package dependencies
   * @default true
   */
  useDependencies?: boolean;
  /**
   * Sets kind to use package dev dependencies
   * @default true
   */
  useDevDependencies?: boolean;
  /**
   * which other kinds this one can access?
   */
  references?: ReadonlyArray<string>;
  /**
   * additional references added for any reason
   */
  externals?: ReadonlyArray<string>;

  /**
   * ⚠️ advanced feature
   * allows pointing on isolated entrypoints of referenced dependencies
   * @example
   * ```tsx
   * export const relationMapper = (defaultEntry, pkg) => [
   *  // default entry, you can keep it or drop it
   *  defaultEntry,
   *  // secret aka {@see isolatedInDirectory} entry
   *  'secretEntry/tsconfig.json']
   */
  relationMapper?: RelationMapper;
}
export type ConfigurationFile = {
  /**
   * tsconfig to extend
   */
  baseConfig?: string;
  /**
   * Compiler options to add into every file
   * @deprecated - you might never need it as they are ignored by TS
   * @example - set `jsx:'react-jsx'` aid esbuild not following references
   */
  compilerOptions?: CompilerOptions;
  /**
   * confuguration of kinds to use below this point
   */
  kinds?: KindsConfigurationSet;
  /**
   * entrypoint resolver for paths generation
   */
  entrypointResolver?: EntrypointResolver;
  /**
   * activates package isolation mode, see documentation
   * This will at least create one extra tsconfig per package
   */
  isolatedMode?: boolean;
};
export type ResolvedConfiguration = {
  baseConfig: string | undefined;
  compilerOptions?: CompilerOptions;
  kinds: KindSet;
  entrypointResolver: EntrypointResolver | undefined;
  paths: ReadonlyArray<string>;
  isolatedMode?: boolean;
};
export type EntrypointResolver = (pkg: PackageJSON, currentDir: string) => ReadonlyArray<readonly [string, string]>;
export type KindSet = Record<string, Kind>;
export type KindsConfigurationResolver = (prev: KindSet, pkg: Package) => KindSet;
export type KindsConfigurationSet = KindSet | KindsConfigurationResolver;
export type KindMap = Map<string, ConfigurationFile>;
export type KindCache = ReadonlyArray<readonly [string, ConfigurationFile]>;
