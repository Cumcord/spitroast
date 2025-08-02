export type PatchType = "a" | "b" | "i";

// we use this array multiple times
export const patchTypes: PatchType[] = ["a", "b", "i"];

export type Patch = {
  // function name
  n: PropertyKey;
  // original function
  o: Function;
  // WeakRef to parent object
  p: WeakRef<any>;
  // cleanups
  c: Function[];
  // after hooks
  a: Map<symbol, Function>;
  // before hooks
  b: Map<symbol, Function>;
  // instead hooks
  i: Map<symbol, Function>;
};

export let patchedFunctions: WeakMap<Function, Patch>;
export let resetPatches = () =>
  (patchedFunctions = new WeakMap<Function, Patch>());

// Manual minification is funny
resetPatches();
