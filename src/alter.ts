import { Package } from './package-interface';
import { ConfigurationFile, Kind, KindSet } from './types';
import { valueOrFactory } from './utils/factory';

type PartialKind = Partial<Kind>;
type PartialKindSet = Record<string, PartialKind>;

export const alter = (kinds: PartialKindSet | ((currentParent: Package) => PartialKindSet)): ConfigurationFile => {
  return {
    kinds: (base, currentPackage) => {
      const amendment = valueOrFactory(kinds, currentPackage) || {};
      const knownTypes = new Set([...Object.keys(base), ...Object.keys(amendment)]);
      const result: KindSet = {};

      knownTypes.forEach((name) => {
        const source: PartialKind = base[name] || {};
        const alternate: PartialKind = amendment[name] || {};
        // spread array based configurations together
        const types = [...(source.types || []), ...(alternate.types || [])];
        const references = [...(source.references || []), ...(alternate.references || [])];
        const include = [...(source.include || []), ...(alternate.include || [])];
        const imports = [...(source.import || []), ...(alternate.import || [])];
        const exclude = [...(source.exclude || []), ...(alternate.exclude || [])];
        const ignore = [...(source.ignore || []), ...(alternate.ignore || [])];
        const files = [...(source.files || []), ...(alternate.files || [])];
        const externals = [...(source.externals || []), ...(alternate.externals || [])];
        const compilerOptions = { ...(source.compilerOptions || {}), ...(alternate.compilerOptions || {}) };

        const mixin: Partial<Kind> = {
          types,
          references,
          include,
          exclude,
          import: imports,
          ignore,
          files,
          externals,
          compilerOptions,
        };

        result[name] = Object.assign({}, source, alternate, mixin) as Kind;
      });

      return result;
    },
  };
};
