import * as jdenticon from 'jdenticon';

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return `${mins} min ${secs} sec`;
  }
  return `${secs} sec`;
}

export function reloader(s) {
  setTimeout(() => {
    window.location.reload();
  }, s * 1000); // Convert seconds to milliseconds
}

export function generateIdenticon(seed) {
  const size = 100;
  const svg = jdenticon.toSvg(seed, size);
  // Encode SVG safely to a data URL
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}