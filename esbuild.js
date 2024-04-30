const esbuild = require("esbuild")

const path = require("path")
const util = require("util")
const readFile = util.promisify(require("fs").readFile)

const InlineCSSPlugin = (_options = {}) => {
  return {
    name: "inline-css",
    setup(build) {
      build.onLoad({ filter: /\.(css)$/ }, async (args) => {
        const sourcePath = path.resolve(args.resolveDir, args.path)
        const sourceJS = await generateInjectCSS(sourcePath)
        return {
          contents: sourceJS,
          loader: "js",
        }
      })
    },
  }
}

async function generateInjectCSS(sourcePath) {
  const sourceCSS = await readFile(sourcePath)
  let transformed = await esbuild.transform(sourceCSS, {
    loader: "css",
    minify: true,
  })
  const minified = ("" + transformed.code.trim())
    .replaceAll(/\s+/g, " ")
    .replaceAll(/\s*([{},;:])\s*/g, "$1")

  return `(function(){
    var e = document.createElement('style')
    e.textContent = \`${minified}\`
    document.head.appendChild(e)
  })();`
}

esbuild.build({
  entryPoints: [{out:"f3cc",in:"main.js"}, {out:"f3cc/gcm", in:"gcm.js"}],
  outdir: "feincms3_cookiecontrol/static",
  bundle: true,
  minify: true,
  plugins: [InlineCSSPlugin()],
})
