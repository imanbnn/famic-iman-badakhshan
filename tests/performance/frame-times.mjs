import assert from "node:assert/strict";
import { appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { offlineContext } from "../browser/helpers/offline.mjs";
import { routes, routeKeys } from "../fixtures/routes.js";

const viewport = { width: 1366, height: 768 };

const inputIntervalMs = 120;
const MILLISECONDS_PER_SECOND = 1_000;
const SLOW_FRAME_RATE = 30;
const TIMESTAMP_TOLERANCE_MS = 1;
const slowFrameMs = MILLISECONDS_PER_SECOND / SLOW_FRAME_RATE + TIMESTAMP_TOLERANCE_MS;
const cpuRates = [1, 4];

function startSampling() {
  const intervals = [],
    handlers = [];
  let previous, start, frame;
  function tick(time) {
    if (previous !== undefined) intervals.push(time - previous);
    previous = time;
    frame = requestAnimationFrame(tick);
  }
  document.addEventListener(
    "keydown",
    () => {
      start = performance.now();
    },
    true
  );
  window.addEventListener("keydown", () => handlers.push(performance.now() - start));
  frame = requestAnimationFrame(tick);
  window.finishSampling = () => {
    cancelAnimationFrame(frame);
    return { intervals, handlers };
  };
}

async function measure(browser, url, rate) {
  const context = await offlineContext(browser, { viewport, reducedMotion: "no-preference" });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const session = await context.newCDPSession(page);
    await session.send("Emulation.setCPUThrottlingRate", { rate });
    await page.goto(url);
    await page.locator("#launch-music").click();
    await page.evaluate(startSampling);
    await page.locator("#start-game").click();
    let moves = 0;
    for (const [index, route] of routes.entries()) {
      for (const action of route.replaceAll(" ", "")) {
        await page.keyboard.press(routeKeys[action]);
        await delay(inputIntervalMs);
        moves++;
      }
      await page.locator("#finish[open]").waitFor();
      if (index + 1 < routes.length) await page.locator("#next").click();
    }
    const sample = await page.evaluate(() => window.finishSampling());
    assert.equal(sample.handlers.length, moves, "Every move must reach the game");
    assert.ok(sample.intervals.length > moves);
    assert.deepEqual(errors, []);
    return sample;
  } finally {
    await context.close();
  }
}

function percentile(sorted, p) {
  return sorted[Math.ceil(sorted.length * p) - 1];
}

function summarize({ intervals, handlers }) {
  intervals.sort((a, b) => a - b);
  handlers.sort((a, b) => a - b);
  const duration = intervals.reduce((sum, ms) => sum + ms, 0);
  return [
    ((MILLISECONDS_PER_SECOND * intervals.length) / duration).toFixed(1),
    percentile(intervals, 0.95).toFixed(1),
    percentile(intervals, 0.99).toFixed(1),
    ((100 * intervals.filter((ms) => ms > slowFrameMs).length) / intervals.length).toFixed(2),
    percentile(handlers, 0.95).toFixed(1),
    intervals.length
  ];
}

const builds = [["Current", new URL("../../dist/index.html", import.meta.url).href]];
if (process.argv[2]) builds.unshift(["Previous", pathToFileURL(resolve(process.argv[2])).href]);
const browser = await chromium.launch({ channel: process.platform === "win32" ? "msedge" : "chrome" });
try {
  const lines = [
    "### Fluidité des trois escales",
    "",
    "Chromium " +
      browser.version() +
      " · 1366 × 768 · eau, effets et musique actifs · deux parties par version et par profil.",
    "",
    "| Build | CPU | FPS moyens | Image p95 (ms) | Image p99 (ms) | Images > 34 ms (%) | Traitement touche p95 (ms) | Intervalles |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |"
  ];
  for (const rate of cpuRates) {
    const samples = new Map(builds.map(([name]) => [name, { intervals: [], handlers: [] }]));
    for (const order of [builds, [...builds].reverse()]) {
      for (const [name, url] of order) {
        const sample = await measure(browser, url, rate);
        const combined = samples.get(name);
        combined.intervals.push(...sample.intervals);
        combined.handlers.push(...sample.handlers);
      }
    }
    for (const [name, sample] of samples) {
      lines.push("| " + [name, rate + "×", ...summarize(sample)].join(" | ") + " |");
    }
  }
  const report = lines.join("\n") + "\n";
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, report);
} finally {
  await browser.close();
}
