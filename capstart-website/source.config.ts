import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

function convertLines(command: string, convertLine: (line: string) => string) {
  return command.split('\n').map(convertLine).join('\n');
}

function stripArgumentSeparator(command: string) {
  return command.replace(/\s+--\s+/g, ' ');
}

function convertPnpmLine(line: string) {
  const trimmed = line.trim();
  const indent = line.slice(0, line.indexOf(trimmed));

  if (trimmed.length === 0) return line;
  if (trimmed.startsWith('npx ')) {
    return `${indent}${trimmed.replace(/^npx\s+/, 'pnpm dlx ')}`;
  }

  if (trimmed === 'npm install') return `${indent}pnpm install`;
  if (trimmed.startsWith('npm install ')) {
    return `${indent}${trimmed.replace(/^npm\s+install\s+/, 'pnpm add ')}`;
  }

  if (trimmed.startsWith('npm create ')) {
    return `${indent}${stripArgumentSeparator(trimmed).replace(/^npm\s+/, 'pnpm ')}`;
  }

  if (trimmed.startsWith('npm run ')) {
    return `${indent}${trimmed.replace(/^npm\s+/, 'pnpm ')}`;
  }

  return line;
}

function convertBunLine(line: string) {
  const trimmed = line.trim();
  const indent = line.slice(0, line.indexOf(trimmed));

  if (trimmed.length === 0) return line;
  if (trimmed.startsWith('npx ')) {
    return `${indent}${trimmed.replace(/^npx\s+/, 'bunx ')}`;
  }

  if (trimmed === 'npm install') return `${indent}bun install`;
  if (trimmed.startsWith('npm install ')) {
    return `${indent}${trimmed
      .replace(/^npm\s+install\s+/, 'bun add ')
      .replaceAll('--save-dev', '--dev')
      .replaceAll('-D', '--dev')}`;
  }

  if (trimmed.startsWith('npm create ')) {
    const args = stripArgumentSeparator(trimmed)
      .replace(/^npm\s+create\s+/, '')
      .split(/\s+/)
      .filter(Boolean);
    const initializer = args.shift();

    if (!initializer) return line;

    const command = initializer.startsWith('@')
      ? initializer.replace('/', '/create-').replace(/@latest$/, '')
      : `create-${initializer.replace(/@latest$/, '')}`;

    return `${indent}bunx ${[command, ...args].join(' ')}`;
  }

  if (trimmed.startsWith('npm run ')) {
    return `${indent}${trimmed.replace(/^npm\s+/, 'bun ')}`;
  }

  return line;
}

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig({
  mdxOptions: {
    remarkNpmOptions: {
      packageManagers: [
        {
          name: 'npm',
          command: (command) => command,
        },
        {
          name: 'pnpm',
          command: (command) => convertLines(command, convertPnpmLine),
        },
        {
          name: 'bun',
          command: (command) => convertLines(command, convertBunLine),
        },
      ],
    },
  },
});
