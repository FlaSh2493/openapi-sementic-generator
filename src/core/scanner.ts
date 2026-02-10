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
      const lowerFile = file.toLowerCase();
      // Include all .ts/.js files but exclude tests and index files
      const isCodeFile = file.endsWith('.ts') || file.endsWith('.js');
      const isTestFile = lowerFile.endsWith('.test.ts') || lowerFile.endsWith('.spec.ts');
      const isIndexFile = lowerFile === 'index.ts' || lowerFile === 'index.js';

      if (isCodeFile && !isTestFile && !isIndexFile) {
        apis.push({
          className: file.replace(/\.[jt]s$/, ''), 
          sourceFile: path.join(dirName, file)
        });
      }
    }
  }

  // Map operations to source files
  if (metadata.operations) {
    for (const op of metadata.operations) {
      if (apis.length === 0) continue;
      
      // FALLBACK: If there's only one API file, map everything to it
      if (apis.length === 1) {
        op.className = apis[0].className;
        op.sourceFile = apis[0].sourceFile;
        continue;
      }

      // Try to match based on tag
      let matchedApi = apis[0]; // Default to first (though multiple files exist)
      
      if (op.tags && op.tags.length > 0) {
        const primaryTag = op.tags[0].toLowerCase();
        const normalizedTag = primaryTag.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        
        // Try to find API file matching the tag
        const found = apis.find(api => {
          const fileName = api.className.toLowerCase();
          return fileName.includes(normalizedTag) || fileName.includes(primaryTag.replace(/\s+/g, ''));
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
