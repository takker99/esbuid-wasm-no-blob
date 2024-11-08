// deno-lint-ignore-file no-explicit-any
/** esbuild-wasm@0.24.0
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
// This code is ported from https://raw.githubusercontent.com/evanw/esbuild/v0.24.0/lib/shared/types.ts and modified below:
// - $ deno fmt
// - remove functions not worked in browser
// - remove function declaretions already defined in `mod.ts`

import type {
  analyzeMetafile,
  build,
  formatMessages,
  initialize,
  transform,
  version,
} from "./mod.ts";

export type Platform = "browser" | "node" | "neutral";
export type Format = "iife" | "cjs" | "esm";
export type Loader =
  | "base64"
  | "binary"
  | "copy"
  | "css"
  | "dataurl"
  | "default"
  | "empty"
  | "file"
  | "js"
  | "json"
  | "jsx"
  | "local-css"
  | "text"
  | "ts"
  | "tsx";
export type LogLevel =
  | "verbose"
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "silent";
export type Charset = "ascii" | "utf8";
export type Drop = "console" | "debugger";

export interface CommonOptions {
  /** Documentation: https://esbuild.github.io/api/#sourcemap */
  sourcemap?: boolean | "linked" | "inline" | "external" | "both";
  /** Documentation: https://esbuild.github.io/api/#legal-comments */
  legalComments?: "none" | "inline" | "eof" | "linked" | "external";
  /** Documentation: https://esbuild.github.io/api/#source-root */
  sourceRoot?: string;
  /** Documentation: https://esbuild.github.io/api/#sources-content */
  sourcesContent?: boolean;

  /** Documentation: https://esbuild.github.io/api/#format */
  format?: Format;
  /** Documentation: https://esbuild.github.io/api/#global-name */
  globalName?: string;
  /** Documentation: https://esbuild.github.io/api/#target */
  target?: string | string[];
  /** Documentation: https://esbuild.github.io/api/#supported */
  supported?: Record<string, boolean>;
  /** Documentation: https://esbuild.github.io/api/#platform */
  platform?: Platform;

  /** Documentation: https://esbuild.github.io/api/#mangle-props */
  mangleProps?: RegExp;
  /** Documentation: https://esbuild.github.io/api/#mangle-props */
  reserveProps?: RegExp;
  /** Documentation: https://esbuild.github.io/api/#mangle-props */
  mangleQuoted?: boolean;
  /** Documentation: https://esbuild.github.io/api/#mangle-props */
  mangleCache?: Record<string, string | false>;
  /** Documentation: https://esbuild.github.io/api/#drop */
  drop?: Drop[];
  /** Documentation: https://esbuild.github.io/api/#drop-labels */
  dropLabels?: string[];
  /** Documentation: https://esbuild.github.io/api/#minify */
  minify?: boolean;
  /** Documentation: https://esbuild.github.io/api/#minify */
  minifyWhitespace?: boolean;
  /** Documentation: https://esbuild.github.io/api/#minify */
  minifyIdentifiers?: boolean;
  /** Documentation: https://esbuild.github.io/api/#minify */
  minifySyntax?: boolean;
  /** Documentation: https://esbuild.github.io/api/#line-limit */
  lineLimit?: number;
  /** Documentation: https://esbuild.github.io/api/#charset */
  charset?: Charset;
  /** Documentation: https://esbuild.github.io/api/#tree-shaking */
  treeShaking?: boolean;
  /** Documentation: https://esbuild.github.io/api/#ignore-annotations */
  ignoreAnnotations?: boolean;

  /** Documentation: https://esbuild.github.io/api/#jsx */
  jsx?: "transform" | "preserve" | "automatic";
  /** Documentation: https://esbuild.github.io/api/#jsx-factory */
  jsxFactory?: string;
  /** Documentation: https://esbuild.github.io/api/#jsx-fragment */
  jsxFragment?: string;
  /** Documentation: https://esbuild.github.io/api/#jsx-import-source */
  jsxImportSource?: string;
  /** Documentation: https://esbuild.github.io/api/#jsx-development */
  jsxDev?: boolean;
  /** Documentation: https://esbuild.github.io/api/#jsx-side-effects */
  jsxSideEffects?: boolean;

  /** Documentation: https://esbuild.github.io/api/#define */
  define?: { [key: string]: string };
  /** Documentation: https://esbuild.github.io/api/#pure */
  pure?: string[];
  /** Documentation: https://esbuild.github.io/api/#keep-names */
  keepNames?: boolean;

  /** Documentation: https://esbuild.github.io/api/#color */
  color?: boolean;
  /** Documentation: https://esbuild.github.io/api/#log-level */
  logLevel?: LogLevel;
  /** Documentation: https://esbuild.github.io/api/#log-limit */
  logLimit?: number;
  /** Documentation: https://esbuild.github.io/api/#log-override */
  logOverride?: Record<string, LogLevel>;

  /** Documentation: https://esbuild.github.io/api/#tsconfig-raw */
  tsconfigRaw?: string | TsconfigRaw;
}

