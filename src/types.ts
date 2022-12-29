import { Package } from '@manypkg/get-packages';
import type { CompilerOptions } from 'typescript';

export type Kind = {
  test?: (pkg: Package['packageJson']) => boolean;
  include: string[];
  exclude?: string[];
  types?: string[];
  imports?: string[];
  extends?: string;
  outDirRoot?: string | ((pkg: Package['packageJson'], currentDir: string) => string);
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
