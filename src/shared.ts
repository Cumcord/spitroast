export type PatchType = "after" | "before" | "instead";

export type Patch = {
  origFunc: Function;
  funcName: string;
  funcParent: any;
  hooks: {
    after: Map<symbol, Function>;
    before: Map<symbol, Function>;
    instead: Map<symbol, Function>;
  };
};

export const patches = new Map<symbol, Patch>();
export const patchedObjects = new WeakMap<any, Map<string, any>>();
