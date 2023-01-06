import type { CompilerOptions } from 'typescript';

import { Package, PackageJSON } from './package-interface';

export interface Kind {
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
   */
  outDirRoot?: string | ((pkg: Package['packageJson'], currentDir: string) => string);
  /**
   * all other compiler options for a kind
   */
  compilerOptions?: CompilerOptions;
  /**
   * Sets kind to use package dependencies
   */
  useDependencies: boolean;
  /**
   * Sets kind to use package dev dependencies
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
}
export type ConfigurationFile = {
  baseConfig?: string;
  kinds?: KindsConfigurationSet;
  entrypointResolver?: EntrypointResolver;
};
export type ResolvedConfiguration = {
  baseConfig: string | undefined;
  kinds: KindSet;
  entrypointResolver: EntrypointResolver | undefined;
  paths: ReadonlyArray<string>;
};
export type EntrypointResolver = (pkg: PackageJSON, currentDir: string) => ReadonlyArray<readonly [string, string]>;
export type KindSet = Record<string, Kind>;
export type KindsConfigurationSet = KindSet | ((prev: KindSet, pkg: Package) => KindSet);
export type KindMap = Map<string, ConfigurationFile>;
export type KindCache = ReadonlyArray<readonly [string, ConfigurationFile]>;
