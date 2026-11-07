import assert from "node:assert/strict";
import test from "node:test";

import { validateProductionResponse } from "../scripts/check-production-domain.mjs";

test("canonical root must return HTTP 200", async () => {
  await validateProductionResponse("root", new Response("ok", { status: 200 }));
  await assert.rejects(
    validateProductionResponse("root", new Response("blocked", { status: 403 })),
    /expected 200/,
  );
});

test("terms API must be healthy JSON backed by the expected shape", async () => {
  await validateProductionResponse(
    "terms",
    new Response(JSON.stringify({ terms: [] }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    }),
  );

  await assert.rejects(
    validateProductionResponse(
      "terms",
      new Response(JSON.stringify({ error: "bad" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ),
    /terms array/,
  );
});

test("IDN alias must redirect permanently to the canonical root", async () => {
  await validateProductionResponse(
    "alias",
    new Response(null, {
      status: 301,
      headers: { location: "https://__PUBLIC_HOST__/" },
    }),
  );

  await assert.rejects(
    validateProductionResponse(
      "alias",
      new Response(null, {
        status: 302,
        headers: { location: "https://__PUBLIC_HOST__/" },
      }),
    ),
    /expected 301/,
  );
});
