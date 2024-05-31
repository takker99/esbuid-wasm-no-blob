// cf. https://github.com/evanw/esbuild/blob/d751dfb82002d332aa4dbfa89c74d25203d28123/scripts/esbuild.js#L85-L107

import { build, stop } from "https://deno.land/x/esbuild@v0.17.19/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.1/mod.ts";
import { ESBUILD_VERSION } from "../version.ts";

const { outputFiles } = await build({
  entryPoints: [
    new URL("../mod.ts", import.meta.url).href,
    new URL("../worker.ts", import.meta.url).href,
  ],
  plugins: [...denoPlugins()],
  write: false,
  bundle: true,
  minify: true,
  format: "esm",
  legalComments: "eof",
  outdir: "/",
  banner: { js: `// deno-fmt-ignore-file\n// deno-lint-ignore-file` },
  define: { ESBUILD_VERSION: `"${ESBUILD_VERSION}"` },
});

for (const file of ["mod.js", "worker.js"]) {
  await Deno.writeTextFile(
    `./${file}`,
    outputFiles.find((f) => f.path === `/${file}`)!.text,
  );
}

stop();
