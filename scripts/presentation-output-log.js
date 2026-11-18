/**
 * Preloaded (NODE_OPTIONS=--require) only by start-presentation.ps1. Copies everything Expo and Metro
 * print to the file in MATHART_PRESENTATION_LOG, while the output still goes straight to the terminal.
 *
 * Why not pipe Expo's output instead? A piped Expo is non-interactive: it prints no QR code and ignores
 * the r / w / a keys. Copying from inside Node keeps the terminal a real terminal, and the launcher can
 * still read the log afterwards to see whether startup failed because of a damaged Metro cache.
 */
const fs = require('node:fs');

const file = process.env.MATHART_PRESENTATION_LOG;
if (file) {
  for (const stream of [process.stdout, process.stderr]) {
    const write = stream.write.bind(stream);
    stream.write = (chunk, ...rest) => {
      try {
        fs.appendFileSync(file, chunk);
      } catch {
        // Logging must never break the app.
      }
      return write(chunk, ...rest);
    };
  }
}
