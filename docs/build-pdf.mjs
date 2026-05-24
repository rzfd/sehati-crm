// One-shot script: convert docs/architecture.md → docs/architecture.html
// (with print-friendly styles) → then call Windows Chrome --headless --print-to-pdf
// to produce docs/architecture.pdf without installing pandoc/wkhtmltopdf.

import fs from "node:fs/promises"
import path from "node:path"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { marked } from "marked"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const md   = await fs.readFile(path.join(__dirname, "architecture.md"), "utf8")
const body = marked.parse(md, { mangle: false, headerIds: true })

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>Sehati CRM — Architecture & API Reference</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  html, body { background: #fff; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #1f2937;
    max-width: 720px;
    margin: 0 auto;
    padding: 0;
  }
  h1 { font-size: 22pt; color: #1D9E75; border-bottom: 2px solid #1D9E75; padding-bottom: 6px; margin-top: 0.4em; }
  h2 { font-size: 15pt; color: #185FA5; margin-top: 1.8em; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
  h3 { font-size: 12pt; color: #374151; margin-top: 1.3em; }
  h4 { font-size: 11pt; color: #4b5563; margin-top: 1em; }
  p, ul, ol, table { margin: 0.5em 0; }
  ul, ol { padding-left: 1.4em; }
  li { margin: 0.15em 0; }
  code {
    font-family: "JetBrains Mono", ui-monospace, "SF Mono", Consolas, Monaco, monospace;
    font-size: 9.4pt;
    background: #f3f4f6;
    color: #b91c1c;
    padding: 1px 5px;
    border-radius: 4px;
  }
  pre {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-left: 3px solid #1D9E75;
    padding: 10px 12px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.45;
    page-break-inside: avoid;
  }
  pre code { background: transparent; padding: 0; color: #111827; }
  table { border-collapse: collapse; width: 100%; font-size: 9.5pt; page-break-inside: avoid; }
  th { background: #f9fafb; text-align: left; padding: 6px 9px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; }
  td { padding: 5px 9px; border: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #fafafa; }
  blockquote {
    border-left: 3px solid #BA7517;
    background: #fffbeb;
    margin: 0.6em 0;
    padding: 6px 12px;
    color: #78350f;
  }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
  a { color: #185FA5; text-decoration: none; }
  strong { color: #111827; }
  /* Avoid awkward page breaks */
  h1, h2, h3 { page-break-after: avoid; }
  pre, table { page-break-inside: avoid; }
</style>
</head>
<body>
${body}
</body>
</html>
`

const htmlPath = path.join(__dirname, "architecture.html")
await fs.writeFile(htmlPath, html, "utf8")
console.log("✓ HTML:", htmlPath)

// Resolve Windows-side path for chrome.exe and feed it a Windows file:// URL.
const winChrome = "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
const winHtmlPath = execSync(`wslpath -w "${htmlPath}"`).toString().trim()
const winPdfPath  = winHtmlPath.replace(/\.html$/i, ".pdf")

// --no-sandbox needed di WSL (no namespace); --headless=new uses modern headless.
const cmd = [
  `"${winChrome}"`,
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  `--print-to-pdf="${winPdfPath}"`,
  "--no-pdf-header-footer",
  `"file:///${winHtmlPath.replace(/\\/g, "/")}"`,
].join(" ")

console.log("→ running chrome headless...")
execSync(cmd, { stdio: "inherit" })

// Convert win path back to wsl path for verification.
const wslPdfPath = execSync(`wslpath -u "${winPdfPath}"`).toString().trim()
const stat = await fs.stat(wslPdfPath)
console.log(`✓ PDF: ${wslPdfPath} (${(stat.size / 1024).toFixed(1)} KB)`)
