import type { CompilerOptions } from 'typescript';

import { Package, PackageJSON } from './package-interface';

export interface Kind {
  /**
   * pattern to include files. Equal to tsconfig's `include` prop
   */
  include: string[];
  /**
   * a static, non-relative version of includes. You can use it to import a particular file
   */
  import?: string[];
  /**
   * pattern to exclude files. Equal to tsconfig's `include` prop
   */
  exclude?: string[];
  /**
   * a static, non-relative version of includes. You can use it to ignore a particular file
   */
  ignore?: string[];
  /**
   * additional types to use. Equal to tsconfig's `types` prop
   */
  types?: string[];

  /**
   * particular files to include
   */
  files?: string[];
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
  references?: string[];
  /**
   * additional references added for any reason
   */
  externals?: string[];
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
  paths: string[];
};

export type EntrypointResolver = (pkg: PackageJSON, currentDir: string) => [string, string][];
export type KindSet = Record<string, Kind>;
export type KindsConfigurationSet = KindSet | ((prev: KindSet, pkg: Package) => KindSet);
export type KindMap = Map<string, ConfigurationFile>;
export type KindCache = ReadonlyArray<[string, ConfigurationFile]>;
