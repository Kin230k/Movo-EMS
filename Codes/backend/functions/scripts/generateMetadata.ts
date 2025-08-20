// src/scripts/generateMetadata.ts
import fs from 'fs';
import path from 'path';
import {
  Project,
  SyntaxKind,
  Node,
  VariableDeclaration,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunction,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  Type,
  SourceFile,
} from 'ts-morph';

type HandlerFunctionNode =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunction;

/**
 * Toggle debug logging here. Set to `true` to see diagnostic messages
 * about file matching and unresolved import(...) patterns.
 */
const DEBUG = false;

/** ---- Initialize project ---- */
const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const callablesDir = path.resolve('src/callables');
const callableFiles = project.addSourceFilesAtPaths(
  callablesDir + '/**/*.callable.ts'
);

if (DEBUG) {
  console.info(
    `Project source files: ${project.getSourceFiles().length}, found ${
      callableFiles.length
    } .callables.ts files under ${callablesDir}`
  );
}

const metadata: Array<{
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}> = [];

// Specialized handler for known types
function getFixedType(typeName: string): string | undefined {
  const KNOWN_TYPES: Record<string, string> = {
    Multilingual: '{ en: string; ar: string }',
    ClientStatus: '"ACTIVE" | "INACTIVE" | "PENDING"',
  };

  return KNOWN_TYPES[typeName];
}

/** ---------- Helpers ---------- **/

function tryFindExportedInProject(name: string): Node | undefined {
  for (const sf of project.getSourceFiles()) {
    try {
      const exported = sf.getExportedDeclarations();
      if (exported.has(name)) {
        const decls = exported.get(name);
        if (decls && decls.length > 0) return decls[0];
      }
    } catch {}
  }
  return undefined;
}

function resolveHandlerFunction(
  arg: Node,
  sourceFile: SourceFile,
  projectRef: Project
): HandlerFunctionNode | undefined {
  if (
    Node.isArrowFunction(arg) ||
    Node.isFunctionExpression(arg) ||
    Node.isFunctionDeclaration(arg)
  ) {
    return arg as HandlerFunctionNode;
  }

  if (Node.isIdentifier(arg)) {
    const identName = arg.getText();
    const sym = arg.getSymbol();
    let declarations = sym?.getDeclarations() ?? [];

    const aliased = (sym as any)?.getAliasedSymbol?.();
    if (aliased) declarations = aliased.getDeclarations() ?? declarations;
    else {
      const looksLikeImportDecl = declarations.some(
        (d) =>
          d.getKind() === SyntaxKind.ImportSpecifier ||
          d.getKind() === SyntaxKind.ImportClause ||
          d.getKind() === SyntaxKind.ImportEqualsDeclaration
      );
      if (looksLikeImportDecl) {
        const fallback = tryFindExportedInProject(identName);
        if (fallback) declarations = [fallback];
      }
    }

    for (const d of declarations) {
      if (
        Node.isFunctionDeclaration(d) ||
        Node.isFunctionExpression(d) ||
        Node.isArrowFunction(d)
      )
        return d as HandlerFunctionNode;
      if (Node.isVariableDeclaration(d)) {
        const init = (d as VariableDeclaration).getInitializer();
        if (
          init &&
          (Node.isArrowFunction(init) || Node.isFunctionExpression(init))
        )
          return init as HandlerFunctionNode;
      }

      try {
        const sf = (d as any).getSourceFile?.();
        if (sf) {
          const exported = sf.getExportedDeclarations();
          if (exported.has(identName)) {
            const ex = exported.get(identName);
            if (ex && ex.length > 0) {
              const candidate = ex[0];
              if (
                Node.isFunctionDeclaration(candidate) ||
                Node.isArrowFunction(candidate) ||
                Node.isFunctionExpression(candidate)
              )
                return candidate as HandlerFunctionNode;
              if (Node.isVariableDeclaration(candidate)) {
                const init = candidate.getInitializer?.();
                if (
                  init &&
                  (Node.isArrowFunction(init) ||
                    Node.isFunctionExpression(init))
                )
                  return init as HandlerFunctionNode;
              }
            }
          }
        }
      } catch {}
    }
    return undefined;
  }

  const found = arg.getFirstDescendant(
    (n) =>
      Node.isArrowFunction(n) ||
      Node.isFunctionExpression(n) ||
      Node.isFunctionDeclaration(n)
  );
  return (found as HandlerFunctionNode) || undefined;
}

