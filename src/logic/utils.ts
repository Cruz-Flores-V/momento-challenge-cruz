import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export async function readFromCSV (filename: string) {
  const file = path.join(__dirname, filename)
  const content = fs.readFileSync(file, 'utf8')

  const options = {
    columns: true,
    skip_empty_lines: true,
  }

  const data = await parse(content, options)
  return data
}
