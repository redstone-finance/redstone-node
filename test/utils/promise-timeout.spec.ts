import { promiseTimeout } from "../../src/utils/promise-timeout";

describe("promiseTimeout", () => {
  test("should returns resolved value", async () => {
    const resolvedPromise = () => Promise.resolve("I am resolved");
    const resolvedValue = await promiseTimeout(() => resolvedPromise(), 0);
    expect(resolvedValue).toBe("I am resolved");
  });

  test("should return timeout string", async () => {
    const promise = () => new Promise(resolve => setTimeout(() => resolve('timeout'), 1));
    const resolvedValue = await promiseTimeout(() => promise(), 0);
    expect(resolvedValue).toBe("timeout");
  });

  test("should call callback when resolved", async () => {
    const resolvedPromise = () => Promise.resolve("I am resolved");
    let callbackValue = "";
    const callback = (resolveValue: string) => {
      callbackValue = resolveValue
    };
    await promiseTimeout(resolvedPromise, 0, callback);
    expect(callbackValue).toBe("I am resolved");
  });

  test("should call callback when timeout", async () => {
    const promise = () => new Promise(resolve => setTimeout(() => resolve('timeout'), 1));
    let callbackValue = "";
    const callback = (resolveValue: string) => {
      callbackValue = resolveValue
    };
    await promiseTimeout(() => promise(), 0, callback);
    expect(callbackValue).toBe("timeout");
  });

  test("should call onError if promise rejected", async () => {
    const rejectPromise = () => Promise.reject("Error");
    let errorValue = "";
    const onError = () => {
      errorValue = "Rejected promise"
    };
    await promiseTimeout(() => rejectPromise(), 0, () => { }, onError);
    expect(errorValue).toBe("Rejected promise");
  });
});
