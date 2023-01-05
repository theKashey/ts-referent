type PackageExports = string | { [key: string]: PackageExports };

export interface PackageJSON {
  name: string;
  version: string;
  main?: string;
  dependencies?: { [key: string]: string };
  peerDependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
  optionalDependencies?: { [key: string]: string };
  private?: boolean;
  exports?: PackageExports;
}

export interface Package {
  dir: string;
  packageJson: PackageJSON;
}
