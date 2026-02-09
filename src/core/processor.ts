import path from 'path';
import fs from 'fs-extra';
import { SyncOptions } from '../types/index.js';
import { extractMetadata } from './extractor.js';
import { scanGeneratedFiles } from './scanner.js';
import { renderDocs } from './renderer.js';

export async function generateDocs(options: SyncOptions): Promise<void> {
  const { inputSpec, outputDir, apiDir } = options;

  try {
    console.log('📝 Generating LLM documentation...');
    
    let metadata = await extractMetadata(inputSpec);
    const fullMetadata = await scanGeneratedFiles(outputDir, metadata, { apiDir });
    
    await fs.ensureDir(outputDir);
    await renderDocs(fullMetadata, outputDir);
    
    console.log(`✨ Documentation generated at: ${outputDir}`);
    console.log(`   - ${path.join(outputDir, 'llms.txt')}`);
  } catch (err) {
    console.error('❌ Failed to generate LLM documentation:', err);
    throw err;
  }
}
