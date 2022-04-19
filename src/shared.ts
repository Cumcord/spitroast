export type PatchType = "a" | "b" | "i";

// we use this array multiple times
export const patchTypes: PatchType[] = ["a", "b", "i"];

export type Patch = {
  // original function
  o: Function;
  // after hooks
  a: Map<symbol, Function>;
  // before hooks
  b: Map<symbol, Function>;
  // instead hooks
  i: Map<symbol, Function>;
};

interface PatchedObject {
  [funcName: string]: Patch;
}

export const patchedObjects = new Map<object, PatchedObject>();
