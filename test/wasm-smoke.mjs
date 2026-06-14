import { readFileSync } from "node:fs";
const mod = await WebAssembly.compile(readFileSync(new URL("../build/elector.wasm", import.meta.url)));
const imports = {};
for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
const { exports: ex } = await WebAssembly.instantiate(mod, imports);
try { ex._start(); } catch {}
function elect(prev, flags) {
  const p = ex.elect_alloc(flags.length);
  new Uint8Array(ex.memory.buffer, Number(p), flags.length).set(flags);
  return ex.elect(prev);
}
let ok = true; const ck = (got, want, m) => { if (got !== want) { console.error(`FAIL ${m}: ${got}!=${want}`); ok = false; } };
ck(elect(-1, [2,3,3]), 1, "reelect first eligible");
ck(elect(1, [2,3,3]), 1, "keep current");
ck(elect(1, [2,2,3]), 2, "current invalid → next");
ck(elect(-1, [2,2,2]), -1, "none eligible");
console.log(ok ? "wasm OK — leader election matches native" : "FAIL"); if (!ok) process.exit(1);
