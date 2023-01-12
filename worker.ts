// deno-lint-ignore-file no-explicit-any
/// <reference lib="deno.worker" />

/** esbuild-wasm@0.16.17
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
// This code is ported from https://raw.githubusercontent.com/evanw/esbuild/v0.16.17/lib/shared/worker.ts and modified below:
// - $ deno fmt
// - fix lint

// This file is part of the web worker source code

import { ESBUILD_VERSION } from "./version.ts";

interface Go {
  argv: string[];
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): void;
}

onmessage = ({ data: wasm }: { data: WebAssembly.Module | string }) => {
  const decoder = new TextDecoder();
  const fs = (globalThis as any).fs;

  let stderr = "";
  fs.writeSync = (fd: number, buffer: Uint8Array) => {
    if (fd === 1) {
      postMessage(buffer);
    } else if (fd === 2) {
      stderr += decoder.decode(buffer);
      const parts = stderr.split("\n");
      if (parts.length > 1) console.log(parts.slice(0, -1).join("\n"));
      stderr = parts[parts.length - 1];
    } else {
      throw new Error("Bad write");
    }
    return buffer.length;
  };

  const stdin: Uint8Array[] = [];
  let resumeStdin: () => void;
  let stdinPos = 0;

  onmessage = ({ data }) => {
    if (data.length > 0) {
      stdin.push(data);
      if (resumeStdin) resumeStdin();
    }
  };

  fs.read = (
    fd: number,
    buffer: Uint8Array,
    offset: number,
    length: number,
    position: null,
    callback: (err: Error | null, count?: number) => void,
  ) => {
    if (
      fd !== 0 || offset !== 0 || length !== buffer.length || position !== null
    ) {
      throw new Error("Bad read");
    }

    if (stdin.length === 0) {
      resumeStdin = () =>
        fs.read(fd, buffer, offset, length, position, callback);
      return;
    }

    const first = stdin[0];
    const count = Math.max(0, Math.min(length, first.length - stdinPos));
    buffer.set(first.subarray(stdinPos, stdinPos + count), offset);
    stdinPos += count;
    if (stdinPos === first.length) {
      stdin.shift();
      stdinPos = 0;
    }
    callback(null, count);
  };

  const go: Go = new (globalThis as any).Go();
  go.argv = ["", `--service=${ESBUILD_VERSION}`];

  // Try to instantiate the module in the worker, then report back to the main thread
  tryToInstantiateModule(wasm, go).then(
    (instance) => {
      postMessage(null);
      go.run(instance);
    },
    (error) => {
      postMessage(error);
    },
  );
};

async function tryToInstantiateModule(
  wasm: WebAssembly.Module | string,
  go: Go,
): Promise<WebAssembly.Instance> {
  if (wasm instanceof WebAssembly.Module) {
    return WebAssembly.instantiate(wasm, go.importObject);
  }

  const res = await fetch(wasm);
  if (!res.ok) throw new Error(`Failed to download ${JSON.stringify(wasm)}`);

  // Attempt to use the superior "instantiateStreaming" API first
  if (
    "instantiateStreaming" in WebAssembly &&
    /^application\/wasm($|;)/i.test(res.headers.get("Content-Type") || "")
  ) {
    const result = await WebAssembly.instantiateStreaming(res, go.importObject);
    return result.instance;
  }

  // Otherwise, fall back to the inferior "instantiate" API
  const bytes = await res.arrayBuffer();
  const result = await WebAssembly.instantiate(bytes, go.importObject);
  return result.instance;
}
