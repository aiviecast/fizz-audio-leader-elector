// elector-driver.js — Node サーバの leader 選出グルー例。選出は Almide(wasm)、WS は Node。
export async function loadElector(wasmUrl) {
  const { readFile } = await import("node:fs/promises");
  const mod = await WebAssembly.compile(await readFile(new URL(wasmUrl, import.meta.url)));
  const imports = {};
  for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
  const { exports: ex } = await WebAssembly.instantiate(mod, imports);
  try { ex._start(); } catch {}
  return {
    // viewers: [{capable, open}] 順序付き, prevIdx: 現リーダー index (-1=無し)
    // → 新リーダー index (-1=無し)
    elect(viewers, prevIdx) {
      const flags = Uint8Array.from(viewers, (v) => (v.capable ? 1 : 0) | (v.open ? 2 : 0));
      const p = ex.elect_alloc(flags.length);
      new Uint8Array(ex.memory.buffer, Number(p), flags.length).set(flags);
      return ex.elect(prevIdx);
    },
  };
}
