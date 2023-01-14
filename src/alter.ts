import { Package } from './package-interface';
import { Kind, KindsConfigurationResolver, KindSet } from './types';
import { valueOrFactory } from './utils/factory';

type PartialKind = Partial<Kind>;
type PartialKindSet = Record<string, PartialKind | null>;

type AlterOptions = {
  /**
   * removes kinds which are not part of a local response
   */
  disableUnmatchedKinds?: boolean;
};

/**
 * alters kinds configuration merging result with the kids defined above
 * @param kinds
 */
export const alter = (
  kinds: PartialKindSet | ((currentParent: Package) => PartialKindSet),
  options: AlterOptions = {}
): {
  kinds: KindsConfigurationResolver;
} => {
  return {
    kinds: (base, currentPackage) => {
      const amendment = valueOrFactory(kinds, currentPackage) || {};
      const knownTypes = new Set([...Object.keys(base), ...Object.keys(amendment)]);
      const result: KindSet = {};

      knownTypes.forEach((name) => {
        const source: Kind = base[name];

        if (!source) {
          throw new Error('could not alter non-existing kind ' + name);
        }

        if (amendment[name] === null || (options.disableUnmatchedKinds && !amendment[name])) {
          result[name] = Object.assign({}, source, { enabled: false });

          return;
        }

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
