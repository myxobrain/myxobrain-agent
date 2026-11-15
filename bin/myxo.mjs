#!/usr/bin/env node
// myxo: MYXOBRAIN//TERM in your shell. Six minds modeled on real organisms trade the same 11 Robinhood Chain assets.
// It only reads what the MYXOBRAIN site publishes: no keys, no wallet, no trading. `myxo verify` re-hashes the engine and raw data.
import { createHash } from "node:crypto";

const VERSION = "1.0.1";
const SERVER = (process.env.MYXOBRAIN_URL || "https://myxobrain.com/").replace(/\/$/, "");

// ---------- output ----------
const tty = (process.stdout.isTTY || !!process.env.FORCE_COLOR) && !process.env.NO_COLOR;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const amber = c("38;2;255;176;0"), up = c("38;2;91;214;138"), dn = c("38;2;255;122;102"), hi = c("38;2;242;242;236"), dim = c("2"), bold = c("1"), inv = c("7");
const out = (s = "") => process.stdout.write(s + "\n");
const strip = (s) => String(s).replace(/\x1b\[[0-9;]*m/g, "");
const pad = (s, n, right = false) => { const g = Math.max(0, n - strip(s).length); return right ? " ".repeat(g) + s : s + " ".repeat(g); };
const pct = (v) => (v == null ? "–" : (v > 0 ? "+" : v < 0 ? "-" : "") + Math.abs(v * 100).toFixed(1) + "%");
const col = (v, s) => (v > 0 ? up(s) : v < 0 ? dn(s) : s);
const day = (ts) => new Date(ts * 1000).toISOString().slice(0, 10);
const ago = (iso) => { const s = Math.round((Date.now() - Date.parse(iso)) / 1000); return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.round(s / 60)}m ago` : s < 86400 ? `${Math.round(s / 3600)}h ago` : `${Math.round(s / 86400)}d ago`; };

// the six organisms, as on the site (lib/specimens.js)
const ORG = {
  physarum: { name: "Physarum", latin: "Physarum polycephalum", brain: "0 neurons", rule: "Tubes that carry flow thicken, idle tubes wither." },
  worm: { name: "Worm", latin: "Caenorhabditis elegans", brain: "302 neurons", rule: "Food smell runs through the real wiring diagram to a turn or a run." },
  fry: { name: "Fry", latin: "Danio rerio, larva", brain: "11 model cells", rule: "A cell that fires hard enough buys; a silent cell sells." },
  ant: { name: "Ant", latin: "Formicidae colony", brain: "no leader", rule: "Paths to profit get more pheromone; unused trails evaporate." },
  ecoli: { name: "E. coli", latin: "Escherichia coli", brain: "1 cell, no neurons", rule: "Keeps swimming while food improves; tumbles to a random heading when it gets worse." },
  bee: { name: "Bee", latin: "Apis mellifera swarm", brain: "quorum", rule: "Scouts dance for sites; the swarm moves when a quorum agrees." },
};
const NAME = (k) => (ORG[k] ? ORG[k].name : k === "hold" ? "Hold" : k === "random" ? "Random" : k).toUpperCase();

// ---------- data ----------
const cache = new Map();
async function get(path, { raw = false } = {}) {
  const key = path + (raw ? ":raw" : "");
  if (cache.has(key)) return cache.get(key);
  let r;
  try { r = await fetch(SERVER + "/" + path, { headers: { "user-agent": "myxobrain-cli/" + VERSION } }); }
  catch { throw new Error(`Cannot reach ${SERVER}. Check your connection, or set MYXOBRAIN_URL.`); }
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  const v = raw ? Buffer.from(await r.arrayBuffer()) : await r.json();
  cache.set(key, v); return v;
}
const index = () => get("data/league-index.json");
async function expId(arg) {
  const I = await index();
  if (!arg) return I[I.length - 1].id;
  const id = /^\d+$/.test(arg) ? "EXP-" + arg.padStart(3, "0") : arg.toUpperCase();
  if (!I.find((e) => e.id === id)) throw new Error(`Unknown experiment ${arg}. Try: ${I.map((e) => e.id).join(", ")}`);
  return id;
}
const passed = (o) => o.gates.filter((g) => g.pass).length;

function head(title) {
  out();
  out(`  ${amber(bold("MYXOBRAIN//TERM"))} ${dim("·")} ${title}`);
  out(dim("  " + "─".repeat(66)));
}

// ---------- commands ----------
async function overview() {
  const [S, lv] = await Promise.all([get("data/league-summary.json"), get("live/live.json").catch(() => null)]);
  head("six minds, one market");
  out(dim("  Same 11 assets, same rules written before each run, 0.3% cost, 5 seeds, 4 walk-forward folds."));
  out();
  out(dim("  EXP      FOOD                               HOLD     BEST                 RESULT"));
  for (const e of S) {
    const [k, o] = Object.entries(e.orgs).sort((a, b) => b[1].ret - a[1].ret)[0], pass = Object.values(e.orgs).some((x) => x.gates === 4);
    out(`  ${pad(hi(e.id), 9)}${pad(e.title.toLowerCase(), 35)}${pad(col(e.hold.ret, pct(e.hold.ret)), 9)}${pad(NAME(k) + " " + col(o.ret, pct(o.ret)), 21)}${pass ? up("PASS") : dn("FAIL")}`);
  }
  const full = S.reduce((a, e) => a + Object.values(e.orgs).filter((o) => o.gates === 4).length, 0), runs = S.reduce((a, e) => a + Object.keys(e.orgs).length, 0);
  out();
  out(`  ${amber(">")} ${S.length} experiments · ${runs} organism runs · ${full ? up(full + " passed all gates") : dn("0 passed all gates")} · sealed holdout: ${full ? "opened" : "still sealed"}`);
  if (lv) out(`  ${amber(">")} LIVE-001 · ${lv.bars ?? 0} market hours · hold ${col(lv.hold?.ret, pct(lv.hold?.ret))} · updated ${lv.updatedAt ? ago(lv.updatedAt) : "–"}`);
  out(dim(`\n  myxo league · myxo folds · myxo gates · myxo minds · myxo live · myxo verify · myxo help`));
  out();
}

async function league(arg) {
  const L = await get(`data/league-${await expId(arg)}.json`);
  head(`${L.id} · ${L.title}`);
  out("  " + L.hypothesis);
  out();
  const rows = [["hold", L.bench.hold], ["random", L.bench.random], ...Object.entries(L.organisms).map(([k, o]) => [k, o.stitched, o])].sort((a, b) => b[1].ret - a[1].ret);
  const max = Math.max(...rows.map((r) => Math.abs(r[1].ret)), 0.01);
  out(dim("  #   BOOK        RETURN   BAR                       SHARPE   MAX DD   STATUS"));
  rows.forEach(([k, m, o], i) => {
    const n = Math.max(1, Math.round((Math.abs(m.ret) / max) * 22)), bar = (m.ret >= 0 ? "▶" : "◀") + "█".repeat(n);
    const st = o ? (o.verdict === "FAILED" ? dn(`FAIL ${passed(o)}/4`) : up(`${o.verdict} ${passed(o)}/4`)) : dim("BENCH");
    out(`  ${dim(String(i + 1).padStart(2, "0"))}  ${pad(hi(NAME(k)), 12)}${pad(col(m.ret, pct(m.ret)), 9, true)}   ${pad(col(m.ret, bar), 26)}${pad(m.sharpe.toFixed(2), 6, true)}   ${pad((m.maxDD * 100).toFixed(1) + "%", 6, true)}   ${st}`);
  });
  const best = Object.entries(L.organisms).sort((a, b) => passed(b[1]) - passed(a[1]))[0];
  out();
  out(`  ${amber(">")} closest: ${NAME(best[0])} ${passed(best[1])}/4 gates. ${Object.values(L.organisms).every((o) => o.verdict === "FAILED") ? "No organism passed every gate, so the sealed months stay sealed." : ""}`);
  out(dim(`  ${SERVER}/?exp=${L.id}`));
  out();
}

async function folds(arg) {
  const L = await get(`data/league-${await expId(arg)}.json`);
  head(`${L.id} · test return per fold (W = beat hold)`);
  const first = Object.values(L.organisms)[0];
  out(dim("  " + pad("", 12) + first.folds.map((f, i) => pad(`F${i + 1} ${day(f.from).slice(0, 7)}`, 14)).join("")));
  out("  " + pad(dim("HOLD"), 12) + L.bench.holdFolds.map((f) => pad(col(f.ret, pct(f.ret)), 14)).join(""));
  for (const [k, o] of Object.entries(L.organisms)) out("  " + pad(hi(NAME(k)), 12) + o.folds.map((f) => pad(f.win ? inv(amber(` ${pct(f.test.ret)} W `)) : col(f.test.ret, ` ${pct(f.test.ret)} L`), 14)).join(""));
  out();
}

async function gates(arg) {
  const L = await get(`data/league-${await expId(arg)}.json`);
  head(`${L.id} · gates, all four required`);
  out(dim("  " + pad("", 12) + ["RETURN", "SHARPE", "DRAWDOWN", "3 OF 4"].map((g) => pad(g, 11)).join("")));
  for (const [k, o] of Object.entries(L.organisms)) out("  " + pad(hi(NAME(k)), 12) + o.gates.map((g) => pad(g.pass ? up("PASS") : dn("FAIL"), 11)).join("") + dim(`${passed(o)}/4`));
  out();
  out(dim("  return and Sharpe must beat equal-weight hold, drawdown no worse, and the organism must win 3 of 4 folds."));
  out();
}

async function minds() {
  const src = await get("data/sources.json").catch(() => []);
  head("ps --minds");
  out(dim("  PID  NAME        BRAIN               PAPERS  MECHANISM"));
  Object.entries(ORG).forEach(([k, o], i) => {
    const n = src.filter((e) => e.org === k && e.role === "model").length;
    out(`  ${dim(String(i + 1).padStart(2, "0"))}   ${pad(hi(o.name.toUpperCase()), 12)}${pad(dim(o.brain), 20)}${pad(String(n), 8)}${o.rule}`);
  });
  out();
  out(dim(`  ${src.length} papers behind the models, each looked up on Crossref: ${SERVER}/data`));
  out();
}

async function live() {
  const lv = await get("live/live.json");
  head(`${lv.id || "LIVE-001"} · forward test on data that didn't exist yet`);
  if (!lv.books || lv.waiting) { out(`  Registered ${lv.registeredAt?.slice(0, 16).replace("T", " ")} UTC, waiting for the first closed market bars.`); return out(); }
  out(`  registered ${dim(lv.registeredAt.slice(0, 16).replace("T", " ") + " UTC")} · ${lv.bars} market hours · updated ${ago(lv.updatedAt)}`);
  out();
  out(dim("  BOOK                 FROM      RETURN   SHARPE   MAX DD"));
  out(`  ${pad(hi("HOLD"), 21)}${pad(dim("bench"), 10)}${pad(col(lv.hold.ret, pct(lv.hold.ret)), 8, true)}${pad(lv.hold.sharpe?.toFixed(2) ?? "–", 9, true)}${pad(lv.hold.maxDD != null ? (lv.hold.maxDD * 100).toFixed(1) + "%" : "–", 9, true)}`);
  for (const b of [...lv.books].sort((a, z) => z.ret - a.ret)) out(`  ${pad(NAME(b.org), 21)}${pad(dim(b.exp), 10)}${pad(col(b.ret, pct(b.ret)), 8, true)}${pad(b.sharpe?.toFixed(2) ?? "–", 9, true)}${pad(b.maxDD != null ? (b.maxDD * 100).toFixed(1) + "%" : "–", 9, true)}`);
  out();
  out(dim("  Settings frozen at registration, paper money, judged after at least three months."));
  out();
}

