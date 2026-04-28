#!/usr/bin/env bun
/**
 * Dump agent system prompts using the real user configuration.
 *
 * Loads ~/.config/opencode/oh-my-opencode-slim.json (or .jsonc), resolves
 * the active preset, merges everything exactly as the plugin does at runtime,
 * then writes each agent's final system prompt to dump/{agent-name}.md.
 *
 * Usage:
 *   bun scripts/dump-agent-prompts.ts [output-dir]
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadPluginConfig } from '../src/config/loader';
import { createAgents } from '../src/agents';

const OUTPUT_DIR = process.argv[2] ?? 'dumps';

function main() {
  // Load real config exactly as the plugin does (user + project + preset merge)
  const config = loadPluginConfig(process.cwd());

  // Build all agents with resolved config
  const agents = createAgents(config);

  // Ensure output directory exists
  const outDir = path.resolve(OUTPUT_DIR);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Write each agent's prompt
  for (const agent of agents) {
    const fileName = `${agent.name}.md`;
    const filePath = path.join(outDir, fileName);
    const prompt = agent.config.prompt ?? '';

    // Add metadata header for clarity
    const header = [
      `# ${agent.name}`,
      '',
      `- **Model:** ${agent.config.model ?? '(default)'}`,
      `- **Variant:** ${agent.config.variant ?? '(default)'}`,
      `- **Temperature:** ${agent.config.temperature ?? '(default)'}`,
      `- **Display Name:** ${agent.displayName ?? '(none)'}`,
      '',
      '---',
      '',
    ].join('\n');

    fs.writeFileSync(filePath, header + prompt, 'utf-8');
    console.log(`✓ ${fileName}`);
  }

  console.log(`\nDumped ${agents.length} agent prompts to ${outDir}/`);
}

main();
