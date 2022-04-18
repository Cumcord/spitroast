import getPatchFunc from "./getPatchFunc";
import { unpatchAll } from "./unpatch";

type BeforeCallback = (args: any[]) => undefined | any[];
type InsteadCallback = (args: any[], origFunc: Function) => any;
type AfterCallback = (args: any[], ret: any) => undefined | any;

const before = getPatchFunc<BeforeCallback>("before");
const instead = getPatchFunc<InsteadCallback>("instead");
const after = getPatchFunc<AfterCallback>("after");

export { instead, before, after, unpatchAll };
