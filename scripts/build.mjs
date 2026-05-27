// Precompile the single-file React app (App.jsx) into a fast, self-contained
// static bundle in dist/. No in-browser Babel, no third-party CDN.
//
//   App.jsx  --(import/export swap + JSX transpile)-->  dist/app.js
//   + vendored React UMD + media assets + index.html
//
// Run: npm run build   (Netlify runs this via netlify.toml)

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const require = createRequire(import.meta.url);
const Babel = require("@babel/standalone");

// Same two substitutions the preview uses to make App.jsx run without a bundler.
const IMP_OLD = 'import { useState, useEffect, useRef, useCallback, useMemo } from "react";';
const IMP_NEW = "const { useState, useEffect, useRef, useCallback, useMemo } = React;";
const EXP_OLD = "export default AppRoot;";
const EXP_NEW = 'ReactDOM.createRoot(document.getElementById("root")).render(<AppRoot/>);';

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

let src = readFileSync(join(ROOT, "App.jsx"), "utf-8");
if (!src.includes(IMP_OLD)) throw new Error("App.jsx: expected import line not found");
if (!src.includes(EXP_OLD)) throw new Error("App.jsx: expected `export default AppRoot;` not found");
src = src.replace(IMP_OLD, IMP_NEW).replace(EXP_OLD, EXP_NEW);

console.log("Transpiling App.jsx (JSX -> JS)...");
const t0 = Date.now();
const { code } = Babel.transform(src, { presets: ["react"], compact: false, comments: false });
console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${(code.length / 1024).toFixed(0)} KB`);
writeFileSync(join(DIST, "app.js"), code);

// Vendored production React (served locally, not from a CDN).
const reactUmd = join(ROOT, "node_modules/react/umd/react.production.min.js");
const reactDomUmd = join(ROOT, "node_modules/react-dom/umd/react-dom.production.min.js");
copyFileSync(reactUmd, join(DIST, "react.production.min.js"));
copyFileSync(reactDomUmd, join(DIST, "react-dom.production.min.js"));

// Media assets referenced by the app (skip any that aren't in the repo).
for (const f of ["splash-intro.mp4", "home-page-header-logo.mp4", "latest-logo.mp4", "wedding-banner.jpg"]) {
  if (existsSync(join(ROOT, f))) copyFileSync(join(ROOT, f), join(DIST, f));
}

writeFileSync(
  join(DIST, "index.html"),
  `<!doctype html>
<html lang="te">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"/>
<title>LocalAI TV</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>html,body,#root{margin:0;height:100%;background:#0a0a0f}</style>
</head>
<body>
<div id="root"></div>
<script src="./react.production.min.js"></script>
<script src="./react-dom.production.min.js"></script>
<script src="./app.js"></script>
</body>
</html>
`
);

// SPA fallback: the UI routes client-side, so serve index.html for any path.
writeFileSync(join(DIST, "_redirects"), "/*  /index.html  200\n");

console.log("Build complete ->", DIST);