export interface TsconfigRaw {
  compilerOptions?: {
    alwaysStrict?: boolean;
    baseUrl?: string;
    experimentalDecorators?: boolean;
    importsNotUsedAsValues?: "remove" | "preserve" | "error";
    jsx?: "preserve" | "react-native" | "react" | "react-jsx" | "react-jsxdev";
    jsxFactory?: string;
    jsxFragmentFactory?: string;
    jsxImportSource?: string;
    paths?: Record<string, string[]>;
    preserveValueImports?: boolean;
    strict?: boolean;
    target?: string;
    useDefineForClassFields?: boolean;
    verbatimModuleSyntax?: boolean;
  };
}

export interface BuildOptions extends CommonOptions {
  /** Documentation: https://esbuild.github.io/api/#bundle */
  bundle?: boolean;
  /** Documentation: https://esbuild.github.io/api/#splitting */
  splitting?: boolean;
  /** Documentation: https://esbuild.github.io/api/#preserve-symlinks */
  preserveSymlinks?: boolean;
  /** Documentation: https://esbuild.github.io/api/#outfile */
  outfile?: string;
  /** Documentation: https://esbuild.github.io/api/#metafile */
  metafile?: boolean;
  /** Documentation: https://esbuild.github.io/api/#outdir */
  outdir?: string;
  /** Documentation: https://esbuild.github.io/api/#outbase */
  outbase?: string;
  /** Documentation: https://esbuild.github.io/api/#external */
  external?: string[];
  /** Documentation: https://esbuild.github.io/api/#packages */
  packages?: "bundle" | "external";
  /** Documentation: https://esbuild.github.io/api/#alias */
  alias?: Record<string, string>;
  /** Documentation: https://esbuild.github.io/api/#loader */
  loader?: { [ext: string]: Loader };
  /** Documentation: https://esbuild.github.io/api/#resolve-extensions */
  resolveExtensions?: string[];
  /** Documentation: https://esbuild.github.io/api/#main-fields */
  mainFields?: string[];
  /** Documentation: https://esbuild.github.io/api/#conditions */
  conditions?: string[];
  /** Documentation: https://esbuild.github.io/api/#write */
  write?: boolean;
  /** Documentation: https://esbuild.github.io/api/#allow-overwrite */
  allowOverwrite?: boolean;
  /** Documentation: https://esbuild.github.io/api/#tsconfig */
  tsconfig?: string;
  /** Documentation: https://esbuild.github.io/api/#out-extension */
  outExtension?: { [ext: string]: string };
  /** Documentation: https://esbuild.github.io/api/#public-path */
  publicPath?: string;
  /** Documentation: https://esbuild.github.io/api/#entry-names */
  entryNames?: string;
  /** Documentation: https://esbuild.github.io/api/#chunk-names */
  chunkNames?: string;
  /** Documentation: https://esbuild.github.io/api/#asset-names */
  assetNames?: string;
  /** Documentation: https://esbuild.github.io/api/#inject */
  inject?: string[];
  /** Documentation: https://esbuild.github.io/api/#banner */
  banner?: { [type: string]: string };
  /** Documentation: https://esbuild.github.io/api/#footer */
  footer?: { [type: string]: string };
  /** Documentation: https://esbuild.github.io/api/#entry-points */
  entryPoints?: string[] | Record<string, string> | {
    in: string;
    out: string;
  }[];
  /** Documentation: https://esbuild.github.io/api/#stdin */
  stdin?: StdinOptions;
  /** Documentation: https://esbuild.github.io/plugins/ */
  plugins?: Plugin[];
  /** Documentation: https://esbuild.github.io/api/#working-directory */
  absWorkingDir?: string;
  /** Documentation: https://esbuild.github.io/api/#node-paths */
  nodePaths?: string[]; // The "NODE_PATH" variable from Node.js
}

export interface StdinOptions {
  contents: string | Uint8Array;
  resolveDir?: string;
  sourcefile?: string;
  loader?: Loader;
}

export interface Message {
  id: string;
  pluginName: string;
  text: string;
  location: Location | null;
  notes: Note[];

  /**
   * Optional user-specified data that is passed through unmodified. You can
   * use this to stash the original error, for example.
   */
  detail: any;
}

export interface Note {
  text: string;
  location: Location | null;
}

export interface Location {
  file: string;
  namespace: string;
  /** 1-based */
  line: number;
  /** 0-based, in bytes */
  column: number;
  /** in bytes */
  length: number;
  lineText: string;
  suggestion: string;
}

