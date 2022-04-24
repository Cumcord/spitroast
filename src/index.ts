import getPatchFunc from "./getPatchFunc";
import { unpatchAll } from "./unpatch";

type BeforeCallback = (args: any[]) => undefined | any[];
type InsteadCallback = (args: any[], origFunc: Function) => any;
type AfterCallback = (args: any[], ret: any) => undefined | any;

const before = getPatchFunc<BeforeCallback>("b");
const instead = getPatchFunc<InsteadCallback>("i");
const after = getPatchFunc<AfterCallback>("a");

export { instead, before, after, unpatchAll };
