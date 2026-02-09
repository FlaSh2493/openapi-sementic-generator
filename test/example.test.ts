import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs-extra';

describe('End-to-End Example', () => {
  const outputDir = path.resolve(__dirname, 'generated/petstore');

  it('should generate llms.txt in the output directory', async () => {
    const llmsPath = path.join(outputDir, 'llms.txt');
    expect(await fs.pathExists(llmsPath)).toBe(true);
    
    const content = await fs.readFile(llmsPath, 'utf-8');
    expect(content).toContain('# Swagger Petstore - OpenAPI 3.0 APIs');
    expect(content).toContain('|Update an existing pet by Id.|`updatePet`|`PUT /pet`|`./api.ts`|');
  });

  it('should use relative paths in llms.txt', async () => {
    const llmsPath = path.join(outputDir, 'llms.txt');
    const content = await fs.readFile(llmsPath, 'utf-8');
    
    // In our test setup, we used --api-dir api, and the generator puts files in outputDir
    // So the path should be relative to outputDir.
    // However, for this simple test case with typescript-axios, 
    // files might be directly in outputDir or in a subdirectory depending on generator options
    
    // Based on previous logs, the scanner found 'api.ts' (simplified logic)
    // and renderer should keep it relative.
    
    // Let's check if it DOES NOT contain the full absolute path
    expect(content).not.toContain(outputDir);
  });

  it('should generate agent.md in the output directory', async () => {
    const agentPath = path.join(outputDir, 'agent.md');
    expect(await fs.pathExists(agentPath)).toBe(true);
    
    const content = await fs.readFile(agentPath, 'utf-8');
    expect(content).toContain('# AI Agent Semantic Guide');
    expect(content).toContain('llms.txt');
  });
});

describe('End-to-End Example (Separate Files)', () => {
  const outputDir = path.resolve(__dirname, 'generated/petstore-separate');

  it('should generate llms.txt with separate API files', async () => {
    const llmsPath = path.join(outputDir, 'llms.txt');
    expect(await fs.pathExists(llmsPath)).toBe(true);
    
    const content = await fs.readFile(llmsPath, 'utf-8');
    expect(content).toContain('# Swagger Petstore - OpenAPI 3.0 APIs');
    
    // Verify pet APIs map to pet-api.ts
    expect(content).toContain('|Update an existing pet by Id.|`updatePet`|`PUT /pet`|`./apis/pet-api.ts`|');
    
    // Verify store APIs map to store-api.ts
    expect(content).toContain('|Returns a map of status codes to quantities.|`getInventory`|`GET /store/inventory`|`./apis/store-api.ts`|');
    
    // Verify user APIs map to user-api.ts
    expect(content).toContain('|This can only be done by the logged in user.|`createUser`|`POST /user`|`./apis/user-api.ts`|');
  });

  it('should have separate API files in apis directory', async () => {
    const petApiPath = path.join(outputDir, 'apis/pet-api.ts');
    const storeApiPath = path.join(outputDir, 'apis/store-api.ts');
    const userApiPath = path.join(outputDir, 'apis/user-api.ts');
    
    expect(await fs.pathExists(petApiPath)).toBe(true);
    expect(await fs.pathExists(storeApiPath)).toBe(true);
    expect(await fs.pathExists(userApiPath)).toBe(true);
  });

  it('should generate agent.md in the output directory', async () => {
    const agentPath = path.join(outputDir, 'agent.md');
    expect(await fs.pathExists(agentPath)).toBe(true);
    
    const content = await fs.readFile(agentPath, 'utf-8');
    expect(content).toContain('# AI Agent Semantic Guide');
    expect(content).toContain('llms.txt');
  });
});