async function verify() {
  const M = await get("raw/manifest.json");
  head("verify · SHA-256 of every engine and raw file");
  let ok = 0;
  for (const f of M.files) {
    let got = "";
    try { got = createHash("sha256").update(await get(f.path, { raw: true })).digest("hex"); } catch (e) { got = "error: " + e.message; }
    const good = got === f.sha256; if (good) ok++;
    out(`  ${good ? up("✓") : dn("✗")} ${pad(f.path, 44)}${dim(f.sha256.slice(0, 16) + "…")}${good ? "" : "  " + dn(got.slice(0, 16))}`);
  }
  out();
  out(`  ${amber(">")} ${ok === M.files.length ? up(`${ok}/${M.files.length} files match`) : dn(`${ok}/${M.files.length} files match`)} the manifest built ${M.builtAt?.slice(0, 16).replace("T", " ")} UTC.`);
  const site = await get("site.json").catch(() => ({}));
  if (site.anchor?.confirmed) out(`  ${amber(">")} the pre-registration ledger is timestamped in Bitcoin block ${site.anchor.block} (OpenTimestamps).`);
  out(dim(`  To recompute every result yourself: git clone ${site.repo || "https://github.com/myxobrain/myxobrain"} && cd myxobrain && node server/league/verify-all.mjs`));
  out();
}

