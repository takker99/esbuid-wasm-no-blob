/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="deno.worker" />

/** @license
 * esbuild-wasm@0.21.5
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

import { ESBUILD_VERSION } from "./version.ts";
//@ts-ignore let environmental variable
globalThis.ESBUILD_VERSION = ESBUILD_VERSION;
import "https://raw.githubusercontent.com/golang/go/go1.20.12/misc/wasm/wasm_exec.js";
import "https://raw.githubusercontent.com/evanw/esbuild/v0.21.5/lib/shared/worker.ts";
