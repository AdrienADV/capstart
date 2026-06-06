import pc from "picocolors";

export const logger = {
  info(message: string) {
    console.log(`${pc.cyan("•")} ${message}`);
  },
  success(message: string) {
    console.log(`${pc.green("✓")} ${message}`);
  },
  warning(message: string) {
    console.warn(`${pc.yellow("!")} ${message}`);
  },
  error(message: string) {
    console.error(`${pc.red("✗")} ${message}`);
  },
  heading(message: string) {
    console.log(`\n${pc.bold(message)}`);
  },
};
