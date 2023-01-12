// cf. https://github.com/evanw/esbuild/blob/d751dfb82002d332aa4dbfa89c74d25203d28123/scripts/esbuild.js#L85-L107

import { ESBUILD_VERSION } from "../version.ts";
import { build, stop } from "https://deno.land/x/esbuild@v0.16.17/wasm.js";

const wasmExec = await (async () => {
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/esbuild-wasm@${ESBUILD_VERSION}/wasm_exec.js`,
  );
  if (!res.ok) {
    throw Error(`${res.status} ${res.statusText} at "${res.url}"`);
  }
  return await res.text();
})();
const worker = await (async () => {
  const res = await fetch(
    `https://raw.githubusercontent.com/evanw/esbuild/v${ESBUILD_VERSION}/lib/shared/worker.ts`,
  );
  if (!res.ok) {
    throw Error(`${res.status} ${res.statusText} at "${res.url}"`);
  }
  return await res.text();
})();

const contents = `
/** @license
 * esbuild-wasm@${ESBUILD_VERSION}
 *
 * MIT License
 *
 * Copyright (c) 2020 Evan Wallace
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
for (let o = self; o; o = Object.getPrototypeOf(o))
  for (let k of Object.getOwnPropertyNames(o))
    if (!(k in globalThis))
      Object.defineProperty(globalThis, k, { get: () => self[k] });

${wasmExec.replace(/\bfs\./g, "globalThis.fs.")}
${worker}`;

// await Deno.writeTextFile(
//   new URL("../worker.ts", import.meta.url),
//   contents,
// );

const result = await build({
  stdin: {
    contents,
    loader: "ts",
  },
  format: "iife",
  minify: true,
  legalComments: "eof",
  write: false,
});

await Deno.writeTextFile(
  new URL("../worker.min.js", import.meta.url),
  result.outputFiles[0].text,
);

stop();
