import { Package } from '@manypkg/get-packages';
import type { CompilerOptions } from 'typescript';

export type Kind = {
  /**
   * pattern to include files. Equal to tsconfig's `include` prop
   */
  include: string[];
  /**
   * a static, non-relative version of includes. You can use it to import a particular file
   */
  imports?: string[];
  /**
   * pattern to exclude files. Equal to tsconfig's `include` prop
   */
  exclude?: string[];
  /**
   * a static, non-relative version of includes. You can use it to ignore a particular file
   */
  ignores?: string[];
  /**
   * additional types to use. Equal to tsconfig's `types` prop
   */
  types?: string[];
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
};

export type ConfigurationFile = {
  extends?: string;
  kinds?: KindSet;
  entrypointResolver?: (pkg: Package['packageJson'], currentDir: string) => [string, string][];
};

export type KindSet = Record<string, Kind>;
export type KindMap = Map<string, ConfigurationFile>;
export type KindCache = ReadonlyArray<[string, ConfigurationFile]>;
