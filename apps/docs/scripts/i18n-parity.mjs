#!/usr/bin/env node
// Verifies that every page in the default locale (English, content root)
// has a translation in each secondary locale, and vice versa.
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT_DIR = fileURLToPath(new URL('../src/content/docs', import.meta.url));
const SECONDARY_LOCALES = ['es'];
const PAGE_EXTENSION = /\.mdx?$/;

const toSlug = (file) => file.replace(PAGE_EXTENSION, '');

export function comparePages(defaultPages, localePages) {
  const defaultSlugs = new Set(defaultPages.map(toSlug));
  const localeSlugs = new Set(localePages.map(toSlug));

  return {
    missing: defaultPages.filter((page) => !localeSlugs.has(toSlug(page))),
    orphaned: localePages.filter((page) => !defaultSlugs.has(toSlug(page))),
  };
}

function listPages(dir, excludedDirs = []) {
  const pages = [];
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const path = join(current, entry);
      if (statSync(path).isDirectory()) {
        if (!excludedDirs.includes(path)) walk(path);
      } else if (PAGE_EXTENSION.test(entry)) {
        pages.push(relative(dir, path).split(sep).join('/'));
      }
    }
  };
  walk(dir);
  return pages.sort();
}

function main() {
  const localeDirs = SECONDARY_LOCALES.map((locale) => join(CONTENT_DIR, locale));
  const defaultPages = listPages(CONTENT_DIR, localeDirs);
  let failed = false;

  for (const [index, locale] of SECONDARY_LOCALES.entries()) {
    const { missing, orphaned } = comparePages(defaultPages, listPages(localeDirs[index]));
    for (const page of missing) console.error(`[${locale}] missing translation: ${page}`);
    for (const page of orphaned) console.error(`[${locale}] orphaned translation: ${locale}/${page}`);
    failed ||= missing.length > 0 || orphaned.length > 0;
  }

  if (failed) process.exit(1);
  console.log(`i18n parity OK: ${defaultPages.length} pages x ${SECONDARY_LOCALES.length} locale(s)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
