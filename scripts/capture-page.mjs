import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [url, outputDirectory = "docs/screenshots", prefix = "courses"] = process.argv.slice(2);

if (!url) {
  throw new Error("Usage: node scripts/capture-page.mjs <url> [output-directory] [prefix]");
}

const browser = await chromium.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
});

await mkdir(outputDirectory, { recursive: true });

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.evaluate(async () => {
    for (let position = 0; position < document.documentElement.scrollHeight; position += Math.max(320, window.innerHeight * 0.75)) {
      window.scrollTo({ top: position });
      await new Promise((resolve) => window.setTimeout(resolve, 240));
    }
    window.scrollTo({ top: 0 });
  });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outputDirectory, `${prefix}-${viewport.name}.png`),
    fullPage: true,
  });
  await page.close();
}

await browser.close();