async function watch() {
  for (;;) { if (tty) process.stdout.write("\x1b[2J\x1b[H"); await live().catch((e) => out("  " + dn(e.message))); out(dim("  refreshes every minute · ctrl+c to stop")); await new Promise((r) => setTimeout(r, 60000)); cache.clear(); }
}

function help() {
  out();
  out(`  ${amber(bold("MYXOBRAIN//TERM"))} ${dim("v" + VERSION)}  six minds modeled on real organisms, one market`);
  out();
  out(`  ${hi("myxo")}                   every experiment and the live test at a glance`);
  out(`  ${hi("myxo league")} ${dim("[EXP]")}      the league for one experiment ${dim("(default: latest; e.g. 4 or EXP-004)")}`);
  out(`  ${hi("myxo folds")} ${dim("[EXP]")}       test return per fold, W = beat hold`);
  out(`  ${hi("myxo gates")} ${dim("[EXP]")}       the four gates for each organism`);
  out(`  ${hi("myxo minds")}             the six organisms and the papers behind them`);
  out(`  ${hi("myxo live")}              LIVE-001, the forward test`);
  out(`  ${hi("myxo watch")}             LIVE-001, refreshed every minute`);
  out(`  ${hi("myxo verify")}            re-hash the published engine and raw data`);
  out(`  ${dim("add --json to print the raw data · MYXOBRAIN_URL points at another server · NO_COLOR turns colors off")}`);
  out();
  out(dim(`  ${SERVER} · github.com/myxobrain/myxobrain · paper only, not financial advice`));
  out();
}

// ---------- main ----------
const args = process.argv.slice(2), json = args.includes("--json"), [cmd, arg] = args.filter((a) => !a.startsWith("--"));
const JSON_OF = { "": () => get("data/league-summary.json"), league: async () => get(`data/league-${await expId(arg)}.json`), folds: async () => get(`data/league-${await expId(arg)}.json`), gates: async () => get(`data/league-${await expId(arg)}.json`), minds: () => get("data/sources.json"), live: () => get("live/live.json"), verify: () => get("raw/manifest.json") };
const RUN = { league: () => league(arg), folds: () => folds(arg), gates: () => gates(arg), minds, live, watch, verify, help };
try {
  if (args.includes("--version") || args.includes("-v")) out(VERSION);
  else if (args.includes("--help") || args.includes("-h") || cmd === "help") help();
  else if (json && (cmd || "") in JSON_OF) out(JSON.stringify(await JSON_OF[cmd || ""](), null, 2));
  else if (!cmd) await overview();
  else if (RUN[cmd]) await RUN[cmd]();
  else { out(`  Unknown command "${cmd}".`); help(); process.exitCode = 1; }
} catch (e) { out(); out("  " + dn(e.message)); out(); process.exitCode = 1; }