export interface OutputFile {
  path: string;
  contents: Uint8Array;
  hash: string;
  /** "contents" as text (changes automatically with "contents") */
  readonly text: string;
}

export interface BuildResult<
  ProvidedOptions extends BuildOptions = BuildOptions,
> {
  errors: Message[];
  warnings: Message[];
  /** Only when "write: false" */
  outputFiles:
    | OutputFile[]
    | (ProvidedOptions["write"] extends false ? never : undefined);
  /** Only when "metafile: true" */
  metafile:
    | Metafile
    | (ProvidedOptions["metafile"] extends true ? never : undefined);
  /** Only when "mangleCache" is present */
  mangleCache:
    | Record<string, string | false>
    // deno-lint-ignore ban-types
    | (ProvidedOptions["mangleCache"] extends Object ? never : undefined);
}

export interface BuildFailure extends Error {
  errors: Message[];
  warnings: Message[];
}

/** Documentation: https://esbuild.github.io/api/#serve-arguments */
export interface ServeOptions {
  port?: number;
  host?: string;
  servedir?: string;
  keyfile?: string;
  certfile?: string;
  fallback?: string;
  onRequest?: (args: ServeOnRequestArgs) => void;
}

export interface ServeOnRequestArgs {
  remoteAddress: string;
  method: string;
  path: string;
  status: number;
  /** The time to generate the response, not to send it */
  timeInMS: number;
}

/** Documentation: https://esbuild.github.io/api/#serve-return-values */
export interface ServeResult {
  port: number;
  host: string;
}

export interface TransformOptions extends CommonOptions {
  /** Documentation: https://esbuild.github.io/api/#sourcefile */
  sourcefile?: string;
  /** Documentation: https://esbuild.github.io/api/#loader */
  loader?: Loader;
  /** Documentation: https://esbuild.github.io/api/#banner */
  banner?: string;
  /** Documentation: https://esbuild.github.io/api/#footer */
  footer?: string;
}

export interface TransformResult<
  ProvidedOptions extends TransformOptions = TransformOptions,
> {
  code: string;
  map: string;
  warnings: Message[];
  /** Only when "mangleCache" is present */
  mangleCache:
    | Record<string, string | false>
    // deno-lint-ignore ban-types
    | (ProvidedOptions["mangleCache"] extends Object ? never : undefined);
  /** Only when "legalComments" is "external" */
  legalComments:
    | string
    | (ProvidedOptions["legalComments"] extends "external" ? never : undefined);
}

export interface TransformFailure extends Error {
  errors: Message[];
  warnings: Message[];
}

export interface Plugin {
  name: string;
  setup: (build: PluginBuild) => void | Promise<void>;
}

export interface PluginBuild {
  /** Documentation: https://esbuild.github.io/plugins/#build-options */
  initialOptions: BuildOptions;

  /** Documentation: https://esbuild.github.io/plugins/#resolve */
  resolve(path: string, options?: ResolveOptions): Promise<ResolveResult>;

  /** Documentation: https://esbuild.github.io/plugins/#on-start */
  onStart(
    callback: () =>
      | OnStartResult
      | null
      | void
      | Promise<OnStartResult | null | void>,
  ): void;

  /** Documentation: https://esbuild.github.io/plugins/#on-end */
  onEnd(
    callback: (
      result: BuildResult,
    ) => OnEndResult | null | void | Promise<OnEndResult | null | void>,
  ): void;

  /** Documentation: https://esbuild.github.io/plugins/#on-resolve */
  onResolve(
    options: OnResolveOptions,
    callback: (
      args: OnResolveArgs,
    ) =>
      | OnResolveResult
      | null
      | undefined
      | Promise<OnResolveResult | null | undefined>,
  ): void;

  /** Documentation: https://esbuild.github.io/plugins/#on-load */
  onLoad(
    options: OnLoadOptions,
    callback: (
      args: OnLoadArgs,
    ) =>
      | OnLoadResult
      | null
      | undefined
      | Promise<OnLoadResult | null | undefined>,
  ): void;

  /** Documentation: https://esbuild.github.io/plugins/#on-dispose */
  onDispose(callback: () => void): void;

  // This is a full copy of the esbuild library in case you need it
  esbuild: {
    build: typeof build;
    transform: typeof transform;
    formatMessages: typeof formatMessages;
    analyzeMetafile: typeof analyzeMetafile;
    initialize: typeof initialize;
    version: typeof version;
  };
}

/** Documentation: https://esbuild.github.io/plugins/#resolve-options */
export interface ResolveOptions {
  pluginName?: string;
  importer?: string;
  namespace?: string;
  resolveDir?: string;
  kind?: ImportKind;
  pluginData?: any;
  with?: Record<string, string>;
}

