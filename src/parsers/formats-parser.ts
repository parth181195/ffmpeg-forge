export function parseFormats(output: string): { demuxing: string[]; muxing: string[] } {
  const lines = output.split('\n');
  const demuxing: string[] = [];
  const muxing: string[] = [];

  // Skip header lines
  let startParsing = false;
  for (const line of lines) {
    if (line.includes('--')) {
      startParsing = true;
      continue;
    }

    if (!startParsing || !line.trim()) continue;

    const match = line.match(/^\s*([DE\s]{2})\s+(\S+)/);
    if (match) {
      const flags = match[1];
      const format = match[2];

      if (flags.includes('D')) demuxing.push(format);
      if (flags.includes('E')) muxing.push(format);
    }
  }

  return { demuxing, muxing };
}
