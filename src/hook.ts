// calls relevant patches and returns the final result
import { patchedFunctions } from "./shared";

export default function (
  patchedFunc: Function,
  origFunc: Function,
  funcArgs: unknown[],
  // the value of `this` to apply
  ctxt: any,
  // if true, the function is actually constructor
  isConstruct: boolean
) {
  const patch = patchedFunctions.get(patchedFunc);

  if (!patch)
    return isConstruct
      ? Reflect.construct(origFunc, funcArgs, ctxt)
      : origFunc.apply(ctxt, funcArgs);

  // Before patches
  for (const hook of patch.b.values()) {
    const maybefuncArgs = hook.call(ctxt, funcArgs);
    if (Array.isArray(maybefuncArgs)) funcArgs = maybefuncArgs;
  }

  // Instead patches
  let workingRetVal = [...patch.i.values()].reduce(
    (prev, current) =>
      (...args: unknown[]) =>
        current.call(ctxt, args, prev),
    // This calls the original function
    (...args: unknown[]) =>
      isConstruct
        ? Reflect.construct(patch.o, args, ctxt)
        : patch.o.apply(ctxt, args)
  )(...funcArgs);

  // After patches
  for (const hook of patch.a.values())
    workingRetVal = hook.call(ctxt, funcArgs, workingRetVal) ?? workingRetVal;

  // Cleanups (one-times)
  patch.c.forEach((c) => c());
  patch.c = [];

  return workingRetVal;
}
