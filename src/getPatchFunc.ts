// curried - getPatchFunc("before")(...)
// allows us to apply an argument while leaving the rest open much cleaner.
// functional programming strikes again! -- sink

import hook from "./hook";
import { patchedObjects, PatchType } from "./shared";
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
      patchedObjects.set(funcParent, {});

    const parentInjections = patchedObjects.get(funcParent);
    
    if (!parentInjections[funcName]) {
      const origFunc = funcParent[funcName];
      
      parentInjections[funcName] = {
        origFunc,
        hooks: {
          before: new Map(),
          instead: new Map(),
          after: new Map(),
        },
      };

      const replaceProxy = new Proxy(origFunc, {
        apply(_, thisArg, args) {
          const retVal = hook(
            funcName,
            funcParent,
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

    const hookId = Symbol("SPITROAST_HOOK");
    const unpatchThisPatch = () => unpatch(funcParent, funcName, hookId, patchType);

    parentInjections[funcName].hooks[patchType].set(hookId, callback);

    return unpatchThisPatch;
  };
