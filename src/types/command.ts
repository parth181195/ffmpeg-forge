export interface FFmpegCommand {
  args: string[];
  inputFile?: string;
  outputFile?: string;
}

export interface CommandOptions {
  input?: string;
  output?: string;
  format?: string;
  overwrite?: boolean;
  hideOutput?: boolean;
  customArgs?: string[];
}
