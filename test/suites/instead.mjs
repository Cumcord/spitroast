import { equal as isEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import { instead } from "../../dist/index.mjs";

describe("spitroast instead patches", () => {
  it("should patch a simple func", () => {
    instead("simple", testFuncs, ([a, b], orig) => orig(a + b, b - a) * b);

    isEqual(testFuncs.simple(1, 2), 8);
  });

  it("should be unpatchable", () => {
    const unpatch = instead("simple", testFuncs, () => 0);

    unpatch();

    isEqual(testFuncs.simple(1, 2), 3);
  });

  it("should maintain context", () => {
    instead("contextual", testFuncs, function (args, orig) {
      isEqual(this?.x, 17);
      isEqual(this.y, 5);
      isEqual(this.z, "test");

      return orig.apply(this, args);
    });

    const ctx = { x: 17, y: 5, z: "test" };

    isEqual(testFuncs.contextual.call(ctx, 1), "3.2test");
  });
});
