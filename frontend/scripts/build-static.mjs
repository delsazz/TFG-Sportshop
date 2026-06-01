import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })

for (const dir of ['css', 'js', 'public']) {
  const source = join(root, dir)
  if (existsSync(source)) {
    cpSync(source, dir === 'public' ? dist : join(dist, dir), { recursive: true })
  }
}

const sharedLogo = join(root, '..', 'admin', 'public', 'img', 'sportshop.jpg')
const frontendLogo = join(dist, 'img', 'sportshop.jpg')
if (!existsSync(frontendLogo) && existsSync(sharedLogo)) {
  mkdirSync(join(dist, 'img'), { recursive: true })
  cpSync(sharedLogo, frontendLogo)
}

cpSync(join(root, 'src', 'pages'), dist, { recursive: true })

writeFileSync(
  join(dist, 'index.html'),
  `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sportshop</title>
    <meta http-equiv="refresh" content="0; url=inicio.html" />
  </head>
  <body>
    <a href="inicio.html">Entrar en Sportshop</a>
  </body>
</html>
`,
)
