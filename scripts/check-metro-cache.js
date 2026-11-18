#!/usr/bin/env node
/**
 * Used by start-presentation.ps1 before Expo starts. Metro keeps its file index in
 * %TEMP%\metro-file-map-*, written with v8.serialize. A file damaged by a power cut makes Metro log
 * "Error while reading cache ... Unable to deserialize cloned data" and can stop startup. This reads
 * each of those files the same way Metro does. Exit code 0: all readable (or none yet). Exit code 1:
 * at least one is damaged, so the launcher starts once with a cache rebuild (-c). Nothing is deleted.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const v8 = require('node:v8');

const dir = os.tmpdir();
const damaged = [];
let names = [];
try {
  names = fs.readdirSync(dir).filter((name) => name.startsWith('metro-file-map-'));
} catch {
  process.exit(0);
}
for (const name of names) {
  const file = path.join(dir, name);
  try {
    if (!fs.statSync(file).isFile()) continue;
    v8.deserialize(fs.readFileSync(file));
  } catch (error) {
    damaged.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
if (damaged.length > 0) {
  console.log(`Damaged Metro cache file(s):\n  ${damaged.join('\n  ')}`);
  process.exit(1);
}
process.exit(0);
