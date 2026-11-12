import assert from "node:assert/strict";
import test from "node:test";
import { checkScores, parseCsv, summaryMarkdown } from "../scripts/check-lighthouse-scores.mjs";

const header = "schema_version,url,strategy,status,error_message,score_performance,score_accessibility,score_best_practices,score_seo,opportunities_json";
const csv = (...rows) => `﻿${header}\n${rows.join("\n")}\n`;

test("parses quoted fields containing commas, quotes and newlines", () => {
  const rows = parseCsv(csv('1,http://localhost:8080/,mobile,ok,,99,100,100,100,"[{""id"":""a,b""},\n{}]"'));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].schema_version, "1");
  assert.equal(rows[0].score_seo, "100");
  assert.equal(rows[0].opportunities_json, '[{"id":"a,b"},\n{}]');
});

test("passes only when every row scores at least the minimum in all four categories", () => {
  const passing = checkScores(parseCsv(csv(
    "1,http://localhost:8080/,mobile,ok,,95,100,100,100,[]",
    "1,http://localhost:8080/,desktop,ok,,100,96,100,95,[]",
  )));
  assert.equal(passing.passed, true);
  assert.deepEqual(passing.failures, []);

  const failing = checkScores(parseCsv(csv(
    "1,http://localhost:8080/,mobile,ok,,94,100,100,100,[]",
    "1,http://localhost:8080/privacy/,desktop,ok,,100,100,92,100,[]",
  )));
  assert.equal(failing.passed, false);
  assert.deepEqual(failing.failures, [
    "http://localhost:8080/ [mobile] Performance: 94 < 95",
    "http://localhost:8080/privacy/ [desktop] Best Practices: 92 < 95",
  ]);
  assert.match(summaryMarkdown(failing), /\*\*94\*\* ❌/);
});

test("fails on errored or unscored rows and on empty results", () => {
  const errored = checkScores(parseCsv(csv("1,http://localhost:8080/,mobile,error,timeout,,,,,")));
  assert.equal(errored.passed, false);
  assert.ok(errored.failures.includes("http://localhost:8080/ [mobile] status=error (timeout)"));
  assert.ok(errored.failures.includes("http://localhost:8080/ [mobile] SEO: no score"));
  assert.equal(checkScores(parseCsv(csv())).passed, false);
});
