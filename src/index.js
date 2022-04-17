import getPatchFunc from "./getPatchFunc.js";
import { unpatchAll } from "./unpatch.js";

const before = getPatchFunc("before");
const instead = getPatchFunc("instead");
const after = getPatchFunc("after");

if (globalThis.module) {
  globalThis.module.exports = {
    before,
    instead,
    after,
    unpatchAll
  };
}

export { instead, before, after, unpatchAll };
