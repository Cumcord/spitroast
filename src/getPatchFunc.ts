// curried - getPatchFunc("before")(...)
// allows us to apply an argument while leaving the rest open much cleaner.
// functional programming strikes again! -- sink

import hook from "./hook";
import { patchedObjects, patches, PatchType } from "./shared";
import { unpatch } from "./unpatch";

// creates a hook if needed, else just adds one to the patches array
export default <CallbackType extends Function>(patchType: PatchType) =>
  (
    funcName: string,
    funcParent: any,
    callback: CallbackType,
    oneTime = false
  ) => {
    if (typeof funcParent[funcName] !== "function")
      throw new Error(
        `${funcName} is not a function in ${funcParent.constructor.name}`
      );

    if (!patchedObjects.has(funcParent))
      patchedObjects.set(funcParent, new Map());

    const parentInjections = patchedObjects.get(funcParent);

    if (!parentInjections.has(funcName))
      parentInjections.set(funcName, Symbol("SPITROAST_PATCH_ID"));

    const patchId = parentInjections.get(funcName);
    const unpatchThisPatch = () => unpatch(patchId, hookId, patchType);

    if (!patches.has(patchId)) {
      const origFunc = funcParent[funcName];

      patches.set(patchId, {
        origFunc,
        funcParent,
        funcName,
        hooks: {
          before: new Map(),
          instead: new Map(),
          after: new Map(),
        },
      });

      const replaceProxy = new Proxy(origFunc, {
        apply(_, thisArg, args) {
          const retVal = hook(
            funcName,
            funcParent,
            patchId,
            args,
            thisArg,
            false
          );

          if (oneTime) unpatchThisPatch();

          return retVal;
        },

        construct(_, args) {
          const retVal = hook(
            funcName,
            funcParent,
            patchId,
            args,
            origFunc,
            true
          );

          if (oneTime) unpatchThisPatch();

          return retVal;
        },

        get(target, prop, receiver) {
          // yes it is weird to pass args to toString, but i figure we should accurately polyfill the behavior
          if (prop == "toString")
            return (...args: unknown[]) => origFunc.toString(...args);

          return Reflect.get(target, prop, receiver);
        },
      });

      // see comment in unpatch.ts
      const success = Reflect.defineProperty(funcParent, funcName, {
        value: replaceProxy,
        configurable: true,
        writable: true,
      });

      if (!success) funcParent[funcName] = replaceProxy;
    }

    // cannot be inlined, used inside unpatchThisPatch
    const hookId = Symbol("SPITROAST_HOOK_ID");
    patches.get(patchId)?.hooks[patchType].set(hookId, callback);

    return unpatchThisPatch;
  };
