import { equal as isEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import { after, before, instead, unpatchAll } from "../../dist/index.mjs";

describe("spitroast unpatches", () => {
  it("should be able to unpatch the most recent on a given func", () => {
    after("passthru", testFuncs, ([], ret) => ret + "a");
    const unpatch = after("passthru", testFuncs, ([], ret) => ret + "b");

    unpatch();
    isEqual(testFuncs.passthru("x_"), "x_a");
  });

  it("should be able to unpatch the first on a given func", () => {
    const unpatch = after("passthru", testFuncs, ([], ret) => ret + "a");
    after("passthru", testFuncs, ([], ret) => ret + "b");

    unpatch();
    isEqual(testFuncs.passthru("x_"), "x_b");
  });

  it("should be able to unpatch an in-between on a given func", () => {
    after("passthru", testFuncs, ([], ret) => ret + "a");
    const unpatch = after("passthru", testFuncs, ([], ret) => ret + "b");
    after("passthru", testFuncs, ([], ret) => ret + "c");

    unpatch();
    isEqual(testFuncs.passthru("x_"), "x_ac");
  });

  it("should be able to completely unpatch", () => {
    before("simple", testFuncs, ([a, b]) => [a + 1, b + 1]);
    after("simple", testFuncs, ([], ret) => ret / 2);

    after("passthru", testFuncs, ([], ret) => ret + "_patched");

    instead("contextual", testFuncs, ([a], orig) =>
      orig.call({ x: 1, y: 1, z: "a" }, a - 4),
    );

    unpatchAll();

    const ctx = { x: 17, y: 5, z: "test" };

    isEqual(testFuncs.simple(1, 2), 3);
    isEqual(testFuncs.contextual.call(ctx, 1), "3.2test");
    isEqual(testFuncs.passthru("x"), "x");
  });
});