/** Documentation: https://esbuild.github.io/plugins/#resolve-results */
export interface ResolveResult {
  errors: Message[];
  warnings: Message[];

  path: string;
  external: boolean;
  sideEffects: boolean;
  namespace: string;
  suffix: string;
  pluginData: any;
}

export interface OnStartResult {
  errors?: PartialMessage[];
  warnings?: PartialMessage[];
}

export interface OnEndResult {
  errors?: PartialMessage[];
  warnings?: PartialMessage[];
}

/** Documentation: https://esbuild.github.io/plugins/#on-resolve-options */
export interface OnResolveOptions {
  filter: RegExp;
  namespace?: string;
}

/** Documentation: https://esbuild.github.io/plugins/#on-resolve-arguments */
export interface OnResolveArgs {
  path: string;
  importer: string;
  namespace: string;
  resolveDir: string;
  kind: ImportKind;
  pluginData: any;
  with: Record<string, string>;
}

export type ImportKind =
  | "entry-point"
  // JS
  | "import-statement"
  | "require-call"
  | "dynamic-import"
  | "require-resolve"
  // CSS
  | "import-rule"
  | "composes-from"
  | "url-token";

/** Documentation: https://esbuild.github.io/plugins/#on-resolve-results */
export interface OnResolveResult {
  pluginName?: string;

  errors?: PartialMessage[];
  warnings?: PartialMessage[];

  path?: string;
  external?: boolean;
  sideEffects?: boolean;
  namespace?: string;
  suffix?: string;
  pluginData?: any;

  watchFiles?: string[];
  watchDirs?: string[];
}

/** Documentation: https://esbuild.github.io/plugins/#on-load-options */
export interface OnLoadOptions {
  filter: RegExp;
  namespace?: string;
}

/** Documentation: https://esbuild.github.io/plugins/#on-load-arguments */
export interface OnLoadArgs {
  path: string;
  namespace: string;
  suffix: string;
  pluginData: any;
  with: Record<string, string>;
}

/** Documentation: https://esbuild.github.io/plugins/#on-load-results */
export interface OnLoadResult {
  pluginName?: string;

  errors?: PartialMessage[];
  warnings?: PartialMessage[];

  contents?: string | Uint8Array;
  resolveDir?: string;
  loader?: Loader;
  pluginData?: any;

  watchFiles?: string[];
  watchDirs?: string[];
}

export interface PartialMessage {
  id?: string;
  pluginName?: string;
  text?: string;
  location?: Partial<Location> | null;
  notes?: PartialNote[];
  detail?: any;
}

export interface PartialNote {
  text?: string;
  location?: Partial<Location> | null;
}

/** Documentation: https://esbuild.github.io/api/#metafile */
export interface Metafile {
  inputs: {
    [path: string]: {
      bytes: number;
      imports: {
        path: string;
        kind: ImportKind;
        external?: boolean;
        original?: string;
        with?: Record<string, string>;
      }[];
      format?: "cjs" | "esm";
      with?: Record<string, string>;
    };
  };
  outputs: {
    [path: string]: {
      bytes: number;
      inputs: {
        [path: string]: {
          bytesInOutput: number;
        };
      };
      imports: {
        path: string;
        kind: ImportKind | "file-loader";
        external?: boolean;
      }[];
      exports: string[];
      entryPoint?: string;
      cssBundle?: string;
    };
  };
}

export interface FormatMessagesOptions {
  kind: "error" | "warning";
  color?: boolean;
  terminalWidth?: number;
}

export interface AnalyzeMetafileOptions {
  color?: boolean;
  verbose?: boolean;
}

// deno-lint-ignore no-empty-interface
export interface WatchOptions {}

export interface BuildContext<
  ProvidedOptions extends BuildOptions = BuildOptions,
> {
  /** Documentation: https://esbuild.github.io/api/#rebuild */
  rebuild(): Promise<BuildResult<ProvidedOptions>>;

  /** Documentation: https://esbuild.github.io/api/#watch */
  watch(options?: WatchOptions): Promise<void>;

  /** Documentation: https://esbuild.github.io/api/#serve */
  serve(options?: ServeOptions): Promise<ServeResult>;

  cancel(): Promise<void>;
  dispose(): Promise<void>;
}

export interface InitializeOptions {
  /**
   * The result of calling "new WebAssembly.Module(buffer)" where "buffer"
   * is a typed array or ArrayBuffer containing the binary code of the
   * "esbuild.wasm" file.
   */
  wasm: WebAssembly.Module | Response | string | URL;

  /** The URL of the "wasm_exec.js" file. */
  worker: string | URL;
}
