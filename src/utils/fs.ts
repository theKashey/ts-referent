import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export const writeJSON = (file: string, payload: any, comment = '') => {
  try {
    mkdirSync(dirname(file), { recursive: true });
  } catch (e) {
    // suppress
  }

  const content =
    '/* this file was generated by ts-referent. Do not edit */\n' +
    comment +
    '\n' +
    JSON.stringify(payload, null, 2) +
    // add a new line at the end to emulate prettier
    '\n';

  if (existsSync(file) && readFileSync(file, 'utf8') === content) {
    return;
  }

  writeFileSync(file, content);
};
