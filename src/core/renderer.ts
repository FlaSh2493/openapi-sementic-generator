import Mustache from 'mustache';
import fs from 'fs-extra';
import path from 'path';
import { ProjectMetadata, OperationMetadata } from '../types/index.js';

// Templates are now loaded from src/templates

export async function renderDocs(
  metadata: ProjectMetadata,
  outputDir: string
): Promise<void> {
  // Load templates from file
  // Use import.meta.url to get the current file directory
  // Use import.meta.url to get the current file directory
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  
  // Try to find templates in:
  // 1. ../templates (relative to this file in src/core)
  // 2. ./templates (relative to this file in dist/core)
  // 3. ../../templates (when running from dist)
  let templateDir = path.join(currentDir, '../templates');
  
  if (!fs.existsSync(templateDir)) {
    const possiblePaths = [
      path.join(currentDir, './templates'),
      path.join(currentDir, '../../templates'),
      path.join(process.cwd(), 'templates'),
      path.join(process.cwd(), 'dist/templates')
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        templateDir = p;
        break;
      }
    }
  }
  
  const llmsTemplate = await fs.readFile(path.join(templateDir, 'llms-full.mustache'), 'utf-8');
  const agentTemplate = await fs.readFile(path.join(templateDir, 'agent.mustache'), 'utf-8');

  // Enrich metadata for templates
  const operationsByTag: Record<string, OperationMetadata[]> = {};
  metadata.operations.forEach(op => {
    const tag = op.tags?.[0] || 'Default';
    if (!operationsByTag[tag]) operationsByTag[tag] = [];
    operationsByTag[tag].push(op);
  });

  const groupedOperations = Object.entries(operationsByTag).map(([tag, ops]) => ({
    tag,
    ops: ops.map((op, index) => ({
      ...op,
      last: index === ops.length - 1
    }))
  }));

  const enrichedMetadata = {
    ...metadata,
    groupedOperations,
    apis: metadata.apis.map((api, index) => ({
      ...api,
      last: index === metadata.apis.length - 1
    }))
  };

  // Render content
  const llms = Mustache.render(llmsTemplate, enrichedMetadata);
  const agent = Mustache.render(agentTemplate, enrichedMetadata);

  // Write files
  await fs.writeFile(path.join(outputDir, 'llms.txt'), llms);
  await fs.writeFile(path.join(outputDir, 'agent.md'), agent);
}
