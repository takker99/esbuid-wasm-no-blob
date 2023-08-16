// cf. https://github.com/evanw/esbuild/blob/d751dfb82002d332aa4dbfa89c74d25203d28123/scripts/esbuild.js#L85-L107

import { build, stop } from "https://deno.land/x/esbuild@v0.17.19/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.1/mod.ts";

const worker = await build({
  plugins: [...denoPlugins()],
  entryPoints: [new URL("../worker.ts", import.meta.url).href],
  write: false,
  bundle: true,
  minify: true,
  legalComments: "eof",
  format: "esm",
});
const client = await build({
  plugins: [...denoPlugins()],
  entryPoints: [new URL("../mod.ts", import.meta.url).href],
  write: false,
  bundle: true,
  minify: true,
  legalComments: "eof",
  format: "esm",
});

await Deno.writeTextFile("./worker.js", worker.outputFiles[0].text);
await Deno.writeTextFile("./mod.js", client.outputFiles[0].text);

stop();
