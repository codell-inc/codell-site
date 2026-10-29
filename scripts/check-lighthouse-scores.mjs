import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const scoreColumns = [
  ["score_performance", "Performance"],
  ["score_accessibility", "Accessibility"],
  ["score_best_practices", "Best Practices"],
  ["score_seo", "SEO"],
];

/** RFC 4180 CSV (quoted fields may contain commas, quotes and newlines). */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header = [], ...body] = rows;
  const columns = header.map(name => name.replace(/^﻿/, ""));
  return body.filter(cells => cells.some(Boolean)).map(cells => Object.fromEntries(columns.map((name, i) => [name, cells[i] ?? ""])));
}

/** Every (URL, strategy) row must be measured and score at least `min` in all four categories. */
export function checkScores(rows, { min = 95 } = {}) {
  if (!rows.length) return { passed: false, results: [], failures: ["results.csv has no measured rows"] };
  const failures = [];
  const results = rows.map(row => {
    const scores = Object.fromEntries(scoreColumns.map(([column]) => [column, row[column] === "" ? NaN : Number(row[column])]));
    const problems = [];
    if (row.status !== "ok") problems.push(`status=${row.status}${row.error_message ? ` (${row.error_message})` : ""}`);
    for (const [column, label] of scoreColumns) {
      if (!Number.isFinite(scores[column])) problems.push(`${label}: no score`);
      else if (scores[column] < min) problems.push(`${label}: ${scores[column]} < ${min}`);
    }
    for (const problem of problems) failures.push(`${row.url} [${row.strategy}] ${problem}`);
    return { url: row.url, strategy: row.strategy, scores, passed: !problems.length };
  });
  return { passed: !failures.length, results, failures };
}

export function summaryMarkdown({ passed, results, failures }, { min = 95 } = {}) {
  const cell = score => Number.isFinite(score) ? (score >= min ? `${score}` : `**${score}** ❌`) : "—";
  const lines = [
    `## Lighthouse: ${passed ? "✅ 全ページ" : "❌ 基準未達"} (基準 ${min} 点以上)`,
    "",
    `| URL | Strategy | ${scoreColumns.map(([, label]) => label).join(" | ")} |`,
    `| --- | --- | ${scoreColumns.map(() => "---:").join(" | ")} |`,
    ...results.map(r => `| ${new URL(r.url).pathname} | ${r.strategy} | ${scoreColumns.map(([column]) => cell(r.scores[column])).join(" | ")} |`),
  ];
  if (failures.length) lines.push("", "### 未達項目", ...failures.map(failure => `- ${failure}`));
  return `${lines.join("\n")}\n`;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const [csvPath, minArg = "95"] = process.argv.slice(2);
  const min = Number(minArg);
  try {
    if (!csvPath) throw new Error("usage: check-lighthouse-scores.mjs <results.csv> [min]");
    const result = checkScores(parseCsv(await readFile(csvPath, "utf8")), { min });
    const markdown = summaryMarkdown(result, { min });
    console.log(markdown);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
    if (!result.passed) process.exitCode = 1;
  } catch (error) {
    console.error(`Lighthouse score check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
