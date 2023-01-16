#!/usr/bin/env node
import { existsSync } from 'fs';
import { dirname, join } from 'path';

import sade from 'sade';

import { generateGlossaryLookup } from './glossary';
import { getKinds, getKindsCache } from './kinds';
import type { Package } from './package-interface';
import { getConfigLocation } from './references';
import { definePackageConfig } from './tsconfigs';
import { writeJSON } from './utils/fs';
import { globToRegExp } from './utils/glob-to-regex';
import { getRoot, getWorkspace, PackageMap } from './utils/workspace';

const program = sade('ts-referent', false).version(require('../../package.json').version);

program.command('build', 'creates references').action(async () => {
  const root = getRoot();
  const packages = await getWorkspace(root);
  const kindsCache = getKindsCache(packages, root);

  const packageMap = packages.reduce<PackageMap>((acc, pkg) => {
    acc[pkg.packageJson.name] = pkg;

    return acc;
  }, {});

  packages.forEach((pkg) => {
    const config = getKinds(kindsCache, pkg.dir, pkg);

    if (!config.paths.length) {
      throw new Error('no configuration files has been found for ' + pkg.dir);
    }

    const configLocation = getConfigLocation(root, pkg.packageJson.name);

    const configuration = definePackageConfig(config, pkg.dir, configLocation, pkg.packageJson, packageMap, (folder) =>
      existsSync(join(pkg.dir, folder))
    );

    Object.entries(configuration).forEach(([file, data]) => {
      if (data) {
        writeJSON(join(pkg.dir, file), data);
      }
    });
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
    const kindsCache = getKindsCache(packages, root);
    const targetDir = dirname(fileName);

    if (!kindsCache.length) {
      throw new Error('no top level configuration file');
    }

    const nameEx = globToRegExp(options[filterByName] || '*');
    const folderEx = globToRegExp(options[filterByFolder] || '*');

    const packageFilter = (pkg: Package) => {
      return nameEx.test(pkg.packageJson.name) && folderEx.test(pkg.dir);
    };

    writeJSON(
      fileName,
      generateGlossaryLookup(
        packages.filter(packageFilter).map((pkg) => pkg.dir),
        targetDir
      )
    );
  });

program
  .command('paths <configFileName>', 'generates lookup table for paths used in monorepo')
  .action(async (fileName) => {
    const root = getRoot();
    const packages = await getWorkspace(root);
    const kindsCache = getKindsCache(packages, root);

    writeJSON(
      fileName,
      {
        compilerOptions: {
          paths: packages.reduce<Record<string, string[]>>((acc, pkg) => {
            const { entrypointResolver, paths } = getKinds(kindsCache, pkg.dir, pkg);

            if (!paths.length) {
              throw new Error(
                'no configuration files has been found for ' +
                  pkg.dir +
                  '\n' +
                  "Start by placing `tsconfig.referent.js` at the project's root directory"
              );
            }

            [...(entrypointResolver?.(pkg.packageJson, pkg.dir) ?? []), ['', pkg.packageJson.main || '']].forEach(
              ([entry, point]) => {
                acc[`${pkg.packageJson.name}${entry}`] = [join(pkg.dir, point)];
              }
            );

            return acc;
          }, {}),
        },
      },
      '/* ⚠️ please git ignore this file as it contains absolute paths working only on your machine */'
    );
  });

program.parse(process.argv);
