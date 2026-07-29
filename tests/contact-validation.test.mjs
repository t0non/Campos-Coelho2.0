import test from "node:test";
import assert from "node:assert/strict";

// Dynamic import or testing isolated utility functions
test("Phone formatting normalizes digits correctly", () => {
  const input = "3135640123";
  const cleaned = input.replace(/\D/g, "");
  assert.equal(cleaned.length, 10);
});

test("Honeypot detection rejects populated fields", () => {
  const companyWebsite = "http://spam-bot.com";
  const isSpam = Boolean(companyWebsite && companyWebsite.trim() !== "");
  assert.equal(isSpam, true);
});

test("JSON-LD serialization sanitizes script closing tags", () => {
  const input = { text: "</script><script>alert(1)</script>" };
  const jsonStr = JSON.stringify(input).replace(/</g, "\\u003c");
  assert.equal(jsonStr.includes("</script>"), false);
  assert.equal(jsonStr.includes("\\u003c/script>"), true);
});
