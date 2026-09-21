import assert from "node:assert/strict";
import test from "node:test";
import { clampRatio, progressPercent } from "./progress";

test("progress is 0 at the start of the first chapter", () => {
  assert.equal(progressPercent(0, 4, 0), 0);
});

test("finishing the first of four chapters is 25 percent", () => {
  assert.equal(progressPercent(0, 4, 1), 25);
});

test("midway through the third of four chapters is 63 percent", () => {
  assert.equal(progressPercent(2, 4, 0.5), 63);
});

test("the last chapter scrolled to the end is 100 percent", () => {
  assert.equal(progressPercent(3, 4, 1), 100);
});

test("zero chapters never throws and stays at 0", () => {
  assert.equal(progressPercent(0, 0, 0.4), 0);
});

test("scroll ratio is clamped between 0 and 1", () => {
  assert.equal(clampRatio(-2), 0);
  assert.equal(clampRatio(3), 1);
  assert.equal(clampRatio(0.25), 0.25);
});

test("out-of-range chapter index still stays inside 0–100", () => {
  assert.equal(progressPercent(-4, 3, 0.2), 7);
  assert.equal(progressPercent(40, 3, 1), 100);
});
