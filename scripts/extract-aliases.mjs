import { readFile, mkdir, writeFile } from 'node:fs/promises'

const report = JSON.parse(await readFile(new URL('../_work/workbook-report.json', import.meta.url), 'utf8'))
const sheet = report.sheets.find((item) => item.title === 'db')
if (!sheet || sheet.rows.length !== 106) throw new Error('Expected the 106-row db sheet in workbook-report.json')

const pairs = sheet.rows.map((row) => {
  const values = Object.fromEntries(row.cells.map((cell) => [cell.cell[0], String(cell.value ?? '')]))
  return [values.A.normalize('NFC'), values.B.normalize('NFC')]
})

const output = `// Generated from _ref/吃鸡统计表 v4.1.3.xlsm (db!A1:B106).\n` +
  `// The source workbook remains the authority; do not edit this table by hand.\n` +
  `export const CHARACTER_ALIAS_GROUPS = ${JSON.stringify(pairs, null, 2)} as const\n`

await mkdir(new URL('../src/data/', import.meta.url), { recursive: true })
await writeFile(new URL('../src/data/character-aliases.ts', import.meta.url), output)
