import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';

describe('End-to-End Example', () => {
  const outputDir = path.resolve(__dirname, 'generated/petstore');
  const specPath = path.resolve(__dirname, 'fixtures/petstore.yaml');

  beforeAll(async () => {
    // 1. Generate code using openapi-generator-cli
    console.log('Generating sample code...');
    if (fs.existsSync(outputDir)) {
      await fs.remove(outputDir);
    }
    
    // Ensure dist exists (build was run)
    const cliPath = path.resolve(__dirname, '../dist/cli.js');
    if (!fs.existsSync(cliPath)) {
      console.log('Building project...');
      execSync('npm run build', { cwd: path.resolve(__dirname, '..') });
    }

    execSync(`npx @openapitools/openapi-generator-cli generate -i ${specPath} -g typescript-axios -o ${outputDir}`, {
      stdio: 'inherit'
    });

    // 2. Run oas-agent-sync
    console.log('Running oas-agent-sync...');
    execSync(`node ${cliPath} ${specPath} -o ${outputDir} --api-dir api`, {
      stdio: 'inherit'
    });
  });

  it('should generate llms.txt in the output directory', async () => {
    const llmsPath = path.join(outputDir, 'llms.txt');
    expect(await fs.pathExists(llmsPath)).toBe(true);
    
    const content = await fs.readFile(llmsPath, 'utf-8');
    expect(content).toContain('# Swagger Petstore APIs');
    expect(content).toContain('|List all pets|`listPets`|`GET /pets`|`api.ts`|');
  });

  it('should generate agent.md in the output directory', async () => {
    const agentPath = path.join(outputDir, 'agent.md');
    expect(await fs.pathExists(agentPath)).toBe(true);
    
    const content = await fs.readFile(agentPath, 'utf-8');
    expect(content).toContain('# AI Agent Semantic Guide');
    expect(content).toContain('llms.txt');
  });
});
