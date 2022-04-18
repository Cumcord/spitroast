import getPatchFunc from "./getPatchFunc.js";
import { unpatchAll } from "./unpatch.js";
import { patches, patchedObjects } from "./shared.js";

const before = getPatchFunc("before");
const instead = getPatchFunc("instead");
const after = getPatchFunc("after");

export { instead, before, after, unpatchAll, patches, patchedObjects };
