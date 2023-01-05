export const valueOrFactory = <Arguments extends unknown[], Payload extends unknown>(
  x: Payload extends () => any ? never : undefined | Payload | ((...arg: Arguments) => Payload),
  ...args: Arguments
): Payload | undefined => {
  if (typeof x === 'function') {
    return x(...args);
  }

  // @ts-ignore
  return x;
};
