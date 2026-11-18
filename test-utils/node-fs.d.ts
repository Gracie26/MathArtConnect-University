/**
 * Minimal typing for the one Node API the tests use (reading a migration file
 * to compare it with the content). Node's full global types are deliberately
 * not added to the project because they would leak into React Native code.
 */
declare module 'fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function readdirSync(path: string): string[];
  export function statSync(path: string): { isDirectory(): boolean };
}
