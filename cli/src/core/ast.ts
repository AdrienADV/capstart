import path from "node:path";
import {
  Node,
  ObjectLiteralExpression,
  Project,
  SourceFile,
  SyntaxKind,
} from "ts-morph";
import { pathExists } from "./project.js";

export async function findConfigFile(
  root: string,
  names: string[],
): Promise<string | undefined> {
  for (const name of names) {
    const filePath = path.join(root, name);
    if (await pathExists(filePath)) {
      return filePath;
    }
  }

  return undefined;
}

export function loadSourceFile(filePath: string): SourceFile {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
  });
  return project.addSourceFileAtPath(filePath);
}

export function findExportedObject(
  sourceFile: SourceFile,
): ObjectLiteralExpression | undefined {
  for (const exportAssignment of sourceFile.getExportAssignments()) {
    const expression = exportAssignment.getExpression();
    const object = resolveObjectExpression(expression);
    if (object) {
      return object;
    }
  }

  for (const binary of sourceFile.getDescendantsOfKind(
    SyntaxKind.BinaryExpression,
  )) {
    if (binary.getLeft().getText() === "module.exports") {
      const object = resolveObjectExpression(binary.getRight());
      if (object) {
        return object;
      }
    }
  }

  return undefined;
}

export function setObjectProperty(
  object: ObjectLiteralExpression,
  name: string,
  initializer: string,
): void {
  const property = object.getProperty(name);

  if (!property) {
    object.addPropertyAssignment({ name, initializer });
    return;
  }

  if (Node.isPropertyAssignment(property)) {
    property.setInitializer(initializer);
    return;
  }

  throw new Error(`Cannot safely update the "${name}" configuration property.`);
}

export function getOrCreateNestedObject(
  object: ObjectLiteralExpression,
  name: string,
): ObjectLiteralExpression {
  const property = object.getProperty(name);

  if (!property) {
    const created = object.addPropertyAssignment({
      name,
      initializer: "{}",
    });
    const initializer = created.getInitializer();
    if (!Node.isObjectLiteralExpression(initializer)) {
      throw new Error(`Could not create the "${name}" configuration property.`);
    }
    return initializer;
  }

  if (Node.isPropertyAssignment(property)) {
    const initializer = property.getInitializer();
    if (Node.isObjectLiteralExpression(initializer)) {
      return initializer;
    }
  }

  throw new Error(`Cannot safely merge the "${name}" configuration property.`);
}

function resolveObjectExpression(
  expression: Node,
): ObjectLiteralExpression | undefined {
  if (Node.isObjectLiteralExpression(expression)) {
    return expression;
  }

  if (Node.isIdentifier(expression)) {
    const declaration = expression.getDefinitions()[0]?.getDeclarationNode();
    if (Node.isVariableDeclaration(declaration)) {
      const initializer = declaration.getInitializer();
      if (Node.isObjectLiteralExpression(initializer)) {
        return initializer;
      }
    }
  }

  return undefined;
}
