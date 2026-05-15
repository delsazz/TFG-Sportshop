import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
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
