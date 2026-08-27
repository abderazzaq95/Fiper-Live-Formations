import { chromium } from "playwright-core";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
});

const checks = [
  { name: "landing-desktop", url: "http://127.0.0.1:3100", viewport: { width: 1440, height: 1100 } },
  { name: "landing-mobile", url: "http://127.0.0.1:3100", viewport: { width: 390, height: 844 }, mobile: true },
  { name: "admin-desktop", url: "http://127.0.0.1:3100/admin", viewport: { width: 1440, height: 1000 } },
];

const results = [];
for (const check of checks) {
  const context = await browser.newContext({
    viewport: check.viewport,
    isMobile: check.mobile ?? false,
    deviceScaleFactor: 1,
    locale: "ar-MA",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(check.url, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join("artifacts", `${check.name}-pw.png`) });
  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    viewportHeight: document.documentElement.clientHeight,
    scrollHeight: document.documentElement.scrollHeight,
  }));
  results.push({ name: check.name, dimensions, errors });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
