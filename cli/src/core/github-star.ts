import { confirm, isCancel } from "@clack/prompts";
import { logger } from "./logger.js";
import { commandExists, runCommand } from "./process.js";

const repository = "AdrienADV/capstart";

export interface GithubStarPrompt {
  confirmStar(): Promise<boolean>;
}

export const terminalGithubStarPrompt: GithubStarPrompt = {
  async confirmStar() {
    const answer = await confirm({
      message: "Would you like to star Capstart on GitHub?",
      initialValue: true,
    });
    return isCancel(answer) ? false : answer;
  },
};

export async function offerGithubStar(options: {
  cwd: string;
  interactive: boolean;
  isGhInstalled?: () => Promise<boolean>;
  prompt?: GithubStarPrompt;
  starRepository?: () => Promise<void>;
}): Promise<"starred" | "declined" | "skipped" | "failed"> {
  if (!options.interactive) {
    return "skipped";
  }

  const isGhInstalled =
    options.isGhInstalled ?? (() => commandExists("gh", ["--version"]));
  if (!(await isGhInstalled())) {
    return "skipped";
  }

  const prompt = options.prompt ?? terminalGithubStarPrompt;
  if (!(await prompt.confirmStar())) {
    return "declined";
  }

  const starRepository =
    options.starRepository ??
    (() =>
      runCommand(
        "gh",
        ["api", "--method", "PUT", `/user/starred/${repository}`],
        options.cwd,
      ));

  try {
    await starRepository();
    logger.success(`Starred https://github.com/${repository}`);
    return "starred";
  } catch {
    logger.warning(
      `Could not star ${repository}. Check your GitHub CLI authentication with "gh auth status".`,
    );
    return "failed";
  }
}
