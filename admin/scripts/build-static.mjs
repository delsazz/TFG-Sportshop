import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const pages = join(root, 'pages')

rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })

for (const dir of ['css', 'js', 'public']) {
  const source = join(root, dir)
  if (existsSync(source)) {
    cpSync(source, dir === 'public' ? dist : join(dist, dir), { recursive: true })
  }
}

for (const entry of readdirSync(pages, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) {
    continue
  }

  const source = join(pages, entry.name)
  const target = join(dist, entry.name)
  const html = readFileSync(source, 'utf8').replaceAll('../css/', 'css/')
  writeFileSync(target, html)
}