/** ---------- TYPE RESOLUTION helpers (robust) ---------- **/

function findTypeDeclarationByNameAcrossProject(
  typeName: string
): InterfaceDeclaration | TypeAliasDeclaration | undefined {
  for (const sf of project.getSourceFiles()) {
    try {
      const ia = sf.getInterface(typeName);
      if (ia) return ia;
      const ta = sf.getTypeAlias(typeName);
      if (ta) return ta;
    } catch {}
  }
  return undefined;
}

/**
 * Try to resolve an import("...").TypeName textual occurrence to a Type object.
 * Handles Windows paths, drive letters, file:/// prefixes, index files, and
 * falls back to searching by name across the project.
 */
function resolveImportedTypeByText(typeText: string): Type | undefined {
  const m = typeText.match(
    /import\(["'`](.+?)["'`]\)\.?(?:default|((?:[A-Za-z0-9_$]+\.)*[A-Za-z0-9_$]+))/
  );
  if (!m) return undefined;

  let filePathInImport = m[1];
  let rawTypeName = m[2] || 'default';

  // Handle nested type names (A.B.C -> C)
  const typeNameParts = rawTypeName.split('.');
  const typeName = typeNameParts[typeNameParts.length - 1];

  // Normalize Windows paths
  let normalizedImportPath = filePathInImport.replace(/^file:\/+/, '');
  normalizedImportPath = path
    .normalize(normalizedImportPath)
    .replace(/\\/g, '/');

  // Convert absolute paths to relative paths if possible
  const projectRoot = process.cwd();
  if (normalizedImportPath.startsWith(projectRoot)) {
    normalizedImportPath = path.relative(projectRoot, normalizedImportPath);
  }

  // Normalize drive letter to lowercase for case-insensitive matching
  const driveMatch = normalizedImportPath.match(/^([A-Za-z]):\/(.+)$/);
  if (driveMatch) {
    const driveLetter = driveMatch[1].toLowerCase();
    const restPath = driveMatch[2];
    normalizedImportPath = `${driveLetter}:/${restPath}`;
  }

  const trySuffixes = [
    '',
    '.ts',
    '.tsx',
    '.d.ts',
    '.js',
    '.jsx',
    '/index.ts',
    '/index.tsx',
    '/index.d.ts',
    '/index.js',
  ];

  const allFiles = project.getSourceFiles();
  let sf: SourceFile | undefined = undefined;

  // Try exact matches with extensions
  for (const suff of trySuffixes) {
    const candidate = normalizedImportPath + suff;
    sf = allFiles.find((s) => {
      const filePath = s.getFilePath().replace(/\\/g, '/');
      // Case-insensitive matching for Windows paths
      if (process.platform === 'win32' || filePath.includes(':')) {
        return filePath.toLowerCase().endsWith(candidate.toLowerCase());
      }
      return filePath.endsWith(candidate);
    });
    if (sf) break;
  }

  // Try case-insensitive search across all files
  if (!sf) {
    sf = allFiles.find((s) => {
      const filePath = s.getFilePath().replace(/\\/g, '/');
      return filePath
        .toLowerCase()
        .includes(normalizedImportPath.toLowerCase());
    });
  }

  // Try to match by basename
  if (!sf) {
    const base = path.basename(normalizedImportPath);
    sf = allFiles.find((s) => {
      const filePath = s.getFilePath().replace(/\\/g, '/');
      return (
        filePath.toLowerCase().endsWith('/' + base.toLowerCase()) ||
        filePath.toLowerCase().endsWith(base.toLowerCase())
      );
    });
  }

  // Special handling for multilingual.type
  if (!sf && normalizedImportPath.includes('multilingual.type')) {
    sf = allFiles.find((s) =>
      s.getFilePath().toLowerCase().includes('multilingual.type')
    );
  }

  if (DEBUG) {
    console.info('resolveImportedTypeByText:', {
      normalizedImportPath,
      typeName,
      matchedFile: sf?.getFilePath?.(),
    });
  }

  if (sf) {
    try {
      const iface = sf.getInterface(typeName);
      if (iface) return iface.getType();
      const alias = sf.getTypeAlias(typeName);
      if (alias) return alias.getType();

      try {
        const exported = sf.getExportedDeclarations?.();
        if (exported && exported.has(typeName)) {
          const decls = exported.get(typeName) ?? [];
          if (decls.length > 0) {
            const cand = decls[0] as any;
            try {
              return cand.getType?.() ?? undefined;
            } catch {}
          }
        }
      } catch {}

      if (rawTypeName === 'default') {
        const firstAlias = sf.getTypeAliases()[0];
        if (firstAlias) return firstAlias.getType();
        const firstIface = sf.getInterfaces()[0];
        if (firstIface) return firstIface.getType();
      }
    } catch (e) {
      if (DEBUG)
        console.info(
          'resolveImportedTypeByText: error when inspecting source file',
          e
        );
    }
  }

  const found = findTypeDeclarationByNameAcrossProject(typeName);
  if (found) {
    if (DEBUG) {
      console.info(
        'resolveImportedTypeByText: found by name across project in file:',
        found.getSourceFile().getFilePath()
      );
    }
    return found.getType();
  }

  const candidateSf = project
    .getSourceFiles()
    .find(
      (s) =>
        s.getFullText().includes(`export type ${typeName}`) ||
        s.getFullText().includes(`export interface ${typeName}`)
    );
  if (candidateSf) {
    const ci = candidateSf.getTypeAlias(typeName);
    if (ci) return ci.getType();
    const ii = candidateSf.getInterface(typeName);
    if (ii) return ii.getType();
  }

  return undefined;
}

/** ---------- Textual fallback helpers ---------- **/

function findSourceFileForImportPath(
  importPath: string
): SourceFile | undefined {
  if (!importPath) return undefined;
  let p = importPath.replace(/^file:\/+/, '');
  p = path.normalize(p).replace(/\\/g, '/');

  // Normalize drive letter for Windows
  const driveMatch = p.match(/^([A-Za-z]):\/(.+)$/);
  if (driveMatch) {
    const driveLetter = driveMatch[1].toLowerCase();
    const restPath = driveMatch[2];
    p = `${driveLetter}:/${restPath}`;
  }

  const all = project.getSourceFiles();
  let sf = all.find((s) => {
    const filePath = s.getFilePath().replace(/\\/g, '/');
    if (process.platform === 'win32' || filePath.includes(':')) {
      return filePath.toLowerCase().endsWith(p.toLowerCase());
    }
    return filePath.endsWith(p);
  });
  if (sf) return sf;

  const exts = [
    '',
    '.ts',
    '.tsx',
    '.d.ts',
    '.js',
    '.jsx',
    '/index.ts',
    '/index.tsx',
    '/index.d.ts',
  ];
  for (const ext of exts) {
    sf = all.find((s) => {
      const filePath = s.getFilePath().replace(/\\/g, '/');
      const candidate = p + ext;
      if (process.platform === 'win32' || filePath.includes(':')) {
        return filePath.toLowerCase().endsWith(candidate.toLowerCase());
      }
      return filePath.endsWith(candidate);
    });
    if (sf) return sf;
  }

  sf = all.find((s) => {
    const filePath = s.getFilePath().replace(/\\/g, '/');
    if (process.platform === 'win32' || filePath.includes(':')) {
      return filePath.toLowerCase().includes(p.toLowerCase());
    }
    return filePath.includes(p);
  });
  if (sf) return sf;

  const base = path.basename(p);
  sf = all.find((s) => {
    const filePath = s.getFilePath().replace(/\\/g, '/');
    if (process.platform === 'win32' || filePath.includes(':')) {
      return (
        filePath.toLowerCase().endsWith('/' + base.toLowerCase()) ||
        filePath.toLowerCase().endsWith(base.toLowerCase())
      );
    }
    return filePath.endsWith('/' + base) || filePath.endsWith(base);
  });
  return sf || undefined;
}

function extractDeclarationTextFromSourceFile(
  sf: SourceFile,
  typeName: string
): string | undefined {
  if (!sf || !typeName) return undefined;
  try {
    const iface = sf.getInterface(typeName);
    if (iface) {
      return iface.getText();
    }
    const ta = sf.getTypeAlias(typeName);
    if (ta) {
      return ta.getText();
    }

    const txt = sf.getFullText();

    const ifaceRegex = new RegExp(
      `export\\s+interface\\s+${typeName}\\s*\\{([\\s\\S]*?)\\}`,
      'm'
    );
    const ifaceM = txt.match(ifaceRegex);
    if (ifaceM) {
      return `interface ${typeName} {${ifaceM[1]}}`;
    }

    const typeRegex = new RegExp(
      `export\\s+type\\s+${typeName}\\s*=\\s*([\\s\\S]*?);`,
      'm'
    );
    const typeM = txt.match(typeRegex);
    if (typeM) {
      return `type ${typeName} = ${typeM[1].trim()};`;
    }

    const reExportRegex = new RegExp(`export\\s*\\{([\\s\\S]*?)\\}`, 'm');
    const reExports = txt.match(reExportRegex);
    if (reExports) {
      const inner = reExports[1];
      const parts = inner.split(',').map((s) => s.trim());
      for (const p of parts) {
        if (p.endsWith(` as ${typeName}`) || p === typeName) {
          const orig = p.includes(' as ')
            ? p.split(' as ')[0].trim()
            : typeName;
          const iface2 = sf.getInterface(orig);
          if (iface2) return iface2.getText();
          const ta2 = sf.getTypeAlias(orig);
          if (ta2) return ta2.getText();
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return undefined;
}

function normalizeDeclarationText(
  declText: string,
  requestedName?: string
): string {
  if (!declText) return declText;
  let t = declText.trim();

  t = t.replace(/^export\s+/, '');

  const ifaceMatch = t.match(/^interface\s+[A-Za-z0-9_$]+\s*(\{[\s\S]*\})$/m);
  if (ifaceMatch) return ifaceMatch[1].trim();

  const typeMatch = t.match(/^type\s+[A-Za-z0-9_$]+\s*=\s*([\s\S]*?);?$/m);
  if (typeMatch) return typeMatch[1].trim();

  return t;
}

/** ---------- Replace all import("...") occurrences ---------- */
function expandImportedPatternsInTextGlobal(text: string, depth = 0): string {
  if (!text || depth > 8) return text;

  const importRegex =
    /import\(["'`](.+?)["'`]\)\.?(?:default|([A-Za-z0-9_$]+))/g;

  let changed = false;
  const out = text.replace(importRegex, (match, importPath, maybeName) => {
    try {
      const typeNameParts = (maybeName || 'default').split('.');
      const typeName = typeNameParts[typeNameParts.length - 1];

      // Handle known types first
      const fixedType = getFixedType(typeName);
      if (fixedType) {
        changed = true;
        return fixedType;
      }

      const resolved = resolveImportedTypeByText(match);
      if (resolved) {
        changed = true;
        return renderTypeInline(resolved, depth + 1);
      }

      const sf = findSourceFileForImportPath(importPath);
      if (sf) {
        const declText = extractDeclarationTextFromSourceFile(sf, typeName);
        if (declText) {
          const inline = normalizeDeclarationText(declText, typeName);
          const recursed = expandImportedPatternsInTextGlobal(
            inline,
            depth + 1
          );
          if (DEBUG)
            console.info(
              'FALLBACK inlined',
              importPath,
              '->',
              typeName,
              'as',
              recursed.slice(0, 300)
            );
          changed = true;
          return recursed;
        } else if (DEBUG) {
          console.info(
            `Could not extract declaration for ${typeName} from ${sf.getFilePath()}`
          );
        }
      }

      if (DEBUG) console.info('UNRESOLVED import(...) pattern:', match);
    } catch (e) {
      if (DEBUG) console.info('ERROR expanding import pattern', match, e);
    }
    return match;
  });

  if (!changed) {
    return out.replace(importRegex, (m, importPath, maybeName) => {
      const typeNameParts = (maybeName || 'default').split('.');
      const typeName = typeNameParts[typeNameParts.length - 1];

      // Handle known types
      const fixedType = getFixedType(typeName);
      if (fixedType) return fixedType;

      try {
        const foundDecl = findTypeDeclarationByNameAcrossProject(typeName);
        if (foundDecl) {
          return renderTypeInline(foundDecl.getType(), depth + 1);
        }
        const sf = findSourceFileForImportPath(importPath);
        if (sf) {
          const declText = extractDeclarationTextFromSourceFile(sf, typeName);
          if (declText) return normalizeDeclarationText(declText, typeName);
        }
      } catch (e) {
        if (DEBUG) console.info('fallback resolution error for', typeName, e);
      }
      return m;
    });
  }

  return out;
}

/** ---------- Type rendering ---------- **/

function renderObjectTypeInline(type: Type, depth = 0): string {
  try {
    const props = type.getProperties?.() ?? [];
    const parts: string[] = [];
    for (const p of props) {
      const name = p.getName();
      const decls = p.getDeclarations?.() ?? [];

      let isOptional = false;
      for (const d of decls) {
        try {
          if (typeof (d as any).hasQuestionToken === 'function')
            isOptional = isOptional || (d as any).hasQuestionToken();
          else isOptional = isOptional || !!(d as any).isOptional;
        } catch {}
      }

      let propTypeObj: Type | undefined;
      if (decls.length > 0) {
        const firstDecl = decls[0] as any;
        try {
          propTypeObj = firstDecl.getType?.();
        } catch {}
      }
      if (!propTypeObj) {
        try {
          propTypeObj = (p as any).getType?.();
        } catch {}
      }

      let rendered: string;
      if (propTypeObj) rendered = renderTypeInline(propTypeObj, depth + 1);
      else {
        const maybe = (p as any).getType?.()?.getText?.() ?? 'any';
        const expanded = expandImportedPatternsInTextGlobal(maybe, depth + 1);
        rendered = expanded !== maybe ? expanded : maybe;
      }

      parts.push(`${name}${isOptional ? '?' : ''}: ${rendered}`);
    }
    return `{ ${parts.join('; ')} }`;
  } catch {
    try {
      return (type as any).getText?.() ?? 'any';
    } catch {
      return 'any';
    }
  }
}

function renderTypeInline(type: Type | undefined, depth = 0): string {
  if (!type) return 'any';
  if (depth > 8) {
    try {
      return (type as any).getText?.() ?? 'any';
    } catch {
      return 'any';
    }
  }

  // Handle known types
  try {
    const typeName = type.getSymbol()?.getName();
    const fixedType = getFixedType(typeName || '');
    if (fixedType) return fixedType;
  } catch {}

  let text = '';
  try {
    text = type.getText();
  } catch {
    text = '';
  }

  // First, try expanding any inline import(...) patterns from the raw text
  try {
    const expanded = expandImportedPatternsInTextGlobal(text, depth);
    if (expanded !== text) return expanded;
  } catch {}

  // Primitive literals & keywords
  if (
    ['string', 'number', 'boolean', 'any', 'unknown', 'void', 'never'].includes(
      text
    )
  )
    return text;
  if (/^'.*'$|^".*"$|^\d+$|^(true|false)$/.test(text)) return text;

  // Arrays
  try {
    const e = (type as any).getArrayElementType?.();
    if (e) return `${renderTypeInline(e, depth + 1)}[]`;
  } catch {}
  if (text.endsWith('[]')) return text;

  // Unions
  try {
    if ((type as any).isUnion?.()) return text || 'any';
  } catch {}

  // Symbols (interfaces / type aliases)
  try {
    const sym = (type as any).getSymbol?.();
    if (sym) {
      const decls = sym.getDeclarations?.() ?? [];
      if (decls.length > 0) {
        const first = decls[0] as any;
        const kind = first.getKind?.();
        if (
          kind === SyntaxKind.InterfaceDeclaration ||
          kind === SyntaxKind.TypeAliasDeclaration
        ) {
          const declaredType = first.getType?.();
          if (declaredType) {
            // Inline the object/type alias form
            const inline = renderObjectTypeInline(declaredType, depth + 1);
            // Expand any nested import(...) in the inline result
            const expanded = expandImportedPatternsInTextGlobal(
              inline,
              depth + 1
            );
            return expanded;
          }
        }
      }
    }
  } catch {}

  // Object-like types (properties)
  try {
    const props = type.getProperties?.() ?? [];
    if (props.length > 0) {
      if (/^\{.*\}$/.test(text) || !/^import\(|^[a-zA-Z0-9_$]+\b$/.test(text)) {
        return renderObjectTypeInline(type, depth + 1);
      }
      return text || 'any';
    }
  } catch {}

  // Fallback to raw text or 'any'
  try {
    return text || 'any';
  } catch {
    return 'any';
  }
}

/** ---------- Extract properties into metadata fields ---------- */
function extractPropertiesFromType(type: Type) {
  const fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }> = [];
  try {
    const props = type.getProperties?.() ?? [];
    for (const prop of props) {
      const name = prop.getName();
      const decls = prop.getDeclarations?.() ?? [];

      let isOptional = false;
      for (const d of decls) {
        try {
          if (typeof (d as any).hasQuestionToken === 'function')
            isOptional = isOptional || (d as any).hasQuestionToken();
          else isOptional = isOptional || !!(d as any).isOptional;
        } catch {}
      }

      let propTypeObj: Type | undefined;
      if (decls.length > 0) {
        const firstDecl = decls[0] as any;
        try {
          propTypeObj = firstDecl.getType?.();
        } catch {}
      }
      if (!propTypeObj) {
        try {
          propTypeObj = (prop as any).getType?.();
        } catch {}
      }

      let propTypeText: string;
      if (propTypeObj) {
        try {
          const propTypeName = propTypeObj.getSymbol()?.getName();
          const fixedType = getFixedType(propTypeName || '');
          propTypeText = fixedType || renderTypeInline(propTypeObj);
        } catch {
          propTypeText = renderTypeInline(propTypeObj);
        }
      } else {
        const maybe = (prop as any).getType?.()?.getText?.() ?? 'any';
        // Handle known types in text format
        if (maybe.includes('Multilingual') && maybe.includes('import')) {
          propTypeText = getFixedType('Multilingual') || maybe;
        } else if (maybe.includes('ClientStatus') && maybe.includes('import')) {
          propTypeText = getFixedType('ClientStatus') || maybe;
        } else {
          const expanded = expandImportedPatternsInTextGlobal(maybe);
          propTypeText = expanded !== maybe ? expanded : maybe;
        }
      }

      let description = '';
      if (decls.length > 0) {
        const firstDecl = decls[0] as any;
        try {
          const jsDocs = firstDecl.getJsDocs?.() ?? [];
          if (jsDocs.length > 0)
            description = jsDocs
              .map((d: any) => d.getComment?.() ?? '')
              .join(' ')
              .trim();
          else {
            const tags = firstDecl.getJsDocTags?.() ?? [];
            description = tags
              .map((t: any) => t.getText?.() ?? '')
              .join(' ')
              .trim();
          }
        } catch {}
      }

      fields.push({
        name,
        type: propTypeText,
        required: !isOptional,
        description,
      });
    }
  } catch {
    // swallow
  }
  return fields;
}

/** ---------- Main loop ---------- */

for (const file of callableFiles) {
  if (DEBUG) console.info('Processing file:', file.getFilePath());
  const exported = file.getExportedDeclarations();
  const exportKeys = Array.from(exported.keys());
  if (DEBUG) console.info('  exports:', exportKeys.join(', ') || '<none>');

  exported.forEach((decls, exportName) => {
    const decl = decls[0];
    if (!decl) return;

    let searchNode: Node = decl;
    if (Node.isVariableDeclaration(decl)) {
      const init = decl.getInitializer();
      if (init) searchNode = init;
    }

    let callExpression: any;
    if (Node.isCallExpression(searchNode)) callExpression = searchNode;
    else
      callExpression = searchNode.getFirstDescendantByKind(
        SyntaxKind.CallExpression
      );
    if (!callExpression) return;

    const args = callExpression.getArguments();
    let handlerArgNode: Node | undefined;
    for (const a of args) {
      const maybe = resolveHandlerFunction(a, file, project);
      if (maybe) {
        handlerArgNode = a;
        break;
      }
    }
    if (!handlerArgNode && args.length > 0)
      handlerArgNode = args[args.length - 1];

    const handlerFunction = handlerArgNode
      ? resolveHandlerFunction(handlerArgNode, file, project)
      : undefined;
    if (!handlerFunction) {
      metadata.push({ name: exportName, description: '', parameters: [] });
      return;
    }

    // function JSDoc
    let fnDescription = '';
    try {
      const docs = handlerFunction.getJsDocs?.() ?? [];
      if (docs.length > 0)
        fnDescription = docs
          .map((d: any) => d.getComment?.() ?? '')
          .join(' ')
          .trim();
      else {
        const tags = (handlerFunction as any).getJsDocTags?.() ?? [];
        fnDescription = tags
          .map((t: any) => t.getText?.() ?? '')
          .join(' ')
          .trim();
      }
    } catch {
      fnDescription = '';
    }

    // params
    const params = handlerFunction.getParameters();
    const firstParam = params[0] ?? null;
    if (!firstParam) {
      metadata.push({
        name: exportName,
        description: fnDescription,
        parameters: [],
      });
      return;
    }

    // attempt to get generic argument type
    let dataType: Type | undefined;
    try {
      const paramType = firstParam.getType?.();
      if (paramType) {
        const typeArgs = paramType.getTypeArguments?.() ?? [];
        if (typeArgs.length > 0) dataType = typeArgs[0];
      }
    } catch {}

    // fallback: parse textual type node and handle import(...) patterns
    if (!dataType) {
      try {
        const typeNodeText = firstParam.getTypeNode?.()?.getText?.() ?? '';
        const m = typeNodeText.match(/<\s*([^>]+)\s*>/);
        if (m) {
          const raw = m[1].trim();
          const maybeImported = resolveImportedTypeByText(raw);
          if (maybeImported) dataType = maybeImported;
          else {
            let found: InterfaceDeclaration | TypeAliasDeclaration | undefined =
              file.getInterface(raw) ?? file.getTypeAlias(raw);
            if (!found) {
              for (const sf of project.getSourceFiles()) {
                found = sf.getInterface(raw) ?? sf.getTypeAlias(raw);
                if (found) break;
              }
            }
            if (found) dataType = found.getType();
            else {
              // textual fallback: expand import(...) occurrences inside raw
              const expanded = expandImportedPatternsInTextGlobal(raw);
              // If expanded is an object type, use it directly
              if (expanded.startsWith('{') && expanded.endsWith('}')) {
                const fields = [];
                const propMatches = expanded.slice(1, -1).split(';');
                for (const prop of propMatches) {
                  const [name, type] = prop.split(':').map((s) => s.trim());
                  if (name && type) {
                    const cleanName = name.replace('?', '');
                    const isOptional = name.endsWith('?');
                    fields.push({
                      name: cleanName,
                      type,
                      required: !isOptional,
                      description: '',
                    });
                  }
                }
                metadata.push({
                  name: exportName,
                  description: fnDescription,
                  parameters: fields,
                });
                return;
              }
              if (DEBUG && expanded !== raw) {
                console.info(
                  'Textual expansion produced:',
                  expanded.slice(0, 300)
                );
              }
            }
          }
        }
      } catch {}
    }

    const fields = dataType ? extractPropertiesFromType(dataType) : [];
    metadata.push({
      name: exportName,
      description: fnDescription,
      parameters: fields,
    });
  });
}

/** Write JSON ***************************************************************/
const outPath = path.resolve('src/functionMetadata.json');
fs.writeFileSync(outPath, JSON.stringify(metadata, null, 2), {
  encoding: 'utf8',
});
console.info(`✅ Metadata written to ${outPath} (${metadata.length} entries)`);
if (DEBUG)
  console.info(
    'You ran with DEBUG=true — check console logs for unresolved import(...) patterns.'
  );
