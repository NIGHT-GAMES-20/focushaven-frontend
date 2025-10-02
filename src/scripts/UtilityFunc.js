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