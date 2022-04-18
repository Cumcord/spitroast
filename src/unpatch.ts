import { patchedObjects, patches, PatchType } from "./shared";

export function unpatch(patchId: symbol, hookId: symbol, type: PatchType) {
  const patch = patches.get(patchId);

  if (!patch) return false;

  const hooks = patch.hooks;

  if (!hooks[type].has(hookId)) return false;

  hooks[type].delete(hookId);

  const patchIdMap = patchedObjects.get(patch.funcParent);

  // If there are no more hooks for every type, remove the patch
  const types: PatchType[] = ["after", "before", "instead"];

  if (types.every((t) => hooks[t].size === 0)) {
    // reflect defineproperty is like object defineproperty
    // but instead of erroring it returns if it worked or not.
    // this is more easily minifiable, hence its use. -- sink
    const success = Reflect.defineProperty(patch.funcParent, patch.funcName, {
      value: patch.origFunc,
      writable: true,
      configurable: true,
    });

    if (!success) patch.funcParent[patch.funcName] = patch.origFunc;

    patchIdMap.delete(patch.funcName);
    patches.delete(patchId);
  }

  if (patchIdMap.size === 0) patchedObjects.delete(patch.funcParent);

  return true;
}

export function unpatchAll() {
  for (const [patch, patchHook] of patches.entries())
    for (const type of ["after", "before", "instead"] as PatchType[])
      for (const hook of patchHook.hooks[type].keys())
        unpatch(patch, hook, type);
}
