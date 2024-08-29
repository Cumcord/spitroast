import { notEqual as isNotEqual } from "node:assert/strict";
import { beforeEach } from "node:test";

beforeEach(() => {
  globalThis.testFuncs = {};

  // for testing basic single patch-unpatch
  testFuncs.simple = (a, b) => a + b;

  // now we know that works, for testing context
  testFuncs.contextual = function (a) {
    isNotEqual(this?.x, undefined);
    isNotEqual(this.y, undefined);
    isNotEqual(this.z, undefined);
    return (this.x - a) / this.y + this.z;
  };

  // now we know patching works, for testing patch composing
  testFuncs.passthru = (a) => a;
});
