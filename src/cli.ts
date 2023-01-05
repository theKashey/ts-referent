#!/usr/bin/env node
import { dirname, join, relative } from 'path';

import { Package } from '@manypkg/get-packages';
import sade from 'sade';

import { getKinds, getKindsCache } from './kinds';
import { defineReference } from './references';
import { writeJSON } from './utils/fs';
import { globToRegExp } from './utils/glob-to-regex';
import { getRoot, getWorkspace, PackageMap } from './utils/workspace';

const program = sade('ts-referent', false).version(require('../../package.json').version);

program.command('build', 'creates references').action(async () => {
  const root = getRoot();
  const packages = await getWorkspace(root);
  const kindsCache = getKindsCache(packages, root);

  const packageMap = packages.reduce<PackageMap>((acc, pkg) => {
    acc[pkg.packageJson.name] = pkg.dir;

    return acc;
  }, {});

  packages.forEach((pkg) => {
    const { kinds, paths, ...conf } = getKinds(kindsCache, pkg.dir, pkg);

    if (!paths.length) {
      throw new Error('no configuration files has been found for ' + pkg.dir);
    }

    if (!conf.baseConfig) {
      throw new Error(
        'base `baseConfig` is not defined for ' + pkg.dir + '. Configuration files used: ' + paths.join(',')
      );
    }

    if (!kinds || Object.keys(kinds).length === 0) {
      throw new Error(
        'kinds configuration is missing for ' + pkg.dir + '. Configuration files used: ' + paths.join(',')
      );
    }

    const configuration = {
      extends: relative(pkg.dir, conf.baseConfig),
      include: [],
      exclude: [],
      references: Object.keys(kinds).map((kind) => ({
        path: relative(pkg.dir, defineReference(root, kind, kinds[kind], pkg, packageMap)),
      })),
      compilerOptions: {
        composite: true,
        noEmit: false,
      },
    };
    const pkgConfig = join(pkg.dir, 'tsconfig.json');
    writeJSON(pkgConfig, configuration);
  });
});

const filterByName = 'filter-by-name';
const filterByFolder = 'filter-by-folder';

program
  .command('glossary <configFileName>', 'generates glossary for all packages in the monorepo')
  .option(`--${filterByName}`, 'filter packages by name')
  .option(`--${filterByFolder}`, 'filter packages by folder')
  // .option(`--composite`,'marks generated file as composite')
  .action(async (fileName, options) => {
    const root = getRoot();
    const packages = await getWorkspace(root);
    const targetDir = dirname(fileName);

    const nameEx = globToRegExp(options[filterByName] || '*');
    const folderEx = globToRegExp(options[filterByFolder] || '*');

    const packageFilter = (pkg: Package) => {
      return nameEx.test(pkg.packageJson.name) && folderEx.test(pkg.dir);
    };

    writeJSON(fileName, {
      files: [],
      compilerOptions: {
        composite: true,
      },
      references: packages.filter(packageFilter).map((pkg) => ({ path: relative(targetDir, pkg.dir) })),
    });
  });

program.command('paths <configFileName>', 'generates glossary for paths used in monorepo').action(async (fileName) => {
  const root = getRoot();
  const packages = await getWorkspace(root);
  const kindsCache = getKindsCache(packages, root);

  writeJSON(fileName, {
    compilerOptions: {
      paths: packages.reduce<Record<string, string[]>>((acc, pkg) => {
        const { entrypointResolver } = getKinds(kindsCache, pkg.dir, pkg);

        [...(entrypointResolver?.(pkg.packageJson, pkg.dir) ?? []), ['', '']].forEach(([entry, point]) => {
          acc[`${pkg.packageJson.name}${entry}`] = [join(pkg.dir, point)];
        });

        return acc;
      }, {}),
    },
  });
});

program.parse(process.argv);
