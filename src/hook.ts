// calls relevant patches and returns the final result
import { patchedFunctions } from "./shared";

export default function (
  patchedFunc: Function,
  origFunc: Function,
  funcArgs: unknown[],
  // the value of `this` to apply
  ctxt: any
) {
  const patch = patchedFunctions.get(patchedFunc);

  if (!patch) return origFunc(...funcArgs);

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
    origFunc
  )(...funcArgs);

  // After patches
  for (const hook of patch.a.values())
    workingRetVal = hook.call(ctxt, funcArgs, workingRetVal) ?? workingRetVal;

  // Cleanups (one-times)
  for (const cleanup of patch.c) cleanup();
  patch.c = [];

  return workingRetVal;
}
