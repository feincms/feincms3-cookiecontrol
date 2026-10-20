const esbuild = require("esbuild")

const path = require("node:path")
const util = require("node:util")
const readFile = util.promisify(require("node:fs").readFile)

const InlineCSSPlugin = (_options = {}) => {
  return {
    name: "inline-css",
    setup(build) {
      build.onLoad({ filter: /\.(css)$/ }, async (args) => {
        const sourcePath = path.resolve(args.resolveDir, args.path)
        const sourceJS = await generateCSSModule(sourcePath)
        return {
          contents: sourceJS,
          loader: "js",
        }
      })
    },
  }
}

async function generateCSSModule(sourcePath) {
  const sourceCSS = await readFile(sourcePath)
  const transformed = await esbuild.transform(sourceCSS, {
    loader: "css",
    minify: true,
  })
  const minified = `${transformed.code.trim()}`
    .replaceAll(/\s+/g, " ")
    .replaceAll(/\s*([{},;:])\s*/g, "$1")

  return `export default ${JSON.stringify(minified)}`
}

esbuild.build({
  entryPoints: [
    { out: "f3cc", in: "./src/main.js" },
    { out: "f3cc/gcm", in: "./src/gcm.js" },
    { out: "f3cc/consent-mode-advanced", in: "./src/consent-mode-advanced.js" },
  ],
  outdir: "feincms3_cookiecontrol/static",
  bundle: true,
  minify: true,
  plugins: [InlineCSSPlugin()],
})
