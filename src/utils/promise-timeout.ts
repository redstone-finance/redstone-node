export class TimeoutError extends Error {
  constructor() {
    super();
    this.name = "TimeoutError";
    this.message = "TimeoutError";
  }
}

export const timeout = (ms: number): Promise<any> => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new TimeoutError()), ms)
  );
};

export const promiseTimeout = async (
  promisesArray: () => Promise<any>,
  timeoutInMilliseconds: number
) => {
  return await Promise.race([promisesArray(), timeout(timeoutInMilliseconds)]);
};
