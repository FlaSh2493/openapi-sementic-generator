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

  // Map operations to source files based on tags
  if (metadata.operations) {
    for (const op of metadata.operations) {
      if (apis.length === 0) continue;
      
      // Try to match based on tag
      let matchedApi = apis[0]; // Default to first
      
      if (op.tags && op.tags.length > 0) {
        const primaryTag = op.tags[0].toLowerCase();
        
        // Try to find API file matching the tag
        // e.g., tag 'pet' should match 'pet-api.ts' or 'PetApi.ts'
        const found = apis.find(api => {
          const fileName = api.className.toLowerCase();
          return fileName.includes(primaryTag);
        });
        
        if (found) {
          matchedApi = found;
        }
      }
      
      op.className = matchedApi.className;
      op.sourceFile = matchedApi.sourceFile;
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
