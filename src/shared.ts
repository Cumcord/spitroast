export type PatchType = "a" | "b" | "i";

export type PatchTypeToCallbackMap<F extends AnyFunction> = {
  a: (args: Parameters<F>, ret: ReturnType<F>) => ReturnType<F>;
  b: (args: Parameters<F>) => ReturnType<F>;
  i: (args: Parameters<F>, origFunc: F) => ReturnType<F>;
}

// we use this array multiple times
export const patchTypes: PatchType[] = ["a", "b", "i"];

export type Patch = {
  // function name
  n: string;
  // original function
  o: AnyFunction;
  // WeakRef to parent object
  p: WeakRef<any>;
  // cleanups
  c: AnyFunction[];
  // after hooks
  a: Map<symbol, AnyFunction>;
  // before hooks
  b: Map<symbol, AnyFunction>;
  // instead hooks
  i: Map<symbol, AnyFunction>;
};

export type AnyFunction = (...args: any[]) => any;

export type KeysWithFunctionValues<T extends AnyObject> = {
  [K in Extract<keyof T, string>]: T[K] extends AnyFunction ? K : never
}[Extract<keyof T, string>];

export type AnyObject = Record<any, any>;

export let patchedFunctions: WeakMap<AnyFunction, Patch>;
export let resetPatches = () =>
  (patchedFunctions = new WeakMap<AnyFunction, Patch>());

// Manual minification is funny
resetPatches();
