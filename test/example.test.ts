import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';

describe('End-to-End Example', () => {
  const baseDir = path.resolve(__dirname, 'generated');
  const specPath = path.resolve(__dirname, 'fixtures/petstore.yaml');
  const cliPath = path.resolve(__dirname, '../dist/cli.js');

  // Helper function to setup a test case
  const setupTestCase = async (testName: string) => {
    const outputDir = path.join(baseDir, testName);
    
    // Clean up previous test output
    if (fs.existsSync(outputDir)) {
      await fs.remove(outputDir);
    }
    
    // Ensure dist exists (build was run)
    if (!fs.existsSync(cliPath)) {
      console.log('Building project...');
      execSync('npm run build', { cwd: path.resolve(__dirname, '..') });
    }

    // Generate code using openapi-generator-cli
    console.log(`Generating code for ${testName}...`);
    execSync(`npx @openapitools/openapi-generator-cli generate -i ${specPath} -g typescript-axios -o ${outputDir}`, {
      stdio: 'inherit'
    });

    // Run oas-agent-sync
    console.log(`Running oas-agent-sync for ${testName}...`);
    execSync(`node ${cliPath} ${specPath} -o ${outputDir} --api-dir api`, {
      stdio: 'inherit'
    });

    return outputDir;
  };

  it('should generate llms.txt in the output directory', async () => {
    const outputDir = await setupTestCase('llms-txt-test');
    const llmsPath = path.join(outputDir, 'llms.txt');
    
    expect(await fs.pathExists(llmsPath)).toBe(true);
    
    const content = await fs.readFile(llmsPath, 'utf-8');
    expect(content).toContain('# Swagger Petstore APIs');
    expect(content).toContain('|List all pets|`listPets`|`GET /pets`|`./api.ts`|');
  });

  it('should use relative paths in llms.txt', async () => {
    const outputDir = await setupTestCase('relative-paths-test');
    const llmsPath = path.join(outputDir, 'llms.txt');
    const content = await fs.readFile(llmsPath, 'utf-8');
    
    // Check if it DOES NOT contain the full absolute path
    expect(content).not.toContain(outputDir);
  });

  it('should generate agent.md in the output directory', async () => {
    const outputDir = await setupTestCase('agent-md-test');
    const agentPath = path.join(outputDir, 'agent.md');
    
    expect(await fs.pathExists(agentPath)).toBe(true);
    
    const content = await fs.readFile(agentPath, 'utf-8');
    expect(content).toContain('# AI Agent Semantic Guide');
    expect(content).toContain('llms.txt');
  });
});
