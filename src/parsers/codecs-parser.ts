export function parseEncoders(output: string): {
  video: string[];
  audio: string[];
  subtitle: string[];
} {
  const lines = output.split('\n');
  const video: string[] = [];
  const audio: string[] = [];
  const subtitle: string[] = [];
  
  let startParsing = false;
  for (const line of lines) {
    if (line.includes('------')) {
      startParsing = true;
      continue;
    }
    
    if (!startParsing || !line.trim()) continue;
    
    const match = line.match(/^\s*([VAS][.FXBD]{5})\s+(\S+)/);
    if (match) {
      const flags = match[1];
      const codec = match[2];
      const codecType = flags.charAt(0); // V, A, or S
      
      if (codecType === 'V') {
        video.push(codec);
      } else if (codecType === 'A') {
        audio.push(codec);
      } else if (codecType === 'S') {
        subtitle.push(codec);
      }
    }
  }
  
  return { video, audio, subtitle };
}

export function parseDecoders(output: string): {
  video: string[];
  audio: string[];
  subtitle: string[];
} {
  const lines = output.split('\n');
  const video: string[] = [];
  const audio: string[] = [];
  const subtitle: string[] = [];
  
  let startParsing = false;
  for (const line of lines) {
    if (line.includes('------')) {
      startParsing = true;
      continue;
    }
    
    if (!startParsing || !line.trim()) continue;
    
    const match = line.match(/^\s*([VAS][.FXBD]{5})\s+(\S+)/);
    if (match) {
      const flags = match[1];
      const codec = match[2];
      const codecType = flags.charAt(0); // V, A, or S
      
      if (codecType === 'V') {
        video.push(codec);
      } else if (codecType === 'A') {
        audio.push(codec);
      } else if (codecType === 'S') {
        subtitle.push(codec);
      }
    }
  }
  
  return { video, audio, subtitle };
}

