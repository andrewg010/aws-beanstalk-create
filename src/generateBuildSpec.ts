import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { docsBucket } from '../config/buildspec-config.json'

(() => {
  if (!docsBucket) throw new Error('Please fill in config/buildspec-config.json')
  const data = readFileSync('required-files/buildspec.yml').toString()
  if (!existsSync(join(__dirname, '../generated'))) mkdirSync('generated')
  writeFileSync(join(__dirname, '../generated/buildspec.yml'), data.replace(/\[bucket-name\]/g, docsBucket), 'utf-8')
})()
