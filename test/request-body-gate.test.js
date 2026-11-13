import assert from "node:assert/strict";
import test from "node:test";
import { requestBodyTooLarge } from "../src/worker.js";

const post = (body, headers = {}) =>
  new Request("https://example.org/api/submit", { method: "POST", body, headers, duplex: "half" });
const stream = (chunks, error) =>
  new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      if (error) controller.error(error);
      else controller.close();
    },
  });

test("a small body is accepted", async () => {
  assert.equal(await requestBodyTooLarge(post("{}")), false);
});

test("a body above 128 KiB is rejected, with or without a Content-Length", async () => {
  assert.equal(await requestBodyTooLarge(post("x".repeat(128 * 1024 + 1))), true);
  assert.equal(await requestBodyTooLarge(post("{}", { "Content-Length": "999999" })), true);
  assert.equal(await requestBodyTooLarge(post("{}", { "Content-Length": "12abc" })), true);
  const chunks = [new Uint8Array(100 * 1024), new Uint8Array(100 * 1024)];
  assert.equal(await requestBodyTooLarge(post(stream(chunks))), true);
});

test("a body stream that fails is not reported as oversized and does not throw", async () => {
  const failing = post(stream([new TextEncoder().encode("{")], new Error("connection reset")));
  assert.equal(await requestBodyTooLarge(failing), false);
});
