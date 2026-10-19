import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const configPath = join(root, 'host.json')
const next = process.argv[2]
if (!next || next.includes('/') || next.includes(':')) {
  console.error('Usage: node scripts/set-host.mjs <host>   e.g. maxai.knowmax.in (no https://, no path)')
  process.exit(1)
}
const { host: current } = JSON.parse(readFileSync(configPath, 'utf8'))

/** Code blocks and the `api:` frontmatter can't read variables, so the host is written into each page and swapped here. */
const files = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (p.endsWith('.mdx')) files.push(p)
  }
}
walk(root)

let changed = 0
for (const file of files) {
  const text = readFileSync(file, 'utf8')
  const updated = text.split(current).join(next)
  if (updated !== text) { writeFileSync(file, updated); changed++ }
}
writeFileSync(configPath, JSON.stringify({ host: next }, null, 2) + '\n')
console.log(`${current} -> ${next} in ${changed} of ${files.length} pages`)
