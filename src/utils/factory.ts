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

export const valueOrFactoryFold = <Arguments extends unknown[], Payload extends unknown, Result extends unknown>(
  x: Payload extends () => any ? never : undefined | Payload | ((...arg: Arguments) => Payload),
  valueCall: (value: Payload) => Result,
  functionCall: (func: (...arg: Arguments) => Payload) => Result
): Result | undefined => {
  if (x === undefined) {
    return undefined;
  }

  if (typeof x === 'function') {
    // @ts-ignore
    return functionCall(x);
  }

  // @ts-ignore
  return valueCall(x);
};
