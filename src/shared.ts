export type PatchType = "after" | "before" | "instead";

export type Patch = {
  origFunc: Function;
  hooks: {
    after: Map<symbol, Function>;
    before: Map<symbol, Function>;
    instead: Map<symbol, Function>;
  };
};

interface PatchedObject {
  [funcName: string]: Patch;
}

export const patchedObjects = new Map<object, PatchedObject>();