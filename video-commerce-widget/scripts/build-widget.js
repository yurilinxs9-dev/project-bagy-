const esbuild = require('esbuild')
const path = require('path')
const fs = require('fs')
const zlib = require('zlib')

async function build() {
  console.log('🔨 Buildando widget...')

  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../src/widget/mount.ts')],
    bundle: true,
    minify: true,
    platform: 'browser',
    target: ['es2020', 'chrome80', 'firefox78', 'safari13'],
    outfile: path.resolve(__dirname, '../public/widget.js'),
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
      '.json': 'json',
    },
    // CSS: injetar como style tag via plugin simples
    plugins: [
      {
        name: 'css-inject',
        setup(build) {
          build.onLoad({ filter: /\.css$/ }, async (args) => {
            const css = await fs.promises.readFile(args.path, 'utf8')
            return {
              contents: `
                const style = document.createElement('style');
                style.textContent = ${JSON.stringify(css)};
                document.head.appendChild(style);
              `,
              loader: 'js',
            }
          })
        },
      },
    ],
    logLevel: 'info',
  })

  // Verificar tamanho gzipped
  const widgetPath = path.resolve(__dirname, '../public/widget.js')
  const content = fs.readFileSync(widgetPath)
  const gzipped = zlib.gzipSync(content)
  const sizeKB = (content.length / 1024).toFixed(1)
  const gzippedKB = (gzipped.length / 1024).toFixed(1)

  console.log(`✅ Widget gerado em public/widget.js`)
  console.log(`   Tamanho: ${sizeKB}KB (${gzippedKB}KB gzipped)`)

  if (gzipped.length > 50 * 1024) {
    console.warn(`⚠️  Bundle gzipped (${gzippedKB}KB) excede limite de 50KB`)
  } else {
    console.log(`   ✓ Dentro do limite de 50KB gzipped`)
  }
}

build().catch((e) => {
  console.error('❌ Build falhou:', e)
  process.exit(1)
})
