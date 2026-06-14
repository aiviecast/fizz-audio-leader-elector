# fizz-audio-leader-elector

Fizz の **音声リーダー選出コア**(§7 Hub)。複数 viewer タブから音声再生リーダーを
1 つ選ぶ(BGM/voice の二重再生を防ぐ)。

方針(openaituber `server.ts` `ensureAudioLeader` と同一):
- 現リーダーがまだ **eligible**(audio-capable かつ接続 open)なら**維持**(不要な
  切替で音が途切れるのを避ける)
- 無効なら**最初の eligible viewer**、いなければ `-1`(リーダー無し)

WS の接続管理 / send は Node の I/O だが、「誰をリーダーにするか」のポリシーは純粋
なので Almide に集約=単一の正本。`flags[i]` 符号化: `bit0=capable, bit1=open`、
eligible=`3`。

## native

```sh
almide build src/main.almd -o build/fizz-audio-leader-elector
./build/fizz-audio-leader-elector
# {"prev":-1,"leader":1,"capable":2} ...
```

## wasm

```sh
almide build src/bridge.almd --target wasm -o build/elector.wasm
```

`elect_alloc(n)` で flag バッファを確保 → JS が各 viewer の flag を書く →
`elect(prev) -> Float`(新リーダー index、-1=無し)。`capable_count()` も。
グルー例 [`browser/elector-driver.js`](./browser/elector-driver.js)。CI で wasm↔native 一致を検証。

ツールチェーン: [almide](https://github.com/almide/almide) v0.27.6+。依存なし。
