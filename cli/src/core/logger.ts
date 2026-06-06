import pc from "picocolors";

export const logger = {
  info(message: string) {
    console.log(`${pc.cyan("•")} ${message}`);
  },
  success(message: string) {
    console.log(`${pc.green("✓")} ${message}`);
  },
  warning(message: string) {
    console.log(`${pc.yellow("!")} ${message}`);
  },
  error(message: string) {
    console.error(`${pc.red("✗")} ${message}`);
  },
  heading(message: string) {
    console.log(`\n${pc.bold(message)}`);
  },
  link(url: string) {
    console.log(`  ${pc.underline(pc.cyan(url))}`);
  },
  command(command: string, description: string) {
    console.log(`  ${pc.cyan(command)}\n    ${pc.dim(description)}`);
  },
  detail(message: string) {
    const lines = wrapText(message, getContentWidth());
    console.log(
      lines
        .map((line, index) =>
          index === 0 ? `  ${pc.yellow("•")} ${line}` : `    ${line}`,
        )
        .join("\n"),
    );
  },
};

function getContentWidth(): number {
  const terminalWidth = process.stdout.columns ?? 100;
  return Math.max(40, Math.min(terminalWidth - 4, 80));
}

function wrapText(message: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";

  for (const word of message.split(/\s+/)) {
    if (line.length > 0 && line.length + word.length + 1 > width) {
      lines.push(line);
      line = word;
      continue;
    }
    line = line.length === 0 ? word : `${line} ${word}`;
  }

  if (line.length > 0) {
    lines.push(line);
  }

  return lines;
}
