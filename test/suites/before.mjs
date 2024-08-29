import { equal as isEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import { before } from "../../dist/index.mjs";

describe("spitroast before patches", () => {
  it("should patch a simple func", () => {
    before("simple", testFuncs, ([a, b]) => [a + b, a * b]);

    isEqual(testFuncs.simple(1, 2), 5);
  });

  it("should be unpatchable", () => {
    const unpatch = before("simple", testFuncs, () => [0, 0]);

    unpatch();

    isEqual(testFuncs.simple(1, 2), 3);
  });

  it("should maintain context", () => {
    before("contextual", testFuncs, function () {
      isEqual(this?.x, 17);
      isEqual(this.y, 5);
      isEqual(this.z, "test");
    });

    const ctx = { x: 17, y: 5, z: "test" };

    isEqual(testFuncs.contextual.call(ctx, 1), "3.2test");
  });
});
