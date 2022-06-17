export const timeout = (ms: number): Promise<any> => {
  return new Promise(resolve => setTimeout(() => resolve('timeout'), ms));
}

export const promiseTimeout = async (
  promisesArray: () => Promise<any>,
  timeoutInMilliseconds: number,
  callback?: (value: any) => void,
  onError?: () => void
) => {
  try {
    const value = await Promise.race([
      promisesArray(),
      timeout(timeoutInMilliseconds)
    ]);
    if (callback) {
      return callback(value);
    }
    return value;
  } catch {
    if (onError) {
      return onError();
    }
  }
};
