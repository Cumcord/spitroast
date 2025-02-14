// curried - getPatchFunc("before")(...)
// allows us to apply an argument while leaving the rest open much cleaner.
// functional programming strikes again! -- sink

import hook from "./hook";
import {
  AnyObject,
  KeysWithFunctionValues,
  PatchType,
  PatchTypeToCallbackMap,
  patchedFunctions,
} from "./shared";
import { unpatch } from "./unpatch";

// creates a hook if needed, else just adds one to the patches array
export default <T extends PatchType>(patchType: T) =>
  <Name extends KeysWithFunctionValues<Parent>, Parent extends AnyObject>(
    funcName: Name,
    funcParent: Parent,
    callback: PatchTypeToCallbackMap<Parent[Name]>[T],
    oneTime = false
  ) => {
    let origFunc = funcParent[funcName];

    if (typeof origFunc !== "function")
      throw new Error(
        `${funcName} is not a function in ${funcParent.constructor.name}`
      );

    let funcPatch = patchedFunctions.get(origFunc);

    if (!funcPatch) {
      funcPatch = {
        n: funcName,
        o: origFunc,
        p: new WeakRef(funcParent),
        c: [],
        b: new Map(),
        i: new Map(),
        a: new Map(),
      };

      const replaceProxy = new Proxy(origFunc, {
        apply: (_, ctxt, args) => runHook(ctxt, args, false),
        construct: (_, args) => runHook(origFunc, args, true),

        get: (target, prop, receiver) =>
          prop == "toString"
            ? origFunc.toString.bind(origFunc)
            : Reflect.get(target, prop, receiver),
      });

      const runHook: any = (ctxt: any, args: unknown[], construct: boolean) =>
        hook(
          replaceProxy,
          (...args) =>
            construct
              ? Reflect.construct(origFunc, args, ctxt)
              : origFunc.apply(ctxt, args),
          args,
          ctxt
        );

      patchedFunctions.set(replaceProxy, funcPatch);

      if (
        !Reflect.defineProperty(funcParent, funcName, {
          value: replaceProxy,
          configurable: true,
          writable: true,
        })
      )
        funcParent[funcName] = replaceProxy;
    }

    const hookId = Symbol();
    const funcPatchRef = new WeakRef(funcPatch);
    const unpatchThisPatch = () => unpatch(funcPatchRef, hookId, patchType);

    if (oneTime) funcPatch.c.push(unpatchThisPatch);
    funcPatch[patchType].set(hookId, callback);

    return unpatchThisPatch;
  };
