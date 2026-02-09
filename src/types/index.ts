export interface ProjectMetadata {
  title: string;
  description?: string;
  version: string;
  packageName: string;
  importPath: string;
  apis: ApiClass[];
  operations: OperationMetadata[];
}

export interface ApiClass {
  className: string;
  sourceFile: string;
}

export interface OperationMetadata {
  operationId: string;
  summary?: string;
  description?: string;
  httpMethod: string;
  path: string;
  sourceFile: string;
  className: string;
  tags?: string[];
  parameters: ParameterMetadata[];
  responseType: string;
}

export interface ParameterMetadata {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  in: 'path' | 'query' | 'header' | 'body' | 'cookie';
}



export interface SyncOptions {
  inputSpec: string;
  outputDir: string;
  apiDir?: string;
}
