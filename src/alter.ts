import { Package } from './package-interface';
import { Kind, KindsConfigurationResolver, KindSet } from './types';
import { valueOrFactory } from './utils/factory';

type PartialKind = Partial<Kind>;
type AddedKind = Kind & {
  /**
   * changes alternate mode from `alter` to `create`
   */
  expectExtension: false;
};
type PartialKindSet = Record<string, PartialKind | null | AddedKind>;

type AlterOptions = {
  /**
   * removes kinds which are not part of a local response
   * @default false
   */
  disableUnmatchedKinds?: boolean;
};

/**
 * alters kinds configuration merging result with the kids defined above
 * @param kinds
 */
export const alter = (
  kinds: PartialKindSet | ((currentParent: Package, currentKinds: KindSet) => PartialKindSet),
  options: AlterOptions = {}
): {
  kinds: KindsConfigurationResolver;
} => {
  return {
    kinds: (base, currentPackage) => {
      const amendments = valueOrFactory(kinds, currentPackage, base) || {};
      const knownTypes = new Set([...Object.keys(base), ...Object.keys(amendments)]);
      const result: KindSet = {};

      knownTypes.forEach((name) => {
        const amendment = amendments[name];

        if (amendment) {
          if ('expectExtension' in amendment) {
            if (base[name]) {
              console.log('error at', currentPackage.dir);
              throw new Error('Extended to create new kind, while previous found: ' + name);
            }
          } else {
            if (!base[name]) {
              console.log('error at', currentPackage.dir);
              throw new Error('Could not alter non-existing kind ' + name);
            }
          }
        }

        const source: Kind = base[name] || {};

        if (amendment === null || (options.disableUnmatchedKinds && !amendment)) {
          result[name] = Object.assign({}, source, { enabled: false });

          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
          // @ts-expect-error
          expectExtension,
          ...alternate
        } = amendment || {};
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
