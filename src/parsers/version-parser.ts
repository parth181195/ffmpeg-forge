import type { FFmpegVersionInfo } from '../types/version';

export function parseVersion(output: string): FFmpegVersionInfo {
  const lines = output.split('\n');
  const versionLine = lines[0];
  
  // Parse version
  const versionMatch = versionLine.match(/ffmpeg version ([^\s]+)/);
  const version = versionMatch ? versionMatch[1] : 'unknown';
  
  // Parse copyright
  const copyrightMatch = versionLine.match(/Copyright \(c\) (.+)/);
  const copyright = copyrightMatch ? copyrightMatch[1] : '';
  
  // Parse configuration
  const configLines = lines.filter(line => line.trim().startsWith('--'));
  const configuration = configLines.map(line => line.trim());
  
  // Parse library versions
  const libVersions: { [key: string]: string } = {};
  const libLines = lines.filter(line => line.trim().match(/^lib\w+\s+\d+\./));
  libLines.forEach(line => {
    const match = line.trim().match(/^(lib\w+)\s+([\d.]+)/);
    if (match) {
      libVersions[match[1]] = match[2];
    }
  });
  
  return {
    version,
    copyright,
    configuration,
    libVersions
  };
}

