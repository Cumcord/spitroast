// the function that is actually injected into patched functions

import { patchedObjects } from "./shared";

// calls all relevant patches
export default function (
  funcName: string,
  funcParent: any,
  originalArgs: unknown[],
  // the value of `this` to apply
  ctxt: any,
  // if true, the function is actually constructor
  isConstruct: boolean
) {
  let patch = patchedObjects.get(funcParent)?.[funcName];
  
  // This is in the event that this function is being called after all patches are removed.
  if (!patch)
    return isConstruct
      ? Reflect.construct(funcParent[funcName], originalArgs, ctxt)
      : funcParent[funcName].apply(ctxt, originalArgs);

  const hooks = patch.hooks;
  let newArgs = originalArgs;

  // Before patches
  for (const hook of hooks.before.values()) {
    const maybeNewArgs = hook.call(ctxt, newArgs);
    if (Array.isArray(maybeNewArgs)) newArgs = maybeNewArgs;
  }

  // Instead patches
  let insteadPatchedFunc = (...args: unknown[]) =>
    isConstruct
      ? Reflect.construct(patch.origFunc, args, ctxt)
      : patch.origFunc.apply(ctxt, args);

  for (const callback of hooks.instead.values()) {
    const oldPatchFunc = insteadPatchedFunc;

    insteadPatchedFunc = (...args) =>
      callback.apply(ctxt, [args, oldPatchFunc]);
  }

  let workingRetVal = insteadPatchedFunc(...newArgs);

  // After patches
  for (const hook of hooks.after.values()) {
    const maybeRet = hook.call(ctxt, newArgs, workingRetVal);

    if (maybeRet !== undefined) workingRetVal = maybeRet;
  }

  return workingRetVal;
}
