/** @license
 * esbuild-wasm@v0.24.0
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
// This code is ported from https://raw.githubusercontent.com/evanw/esbuild/v0.24.0/lib/npm/browser.ts and merged https://raw.githubusercontent.com/evanw/esbuild/v0.24.0/lib/shared/types.ts into.
// Modifications:
// - $ deno fmt
// - load the worker code from URL instead of an embedded code

import { createChannel } from "./common.ts";
import { ESBUILD_VERSION } from "./version.ts";
import type {
  AnalyzeMetafileOptions,
  BuildOptions,
  BuildResult,
  FormatMessagesOptions,
  InitializeOptions,
  Metafile,
  PartialMessage,
  TransformOptions,
  TransformResult,
} from "./types.ts";
export type {
  AnalyzeMetafileOptions,
  BuildFailure,
  BuildOptions,
  BuildResult,
  Charset,
  CommonOptions,
  Drop,
  Format,
  FormatMessagesOptions,
  ImportKind,
  InitializeOptions,
  Loader,
  Location,
  LogLevel,
  Message,
  Metafile,
  Note,
  OnEndResult,
  OnLoadArgs,
  OnLoadOptions,
  OnLoadResult,
  OnResolveArgs,
  OnResolveOptions,
  OnResolveResult,
  OnStartResult,
  OutputFile,
  PartialMessage,
  PartialNote,
  Platform,
  Plugin,
  PluginBuild,
  ResolveOptions,
  ResolveResult,
  ServeOnRequestArgs,
  ServeOptions,
  StdinOptions,
  TransformFailure,
  TransformOptions,
  TransformResult,
  TsconfigRaw,
  WatchOptions,
} from "./types.ts";

/**
 * the esbuild-wasm version this package is used
 */
export const version: "0.24.0" = ESBUILD_VERSION;

/**
 * This function invokes the "esbuild" command-line tool for you. It returns a
 * promise that either resolves with a {@linkcode BuildResult} object or rejects with a
 * {@linkcode BuildFailure} object.
 *
 * - Works in node: yes
 * - Works in browser: yes
 *
 * Documentation: https://esbuild.github.io/api/#build
 */
export const build = <T extends BuildOptions>(
  options: SameShape<BuildOptions, T>,
): Promise<BuildResult<T>> => ensureServiceIsRunning().build(options);

/**
 * This function transforms a single JavaScript file. It can be used to minify
 * JavaScript, convert TypeScript/JSX to JavaScript, or convert newer JavaScript
 * to older JavaScript. It returns a promise that is either resolved with a
 * {@linkcode TransformResult} object or rejected with a {@linkcode TransformFailure} object.
 *
 * - Works in node: yes
 * - Works in browser: yes
 *
 * Documentation: https://esbuild.github.io/api/#transform
 */
export const transform = <T extends TransformOptions>(
  input: string | Uint8Array,
  options?: SameShape<TransformOptions, T>,
): Promise<TransformResult<T>> =>
  ensureServiceIsRunning().transform(input, options);

/**
 * Converts log messages to formatted message strings suitable for printing in
 * the terminal. This allows you to reuse the built-in behavior of esbuild's
 * log message formatter. This is a batch-oriented API for efficiency.
 *
 * - Works in node: yes
 * - Works in browser: yes
 */
export const formatMessages = (
  messages: PartialMessage[],
  options: FormatMessagesOptions,
): Promise<string[]> =>
  ensureServiceIsRunning().formatMessages(messages, options);

/**
 * Pretty-prints an analysis of the metafile JSON to a string. This is just for
 * convenience to be able to match esbuild's pretty-printing exactly. If you want
 * to customize it, you can just inspect the data in the metafile yourself.
 *
 * - Works in node: yes
 * - Works in browser: yes
 *
 * Documentation: https://esbuild.github.io/api/#analyze
 */
export const analyzeMetafile = (
  metafile: Metafile | string,
  options?: AnalyzeMetafileOptions,
): Promise<string> =>
  ensureServiceIsRunning().analyzeMetafile(metafile, options);

/** Call this function to terminate esbuild's child process. The child process
 * is not terminated and re-created after each API call because it's more
 * efficient to keep it around when there are multiple API calls.
 *
 * In node this happens automatically before the parent node process exits. So
 * you only need to call this if you know you will not make any more esbuild
 * API calls and you want to clean up resources.
 *
 * Unlike node, Deno lacks the necessary APIs to clean up child processes
 * automatically. You must manually call stop() in Deno when you're done
 * using esbuild or Deno will continue running forever.
 *
 * Another reason you might want to call this is if you are using esbuild from
 * within a Deno test. Deno fails tests that create a child process without
 * killing it before the test ends, so you have to call this function (and
 * await the returned promise) in every Deno test that uses esbuild.
 */
