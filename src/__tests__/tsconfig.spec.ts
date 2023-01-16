import { definePackageConfig } from '../tsconfigs';
import { writeJSON } from '../utils/fs';

jest.mock('../utils/fs');

beforeEach(() => jest.resetAllMocks());

test('definePackageConfig throws on incomplete configuration', () => {
  expect(() =>
    definePackageConfig(
      {
        kinds: {},
        paths: ['file-1'],
        baseConfig: 'tsconfig.js',
        entrypointResolver: () => [],
      },
      '/user/x',
      '/user/x/.reference',
      {} as any,
      {},
      () => true
    )
  ).toThrow();

  expect(() =>
    definePackageConfig(
      {
        kinds: { x: {} as any },
        paths: ['file-1'],
        baseConfig: undefined,
        entrypointResolver: () => [],
      },
      '/user/x',
      '/user/x/.reference',
      {} as any,
      {},
      () => true
    )
  ).toThrow();
});

describe('definePackageConfig output generation', () => {
  test('single kind', () => {
    expect(
      definePackageConfig(
        {
          kinds: { x: { include: [], useDependencies: true } },
          paths: ['file-1'],
          baseConfig: '/user/x/tsconfig.js',
          entrypointResolver: () => [],
        },
        '/user/x',
        '/user/x/.reference',
        { dependencies: { y: '1', z: 2 } } as any,
        { y: { dir: '/user/package/y', packageJson: {} as any } },
        () => true
      )
    ).toMatchInlineSnapshot(`
          Object {
            "tsconfig.json": Object {
              "compilerOptions": Object {
                "baseUrl": ".",
                "composite": true,
                "noEmit": false,
                "tsBuildInfoFile": ".reference/.cache/main-reference",
                "types": Array [],
              },
              "exclude": Array [],
              "extends": "./tsconfig.js",
              "include": Array [],
              "references": Array [
                Object {
                  "path": ".reference/config/tsconfig.x.json",
                },
              ],
            },
          }
      `);

    expect(writeJSON).toHaveBeenCalledWith('/user/x/.reference/config/tsconfig.x.json', {
      compilerOptions: {
        baseUrl: '../..',
        composite: true,
        noEmit: false,
        outDir: '../output/x',
        rootDir: '../..',
        tsBuildInfoFile: '../.cache/x',
        types: undefined,
      },
      exclude: [],
      extends: '../../tsconfig.json',
      files: undefined,
      include: [],
      references: [
        {
          path: '../../../package/y/tsconfig.json',
        },
      ],
    });
  });

  test('isolated kind', () => {
    const kind = definePackageConfig(
      {
        kinds: {
          x: { include: ['these.files'], useDependencies: true, isolatedInDirectory: 'nested' },
          y: { include: ['these.files'], useDependencies: true, isolatedInDirectory: 'not-existing' },
        },
        paths: ['file-1'],
        baseConfig: '/user/x/tsconfig.js',
        entrypointResolver: () => [],
      },
      '/user/x',
      '/user/x/.reference',
      { dependencies: { y: '1', z: 2 } } as any,
      { y: { dir: '/user/package/y', packageJson: {} as any } },
      (folder) => folder == 'nested'
    );

    expect(kind['tsconfig.json']).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "baseUrl": ".",
          "composite": true,
          "noEmit": false,
          "tsBuildInfoFile": ".reference/.cache/main-reference",
          "types": Array [],
        },
        "exclude": Array [],
        "extends": "./tsconfig.js",
        "include": Array [],
        "references": Array [
          Object {
            "path": ".reference/config/tsconfig.x.json",
          },
        ],
      }
    `);

    expect(kind['nested/tsconfig.json']).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "baseUrl": ".",
          "composite": true,
          "noEmit": false,
          "tsBuildInfoFile": ".reference/.cache/main-reference",
          "types": Array [],
        },
        "exclude": Array [],
        "extends": "./tsconfig.json",
        "include": Array [],
        "references": Array [
          Object {
            "path": ".reference/config/tsconfig.x.json",
          },
        ],
      }
    `);

    expect(writeJSON).toHaveBeenCalledWith('/user/x/.reference/config/tsconfig.x.json', {
      compilerOptions: {
        baseUrl: '../../nested',
        composite: true,
        noEmit: false,
        outDir: '../output/x',
        rootDir: '../../nested',
        tsBuildInfoFile: '../.cache/x',
        types: undefined,
      },
      exclude: [],
      extends: '../../nested/tsconfig.json',
      files: undefined,
      include: ['../../nested/these.files'],
      references: [
        {
          // should point to the nested directory
          path: '../../../package/y/tsconfig.json',
        },
      ],
    });
  });

  test('full isolated mode', () => {
    const result = definePackageConfig(
      {
        kinds: {
          x: { include: [], useDependencies: true, internal: true },
          y: { include: [], useDependencies: true },
          z: { include: ['xy.z'], useDependencies: true, isolatedInDirectory: 'tests' },
        },
        paths: ['file-1'],
        baseConfig: '/user/x/tsconfig.js',
        isolatedMode: true,
        entrypointResolver: () => [],
      },
      '/user/x',
      '/user/x/.reference',
      { dependencies: { y: '1', z: 2 } } as any,
      { y: { dir: '/user/package/y', packageJson: {} as any } },
      () => true
    );
    expect(Object.keys(result)).toEqual(['tests/tsconfig.json', 'tsconfig.public.json', 'tsconfig.json']);

    expect(result['tsconfig.json']!.references).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": ".reference/config/tsconfig.y.json",
        },
        Object {
          "path": ".reference/config/tsconfig.x.json",
        },
        Object {
          "path": ".reference/config/tsconfig.z.json",
        },
      ]
    `);

    expect(result['tsconfig.public.json']!.references).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": ".reference/config/tsconfig.y.json",
        },
      ]
    `);

    expect(result['tests/tsconfig.json']!.references).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": ".reference/config/tsconfig.z.json",
        },
      ]
    `);
  });

  test('full isolated mode local config', () => {
    definePackageConfig(
      {
        kinds: {
          z: { include: ['xy.z'] },
        },
        paths: ['file-1'],
        baseConfig: '/user/x/tsconfig.js',
        isolatedMode: true,
        entrypointResolver: () => [],
      },
      '/user/x',
      '/user/x/.reference',
      { dependencies: { y: '1', z: 2 } } as any,
      { y: { dir: '/user/package/y', packageJson: {} as any } },
      () => true
    );

    expect(writeJSON).toHaveBeenLastCalledWith(
      '/user/x/.reference/config/tsconfig.z.json',
      expect.objectContaining({
        references: [
          {
            path: '../../../package/y/tsconfig.public.json',
          },
        ],
      })
    );
  });
});

describe('reference remapper', () => {
  test('maps to internal endpoint', () => {
    definePackageConfig(
      {
        kinds: { x: { include: [], useDependencies: true, relationMapper: (name, pkg) => [name, pkg.name] } },
        paths: ['file-1'],
        baseConfig: '/user/x/tsconfig.js',
        entrypointResolver: () => [],
      },
      '/user/x',
      '/user/x/.reference',
      { dependencies: { y: '1', z: 2 } } as any,
      { y: { dir: '/user/package/y', packageJson: { name: 'pkgName' } as any } },
      () => true
    );

    expect(writeJSON).toHaveBeenCalledWith('/user/x/.reference/config/tsconfig.x.json', {
      compilerOptions: {
        baseUrl: '../..',
        composite: true,
        noEmit: false,
        outDir: '../output/x',
        rootDir: '../..',
        tsBuildInfoFile: '../.cache/x',
        types: undefined,
      },
      exclude: [],
      extends: '../../tsconfig.json',
      files: undefined,
      include: [],
      references: [
        {
          path: '../../../package/y/tsconfig.json',
        },
        {
          path: '../../../package/y/pkgName',
        },
      ],
    });
  });
});
