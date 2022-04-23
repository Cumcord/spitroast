import getPatchFunc from "./getPatchFunc.ts";
import { unpatchAll } from "./unpatch.ts";

type BeforeCallback = (args: any[]) => undefined | any[];
type InsteadCallback = (args: any[], origFunc: Function) => any;
type AfterCallback = (args: any[], ret: any) => undefined | any;

const before = getPatchFunc<BeforeCallback>("b");
const instead = getPatchFunc<InsteadCallback>("i");
const after = getPatchFunc<AfterCallback>("a");

export { instead, before, after, unpatchAll };
