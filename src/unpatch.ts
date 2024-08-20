import { PatchType, Patch, patchTypes, patchedFunctions } from "./shared";

export function unpatch(patchRef: WeakRef<Patch>, hookId: symbol, type: PatchType) {
  const patch = patchRef.deref();

  if (!patch || !patch[type].delete(hookId)) return false;
  const funcParent = patch.p.deref();

  // If there are no more hooks for every type, remove the patch
  if (funcParent && patchTypes.every((t) => patch[t].size === 0)) {
    const funcName = patch.n;

    patchedFunctions.delete(funcParent[funcName]);

    // reflect defineproperty is like object defineproperty
    // but instead of erroring it returns if it worked or not.
    // this is more easily minifiable, hence its use. -- sink
    if (
      !Reflect.defineProperty(funcParent, funcName, {
        value: patch.o,
        writable: true,
        configurable: true,
      })
    )
      funcParent[funcName] = patch.o;
  }

  return true;
}