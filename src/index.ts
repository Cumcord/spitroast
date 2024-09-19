import getPatchFunc from "./getPatchFunc";

const before = getPatchFunc("b");
const instead = getPatchFunc("i");
const after = getPatchFunc("a");

export { instead, before, after };
export { resetPatches as unpatchAll } from "./shared";