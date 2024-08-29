import { equal as isEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import { after } from "../../dist/index.mjs";

describe("spitroast after patches", () => {
  it("should patch a simple func", () => {
    after("simple", testFuncs, ([, b], ret) => ret * b);

    isEqual(testFuncs.simple(1, 2), 6);
  });

  it("should be unpatchable", () => {
    const unpatch = after("simple", testFuncs, () => 0);

    unpatch();

    isEqual(testFuncs.simple(1, 2), 3);
  });

  it("should maintain context", () => {
    after("contextual", testFuncs, function () {
      isEqual(this?.x, 17);
      isEqual(this.y, 5);
      isEqual(this.z, "test");
    });

    const ctx = { x: 17, y: 5, z: "test" };

    isEqual(testFuncs.contextual.call(ctx, 1), "3.2test");
  });
});
