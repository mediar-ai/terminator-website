import type { MetadataRoute } from 'next'
import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = 'https://t8r.tech'
const APP_DIR = path.join(process.cwd(), 'src/app')

type SitemapEntry = { url: string; lastModified: Date }

function walkPages(dir: string, urlSegments: string[] = []): SitemapEntry[] {
  const results: SitemapEntry[] = []

  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of entries) {
    if (entry.isFile() && entry.name === 'page.tsx') {
      const filePath = path.join(dir, entry.name)
      const stat = fs.statSync(filePath)
      const urlPath = urlSegments.length === 0 ? '' : '/' + urlSegments.join('/')
      results.push({
        url: `${BASE_URL}${urlPath}`,
        lastModified: stat.mtime,
      })
      continue
    }

    if (!entry.isDirectory()) continue

    const name = entry.name
    if (name.startsWith('_')) continue
    if (name === 'api') continue
    if (name.startsWith('[') && name.endsWith(']')) continue

    const isRouteGroup = name.startsWith('(') && name.endsWith(')')
    const nextSegments = isRouteGroup ? urlSegments : [...urlSegments, name]

    results.push(...walkPages(path.join(dir, entry.name), nextSegments))
  }

  return results
}

export default function sitemap(): MetadataRoute.Sitemap {
  const filesystemPages = walkPages(APP_DIR)

  const seen = new Set<string>()
  const all: SitemapEntry[] = []
  for (const entry of filesystemPages) {
    if (seen.has(entry.url)) continue
    seen.add(entry.url)
    all.push(entry)
  }

  return all
}
