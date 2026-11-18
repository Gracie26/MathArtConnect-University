#!/usr/bin/env node
/**
 * Runs Jest with the arguments given (npm test -- <args>).
 *
 * On Windows, VS Code opens the project as "c:\…" while Node resolves real paths as "C:\…". With the
 * current expo-router testing library, Jest then registers React under both spellings: screens get two
 * copies of React and every full-router test fails with "Invalid hook call". Starting Jest from the
 * upper-case path avoids that. On other systems this simply runs Jest.
 */
const { spawnSync } = require('node:child_process');

const upperDrive = (p) => (process.platform === 'win32' && /^[a-z]:/.test(p) ? p[0].toUpperCase() + p.slice(1) : p);

const jest = upperDrive(require.resolve('jest/bin/jest'));
const result = spawnSync(process.execPath, [jest, ...process.argv.slice(2)], {
  cwd: upperDrive(process.cwd()),
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
