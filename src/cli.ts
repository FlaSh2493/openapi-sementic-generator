#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { generateDocs } from './core/processor.js';

const program = new Command();

program
  .name('oas-agent-sync')
  .description('Generate LLM documentation for existing generated code (Middleware mode)')
  .version('0.1.0');

program
  .argument('<spec>', 'OpenAPI specification file (local path or URL)')
  .requiredOption('-o, --output <dir>', 'Existing generated code directory')
  .option('--api-dir <path>', 'Relative path to APIs within output directory', '')
  .action(async (spec, options) => {
    try {
      let inputSpec = spec;
      const isUrl = inputSpec.startsWith('http://') || inputSpec.startsWith('https://');
      
      if (!isUrl) {
        inputSpec = path.resolve(process.cwd(), inputSpec);
        if (!(await fs.pathExists(inputSpec))) {
          console.error(`Error: Input file not found: ${inputSpec}`);
          process.exit(1);
        }
      }

      const outputDir = path.resolve(process.cwd(), options.output);
      if (!(await fs.pathExists(outputDir))) {
        console.error(`Error: Output directory not found: ${outputDir}`);
        process.exit(1);
      }

      await generateDocs({
        inputSpec: inputSpec,
        outputDir: outputDir,
        apiDir: options.apiDir || undefined,
      });
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
