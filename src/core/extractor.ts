import fs from "fs-extra";
import { parse } from "yaml";
import {
  ProjectMetadata,
  OperationMetadata,
  ParameterMetadata,
} from "../types/index.js";

export async function extractMetadata(
  specPath: string,
): Promise<Partial<ProjectMetadata>> {
  let content: string;
  const isUrl =
    specPath.startsWith("http://") || specPath.startsWith("https://");

  if (isUrl) {
    const response = await fetch(specPath);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch OpenAPI spec from ${specPath}: ${response.statusText}`,
      );
    }
    content = await response.text();
  } else {
    content = await fs.readFile(specPath, "utf-8");
  }

  const spec =
    specPath.endsWith(".yaml") ||
    specPath.endsWith(".yml") ||
    (isUrl && !content.trim().startsWith("{"))
      ? parse(content)
      : JSON.parse(content);

  const title = spec.info?.title || "API";
  const description = spec.info?.description;
  const version = spec.info?.version || "1.0.0";

  const operations: OperationMetadata[] = [];

  // Extract operations
  if (spec.paths) {
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, details] of Object.entries(methods as any)) {
        if (
          ["get", "post", "put", "delete", "patch", "options", "head"].includes(
            method.toLowerCase(),
          )
        ) {
          const typedDetails = details as any;
          const parameters: ParameterMetadata[] = (
            typedDetails.parameters || []
          ).map((p: any) => ({
            name: p.name,
            type: p.schema?.type || "string",
            required: !!p.required,
            description: p.description,
            in: p.in,
          }));

          // Handle request body as parameters (simplified for now)
          if (typedDetails.requestBody) {
            // For simplicity, we just mark it's there
          }

          operations.push({
            operationId: toCamelCase(
              typedDetails.operationId ||
              `${method}_${path.replace(/\//g, "_")}`
            ),
            summary: typedDetails.summary,
            description: typedDetails.description,
            httpMethod: method.toUpperCase(),
            path,
            sourceFile: "", // To be filled by scanner
            className: "", // To be filled by scanner
            tags: typedDetails.tags || [],
            parameters,
            responseType: "any", // To be improved
          });
        }
      }
    }
  }

  // models: [] (models are no longer extracted)

  return {
    title,
    description,
    version,
    operations: operations.map((op) => ({
      ...op,
      description: cleanDescription(op.description || op.summary),
    })),
  };
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

function cleanDescription(desc?: string): string {
  if (!desc) return "";
  // Remove docstring junk like :param:, :return:, and internal links
  return desc
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed &&
        !trimmed.startsWith(":") &&
        !trimmed.startsWith("- ") &&
        !trimmed.startsWith("workflow:") &&
        !trimmed.includes("https://")
      );
    })
    .join(" ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 60); // Aggressive optimization: 60 chars
}