export const stop = (): Promise<void> => {
  if (stopService) stopService();
  return Promise.resolve();
};

interface Service {
  build: typeof build;
  transform: typeof transform;
  formatMessages: typeof formatMessages;
  analyzeMetafile: typeof analyzeMetafile;
}

let initializePromise: Promise<void> | undefined;
let stopService: (() => void) | undefined;
let longLivedService: Service | undefined;

const ensureServiceIsRunning = (): Service => {
  if (longLivedService) return longLivedService;
  if (initializePromise) {
    throw new Error(
      'You need to wait for the promise returned from "initialize" to be resolved before calling this',
    );
  }
  throw new Error('You need to call "initialize" before calling this');
};

/**
 * This configures the browser-based version of esbuild. It is necessary to
 * call this first and wait for the returned promise to be resolved before
 * making other API calls when using esbuild in the browser.
 *
 * - Works in node: yes
 * - Works in browser: yes ("options" is required)
 *
 * Documentation: https://esbuild.github.io/api/#browser
 */
export const initialize = (options: InitializeOptions): Promise<void> => {
  const wasm = options.wasm;
  const workerURL = options.worker;

  if (initializePromise) {
    throw new Error('Cannot call "initialize" more than once');
  }
  initializePromise = startRunningService(wasm, workerURL);
  initializePromise.catch(() => {
    // Let the caller try again if this fails
    initializePromise = void 0;
  });
  return initializePromise;
};

const startRunningService = async (
  wasmModule: WebAssembly.Module | Response | string,
  workerURL: string | URL,
): Promise<void> => {
  // Run esbuild off the main thread
  const worker = new Worker(workerURL.toString(), { type: "module" });

  let firstMessageResolve: (value: void) => void;
  let firstMessageReject: (error: unknown) => void;

  const firstMessagePromise = new Promise((resolve, reject) => {
    firstMessageResolve = resolve;
    firstMessageReject = reject;
  });

  worker.onmessage = ({ data: error }) => {
    worker.onmessage = ({ data }) => readFromStdout(data);
    if (error) firstMessageReject(error);
    else firstMessageResolve();
  };

  worker.postMessage(wasmModule);

  const { readFromStdout, service } = createChannel({
    writeToStdin(bytes) {
      worker.postMessage(bytes);
    },
    isSync: false,
    hasFS: false,
    esbuild: {
      build,
      transform,
      formatMessages,
      analyzeMetafile,
      version,
      initialize,
    },
  });

  // This will throw if WebAssembly module instantiation fails
  await firstMessagePromise;
  stopService = () => {
    worker.terminate();
    initializePromise = undefined;
    stopService = undefined;
    longLivedService = undefined;
  };

  longLivedService = {
    build: (options: BuildOptions) =>
      new Promise<BuildResult>((resolve, reject) =>
        service.buildOrContext({
          callName: "build",
          refs: null,
          options,
          isTTY: false,
          defaultWD: "/",
          callback: (err, res) =>
            err ? reject(err) : resolve(res as BuildResult),
        })
      ),

    transform: (input: string | Uint8Array, options?: TransformOptions) =>
      new Promise<TransformResult>((resolve, reject) =>
        service.transform({
          callName: "transform",
          refs: null,
          input,
          options: options || {},
          isTTY: false,
          fs: {
            readFile(_, callback) {
              callback(new Error("Internal error"), null);
            },
            writeFile(_, callback) {
              callback(null);
            },
          },
          callback: (err, res) => err ? reject(err) : resolve(res!),
        })
      ),

    formatMessages: (messages, options) =>
      new Promise((resolve, reject) =>
        service.formatMessages({
          callName: "formatMessages",
          refs: null,
          messages,
          options,
          callback: (err, res) => err ? reject(err) : resolve(res!),
        })
      ),

    analyzeMetafile: (metafile, options) =>
      new Promise((resolve, reject) =>
        service.analyzeMetafile({
          callName: "analyzeMetafile",
          refs: null,
          metafile: typeof metafile === "string"
            ? metafile
            : JSON.stringify(metafile),
          options,
          callback: (err, res) => err ? reject(err) : resolve(res!),
        })
      ),
  };
};

/** This is a TypeScript type-level function which replaces any keys in {@linkcode In}
 * that aren't in {@linkcode Out} with `never`. We use this to reject properties with
 * typos in object literals. See: https://stackoverflow.com/questions/49580725
 */
export type SameShape<Out, In extends Out> =
  & In
  & { [Key in Exclude<keyof In, keyof Out>]: never };
