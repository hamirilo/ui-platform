/* 利用側が一部だけを import したとき、初期ロード（entry とその静的 import）に
 * 使わない重い依存が入っていないことを sourcemap で確かめる。
 * 動的 import で分かれたチャンクは、ページに該当 Island が現れたときにだけ読まれるので対象外。 */
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const OUT = "dist-bundle";
const manifest = JSON.parse(readFileSync(`${OUT}/.vite/manifest.json`, "utf8"));

const EXPECTATIONS = {
  "islands/nav-only.tsx": {
    label: "NavItem だけを import",
    forbidden: ["framer-motion", "motion-dom", "motion-utils"],
  },
  "islands/auto-mount-only.tsx": {
    label: "auto-mount だけを import",
    forbidden: ["react-day-picker", "date-fns", "@date-fns/tz", "@base-ui/react", "lucide-react"],
  },
};

function initialChunks(key, seen = new Set()) {
  if (seen.has(key)) return seen;
  seen.add(key);
  for (const imported of manifest[key].imports ?? []) initialChunks(imported, seen);
  return seen;
}

function packageOf(source) {
  const matches = source.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/g);
  return matches ? matches.at(-1).replace("node_modules/", "") : null;
}

let failed = false;
for (const [entry, { label, forbidden }] of Object.entries(EXPECTATIONS)) {
  const packages = new Set();
  let gzip = 0;
  for (const key of initialChunks(entry)) {
    const file = `${OUT}/${manifest[key].file}`;
    gzip += gzipSync(readFileSync(file)).length;
    const map = JSON.parse(readFileSync(`${file}.map`, "utf8"));
    for (const source of map.sources) {
      const pkg = packageOf(source);
      if (pkg) packages.add(pkg);
    }
  }
  const found = forbidden.filter((pkg) => packages.has(pkg));
  const size = `${(gzip / 1024).toFixed(1)} kB gzip`;
  if (found.length > 0) {
    console.log(`❌ ${label}: 初期ロードに ${found.join(", ")} が入っている (${size})`);
    failed = true;
  } else {
    console.log(`✅ ${label}: 初期ロードに ${forbidden.join(" / ")} が入っていない (${size})`);
  }
}

if (failed) process.exit(1);
