import { patchedObjects, PatchType, patchTypes } from "./shared";

export function unpatch(
  funcParent: any,
  funcName: string,
  hookId: symbol,
  type: PatchType
) {
  const patchedObject = patchedObjects.get(funcParent);
  const patch = patchedObject?.[funcName];

  if (!patch?.[type].has(hookId)) return false;

  patch[type].delete(hookId);

  // If there are no more hooks for every type, remove the patch
  if (patchTypes.every((t) => patch[t].size === 0)) {
    // reflect defineproperty is like object defineproperty
    // but instead of erroring it returns if it worked or not.
    // this is more easily minifiable, hence its use. -- sink
    const success = Reflect.defineProperty(funcParent, funcName, {
      value: patch.o,
      writable: true,
      configurable: true,
    });

    if (!success) funcParent[funcName] = patch.o;

    delete patchedObject[funcName];
  }
  
  if (Object.keys(patchedObject).length == 0) patchedObjects.delete(funcParent);

  return true;
}

export function unpatchAll() {
  for (const [parentObject, patchedObject] of patchedObjects.entries())
    for (const funcName in patchedObject)
      for (const hookType of patchTypes)
        for (const hookId of patchedObject[funcName]?.[hookType].keys() ?? [])
          unpatch(parentObject, funcName, hookId, hookType);
}
