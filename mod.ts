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
// This code is ported from https://raw.githubusercontent.com/evanw/esbuild/v0.16.17/lib/shared/common.ts and modified below
// - $ deno fmt
// - load the worker code from URL instead of an embedded code

import * as types from "./types.ts";
import * as common from "./common.ts";
import { ESBUILD_VERSION } from "./version.ts";

export const version = ESBUILD_VERSION;

// @ts-ignore type error caused by function overload
export const build: typeof types.build = (
  options: types.BuildOptions,
) => ensureServiceIsRunning().then((service) => service.build(options));

export const transform: typeof types.transform = (input, options) =>
  ensureServiceIsRunning().then((service) => service.transform(input, options));

export const formatMessages: typeof types.formatMessages = (
  messages,
  options,
) =>
  ensureServiceIsRunning().then((service) =>
    service.formatMessages(messages, options)
  );

export const analyzeMetafile: typeof types.analyzeMetafile = (
  metafile,
  options,
) =>
  ensureServiceIsRunning().then((service) =>
    service.analyzeMetafile(metafile, options)
  );

export const stop = () => {
  if (stopService) stopService();
};

interface Service {
  build: typeof types.build;
  transform: typeof types.transform;
  formatMessages: typeof types.formatMessages;
  analyzeMetafile: typeof types.analyzeMetafile;
}

let initializePromise: Promise<Service> | undefined;
let stopService: (() => void) | undefined;

const ensureServiceIsRunning = (): Promise<Service> => {
  if (!initializePromise) {
    throw new Error('You must call "initialize"');
  }
  return initializePromise;
};

export const initialize: typeof types.initialize = async (options) => {
  options = common.validateInitializeOptions(options || {});
  if (initializePromise) {
    throw new Error('Cannot call "initialize" more than once');
  }
  initializePromise = startRunningService(
    options.wasmModule,
    options.workerURL,
  );
  initializePromise.catch(() => {
    // Let the caller try again if this fails
    initializePromise = void 0;
  });
  await initializePromise;
};

const startRunningService = async (
  wasmModule: WebAssembly.Module | undefined,
  workerURL: string | URL,
): Promise<Service> => {
  // Run esbuild off the main thread
  const worker = new Worker(workerURL.toString());

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

  const { readFromStdout, service } = common.createChannel({
    writeToStdin(bytes) {
      worker.postMessage(bytes);
    },
    isSync: false,
    isWriteUnavailable: true,

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
  };

  return {
    // @ts-ignore type error caused by function overload
    build: (options: types.BuildOptions) =>
      new Promise<types.BuildResult>((resolve, reject) =>
        service.buildOrServe({
          callName: "build",
          refs: null,
          serveOptions: null,
          options,
          isTTY: false,
          defaultWD: "/",
          callback: (err, res) =>
            err ? reject(err) : resolve(res as types.BuildResult),
        })
      ),
    transform: (input, options) =>
      new Promise((resolve, reject) =>
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
