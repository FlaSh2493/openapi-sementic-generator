import fs from 'fs-extra';
import path from 'path';
import { ProjectMetadata, ApiClass } from '../types/index.js';

export async function scanGeneratedFiles(
  outputDir: string, 
  metadata: Partial<ProjectMetadata>,
  options: { apiDir?: string } = {}
): Promise<ProjectMetadata> {
  const apis: ApiClass[] = [];
  
  // Find all API files (simplified logic for typescript-axios/fetch)
  // Usually they are in api/ or apis/ or generated as Files
  const searchDirs = options.apiDir ? [options.apiDir, ...['api', 'apis', '.']] : ['api', 'apis', '.'];
  
  for (const dirName of searchDirs) {
    const fullDir = path.join(outputDir, dirName);
    if (!(await fs.pathExists(fullDir))) continue;

    const files = await fs.readdir(fullDir);
    for (const file of files) {
      if ((file.endsWith('Api.ts') || file.endsWith('api.ts')) && !file.endsWith('.test.ts')) {
        apis.push({
          className: file.replace('.ts', ''), // Simplified
          sourceFile: path.join(dirName, file)
        });
      }
    }
  }

  // Map operations to source files (This requires more sophisticated analysis like ts-morph)
  // For the initial version, we will use a heuristic: operationId is likely in one of the API classes
  if (metadata.operations) {
    for (const op of metadata.operations) {
      // Heuristic: matching className if available, otherwise pick the first one
      if (apis.length > 0) {
        op.className = apis[0].className;
        op.sourceFile = apis[0].sourceFile;
      }
    }
  }

  // Model mapping logic removed as they are not used in consolidated output

  return {
    ...metadata,
    packageName: 'api-client', // Default
    importPath: './api',      // Default
    apis,
    operations: metadata.operations || [],
  } as ProjectMetadata;
}
