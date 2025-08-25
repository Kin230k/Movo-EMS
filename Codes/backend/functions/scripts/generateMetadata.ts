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
const DEBUG = true;

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

/** Known fixed expansions (project-specific) */
function getFixedType(typeName: string): string | undefined {
  const fixedTypes: Record<string, string> = {
    Multilingual: '{ en: string; ar: string }',
    ClientStatus: '"accepted" | "rejected" | "pending"',
    SubmissionOutcome: `"pass" | "fail" | "manual_review"`,
    CriteriaOperator: `"equals" | "greater_than" | "less_than" | "contains" | "between" | "not_equals" | "greater_than_or_equal" | "less_than_or_equal"`,
  };
  return fixedTypes[typeName];
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
 * Resolve import("...").Type textual patterns to ts-morph Type objects.
 * Accepts forms like:
 * - import("...").T
 * - import("...").T[]
 * - Array<import("...").T>
 */
function resolveImportedTypeByText(
  typeText: string,
  originSF?: SourceFile
): Type | undefined {
  if (!typeText) return undefined;
  let cleaned = typeText.trim();

  // strip parentheses
  if (cleaned.startsWith('(') && cleaned.endsWith(')'))
    cleaned = cleaned.slice(1, -1).trim();

  // strip array suffix [] or Array<...>
  const arrSuffix = cleaned.match(/^(.*)\[\]$/);
  if (arrSuffix) cleaned = arrSuffix[1].trim();

  const arrGen = cleaned.match(/^(?:Array|ReadonlyArray)<\s*(.+)\s*>$/);
  if (arrGen) cleaned = arrGen[1].trim();

  const m = cleaned.match(
    /import\(["'`](.+?)["'`]\)\.?(?:default|((?:[A-Za-z0-9_$]+\.)*[A-Za-z0-9_$]+))/
  );
  if (!m) return undefined;

  let filePathInImport = m[1];
  let rawTypeName = m[2] || 'default';

  const typeNameParts = rawTypeName.split('.');
  const typeName = typeNameParts[typeNameParts.length - 1];

  // Normalize path (handle file:/// and windows)
  let normalizedImportPath = filePathInImport.replace(/^file:\/+/, '');
  normalizedImportPath = path
    .normalize(normalizedImportPath)
    .replace(/\\/g, '/');

  // If import path references the same file as originSF by absolute path, prefer originSF
  try {
    if (originSF) {
      const originPath = originSF.getFilePath().replace(/\\/g, '/');
      if (
        originPath.endsWith(normalizedImportPath) ||
        originPath.includes(normalizedImportPath)
      ) {
        // prefer the originSF
        const localIface =
          originSF.getInterface(typeName) ?? originSF.getTypeAlias(typeName);
        if (localIface) return localIface.getType();
      }
    }
  } catch {}

  // Make relative to project root if absolute
  const projectRoot = process.cwd();
  if (normalizedImportPath.startsWith(projectRoot)) {
    normalizedImportPath = path.relative(projectRoot, normalizedImportPath);
  }

  // Normalize drive letter
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
  let sf: SourceFile | undefined;

  for (const suff of trySuffixes) {
    const candidate = normalizedImportPath + suff;
    sf = allFiles.find((s) => {
      const filePath = s.getFilePath().replace(/\\/g, '/');
      if (process.platform === 'win32' || filePath.includes(':')) {
        return filePath.toLowerCase().endsWith(candidate.toLowerCase());
      }
      return filePath.endsWith(candidate);
    });
    if (sf) break;
  }

  if (!sf) {
    sf = allFiles.find((s) =>
      s
        .getFilePath()
        .replace(/\\/g, '/')
        .toLowerCase()
        .includes(normalizedImportPath.toLowerCase())
    );
  }

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

  // special-case known file segments
  if (!sf && normalizedImportPath.includes('multilingual.type')) {
    sf = allFiles.find((s) =>
      s.getFilePath().toLowerCase().includes('multilingual.type')
    );
  }

  if (DEBUG) {
    console.info('resolveImportedTypeByText:', {
      normalizedImportPath,
      typeName,
      matched: sf?.getFilePath?.(),
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

      // default fallback for default exports
      if (rawTypeName === 'default') {
        const firstAlias = sf.getTypeAliases()[0];
        if (firstAlias) return firstAlias.getType();
        const firstIface = sf.getInterfaces()[0];
        if (firstIface) return firstIface.getType();
      }
    } catch (e) {
      if (DEBUG) console.info('error inspecting file', e);
    }
  }

  // fallback: find by name across project
  const found = findTypeDeclarationByNameAcrossProject(typeName);
  if (found) return found.getType();

  // final textual search
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
    if (iface) return iface.getText();
    const ta = sf.getTypeAlias(typeName);
    if (ta) return ta.getText();

    const txt = sf.getFullText();
    const ifaceRegex = new RegExp(
      `export\\s+interface\\s+${typeName}\\s*\\{([\\s\\S]*?)\\}`,
      'm'
    );
    const ifaceM = txt.match(ifaceRegex);
    if (ifaceM) return `interface ${typeName} {${ifaceM[1]}}`;

    const typeRegex = new RegExp(
      `export\\s+type\\s+${typeName}\\s*=\\s*([\\s\\S]*?);`,
      'm'
    );
    const typeM = txt.match(typeRegex);
    if (typeM) return `type ${typeName} = ${typeM[1].trim()};`;

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
  } catch {}
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

/** ---------- Replace all import("...") occurrences (improved) ---------- */
function expandImportedPatternsInTextGlobal(
  text: string,
  depth = 0,
  originSF?: SourceFile,
  seen: Set<string> = new Set()
): string {
  if (!text || depth > 8) return text;

  // Match import("...") optionally followed by .Type or .A.B
  const importRegex =
    /import\(["'`](.+?)["'`]\)\.?(?:default|((?:[A-Za-z0-9_$]+\.)*[A-Za-z0-9_$]+))/g;

  let current = text;
  let iteration = 0;
  while (iteration < 10) {
    iteration++;
    let changed = false;

    current = current.replace(importRegex, (match, importPath, maybeName) => {
      // A key that uniquely identifies this pattern + originSF so we can skip repeated attempts
      const originKey = originSF?.getFilePath?.() ?? '';
      const key = `${originKey}::${match}`;

      // If we've already attempted to expand this exact match for this origin, skip it.
      if (seen.has(key)) {
        if (DEBUG) console.info('Skipping already-seen import pattern', key);
        return match;
      }

      // Mark as attempted immediately to avoid re-entrance while processing.
      seen.add(key);

      try {
        const typeNameParts = (maybeName || 'default').split('.');
        const typeName = typeNameParts[typeNameParts.length - 1];

        // Known types first
        const fixedType = getFixedType(typeName);
        if (fixedType) {
          changed = true;
          return fixedType;
        }

        // Prefer a declaration that exists in the same source file as the handler
        try {
          if (originSF) {
            const localIface =
              originSF.getInterface(typeName) ??
              originSF.getTypeAlias(typeName);
            if (localIface) {
              const localType = localIface.getType();
              const replacement = renderTypeInline(
                localType,
                depth + 1,
                originSF
              );
              // safety: if replacement still contains the original match, don't replace (avoid cycles)
              if (replacement.includes(match)) {
                if (DEBUG)
                  console.info(
                    'Replacement contains original import, skipping to avoid cycle',
                    match
                  );
                return match;
              }
              changed = true;
              return replacement;
            }
          }
        } catch (e) {
          if (DEBUG) console.info('originSF lookup failed', e);
        }

        // Try resolving to a Type object and render inline
        const resolved = resolveImportedTypeByText(match);
        if (resolved) {
          const replacement = renderTypeInline(resolved, depth + 1, originSF);
          if (replacement.includes(match)) {
            if (DEBUG)
              console.info(
                'Resolved replacement contains original import, skipping',
                match
              );
            return match;
          }
          changed = true;
          return replacement;
        }

        // Try to find the source file and textual declaration
        const sf = findSourceFileForImportPath(importPath);
        if (sf) {
          const declText = extractDeclarationTextFromSourceFile(sf, typeName);
          if (declText) {
            const inline = normalizeDeclarationText(declText, typeName);
            const recursed = expandImportedPatternsInTextGlobal(
              inline,
              depth + 1,
              originSF,
              seen
            );
            if (recursed.includes(match)) {
              if (DEBUG)
                console.info(
                  'Inlined decl still contains import match, skipping replace',
                  match
                );
              return match;
            }
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

      // If we reach here we didn't successfully replace; return the original match.
      return match;
    });

    // If no change this pass, break
    if (!/import\(/.test(current) || !changed) break;
  }

  // Final fallback single-pass that also uses the seen set
  try {
    const singlePass = current.replace(
      importRegex,
      (m, importPath, maybeName) => {
        const originKey = originSF?.getFilePath?.() ?? '';
        const key = `${originKey}::${m}`;
        if (seen.has(key)) return m;
        seen.add(key);

        const typeNameParts = (maybeName || 'default').split('.');
        const typeName = typeNameParts[typeNameParts.length - 1];
        const fixedType = getFixedType(typeName);
        if (fixedType) return fixedType;

        try {
          if (originSF) {
            const localIface =
              originSF.getInterface(typeName) ??
              originSF.getTypeAlias(typeName);
            if (localIface) {
              const replacement = renderTypeInline(
                localIface.getType(),
                0,
                originSF
              );
              if (replacement.includes(m)) return m;
              return replacement;
            }
          }
        } catch (e) {
          if (DEBUG) console.info('originSF fallback lookup failed', e);
        }

        try {
          const foundDecl = findTypeDeclarationByNameAcrossProject(typeName);
          if (foundDecl) {
            const replacement = renderTypeInline(
              foundDecl.getType(),
              0,
              originSF
            );
            if (replacement.includes(m)) return m;
            return replacement;
          }
          const sf = findSourceFileForImportPath(importPath);
          if (sf) {
            const declText = extractDeclarationTextFromSourceFile(sf, typeName);
            if (declText) {
              const normalized = normalizeDeclarationText(declText, typeName);
              if (normalized.includes(m)) return m;
              return normalized;
            }
          }
        } catch (e) {
          if (DEBUG) console.info('fallback resolution error for', typeName, e);
        }
        return m;
      }
    );
    current = singlePass;
  } catch (e) {
    /* ignore */
  }

  // Recurse once more to ensure nested import(...) inside the newly-inlined text are expanded
  if (current !== text)
    return expandImportedPatternsInTextGlobal(
      current,
      depth + 1,
      originSF,
      seen
    );
  return current;
}
/** ---------- Type rendering ---------- **/

function isDateLikeType(type: Type | undefined): boolean {
  if (!type) return false;
  try {
    const sym = type.getSymbol?.();
    const symName =
      typeof sym?.getName === 'function' ? (sym.getName() as string) : '';
    if (symName === 'Date') return true;
    const txt = (type.getText?.() || '').toString();
    if (/\bDate\b/.test(txt)) return true;
    if (txt.includes('toISOString') || txt.includes('getFullYear')) return true;
  } catch {}
  return false;
}

function renderObjectTypeInline(
  type: Type,
  depth = 0,
  originSF?: SourceFile
): string {
  try {
    if (isDateLikeType(type)) return 'Date';

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
      if (propTypeObj)
        rendered = renderTypeInline(propTypeObj, depth + 1, originSF);
      else {
        const maybe = (p as any).getType?.()?.getText?.() ?? 'any';
        rendered = expandImportedPatternsInTextGlobal(
          maybe,
          depth + 1,
          originSF
        );
      }

      rendered = expandImportedPatternsInTextGlobal(
        rendered,
        depth + 1,
        originSF
      );
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

function renderTypeInline(
  type: Type | undefined,
  depth = 0,
  originSF?: SourceFile
): string {
  if (!type) return 'any';
  if (depth > 8) {
    try {
      return (type as any).getText?.() ?? 'any';
    } catch {
      return 'any';
    }
  }

  try {
    if (isDateLikeType(type)) return 'Date';
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

  // Expand textual import(...) first with originSF
  try {
    const expanded = expandImportedPatternsInTextGlobal(text, depth, originSF);
    if (expanded !== text) return expanded;
  } catch {}

  // Handle textual import(...) + array forms
  try {
    if (/import\(/.test(text) && /\[\]$/.test(text)) {
      const inner = text.replace(/\[\]$/, '').trim();
      const resolved = resolveImportedTypeByText(inner, originSF);
      if (resolved)
        return `${renderTypeInline(resolved, depth + 1, originSF)}[]`;
      const expandedInner = expandImportedPatternsInTextGlobal(
        inner,
        depth + 1,
        originSF
      );
      if (expandedInner !== inner) return `${expandedInner}[]`;
    }

    const arrMatch = text.match(/^Array<\s*(.+)\s*>$/);
    if (arrMatch) {
      const inner = arrMatch[1].trim();
      const resolved = resolveImportedTypeByText(inner, originSF);
      if (resolved)
        return `${renderTypeInline(resolved, depth + 1, originSF)}[]`;
      const expandedInner = expandImportedPatternsInTextGlobal(
        inner,
        depth + 1,
        originSF
      );
      if (expandedInner !== inner) return `${expandedInner}[]`;
    }

    // unions with import(...)
    if (text.includes('|') && /import\(/.test(text)) {
      const parts = text.split('|').map((s) => s.trim());
      const mapped = parts.map((p) => {
        if (/import\(/.test(p)) {
          const resolved = resolveImportedTypeByText(p, originSF);
          if (resolved) return renderTypeInline(resolved, depth + 1, originSF);
          return expandImportedPatternsInTextGlobal(p, depth + 1, originSF);
        }
        return p;
      });
      return mapped.join(' | ');
    }
  } catch {}

  // Primitives
  if (
    ['string', 'number', 'boolean', 'any', 'unknown', 'void', 'never'].includes(
      text
    )
  )
    return text;
  if (/^'.*'$|^".*"$|^\d+$|^(true|false)$/.test(text)) return text;

  // arrays via TS api
  try {
    const e = (type as any).getArrayElementType?.();
    if (e) return `${renderTypeInline(e, depth + 1, originSF)}[]`;
  } catch {}
  if (text.endsWith('[]')) return text;

  // unions (real)
  try {
    if ((type as any).isUnion?.()) return text || 'any';
  } catch {}

  // symbols (interfaces / aliases)
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
            const inline = renderObjectTypeInline(
              declaredType,
              depth + 1,
              originSF
            );
            const expanded = expandImportedPatternsInTextGlobal(
              inline,
              depth + 1,
              originSF
            );
            return expanded;
          }
        }
      }
    }
  } catch {}

  // object-like fallback
  try {
    const props = type.getProperties?.() ?? [];
    if (props.length > 0) {
      if (/^\{.*\}$/.test(text) || !/^import\(|^[a-zA-Z0-9_$]+\b$/.test(text)) {
        return renderObjectTypeInline(type, depth + 1, originSF);
      }
      return text || 'any';
    }
  } catch {}

  try {
    const final = expandImportedPatternsInTextGlobal(text, depth + 1, originSF);
    return final || 'any';
  } catch {
    return text || 'any';
  }
}

/** ---------- Extract properties into metadata fields ---------- */
function extractPropertiesFromType(type: Type, originSF?: SourceFile) {
  const fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }> = [];

  try {
    if (isDateLikeType(type)) {
      return [
        {
          name: '(value)',
          type: 'Date',
          required: true,
          description: '',
        },
      ];
    }

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
          propTypeText =
            fixedType || renderTypeInline(propTypeObj, 0, originSF);
        } catch {
          propTypeText = renderTypeInline(propTypeObj, 0, originSF);
        }
      } else {
        const maybe = (prop as any).getType?.()?.getText?.() ?? 'any';
        if (
          maybe.includes('toISOString') ||
          maybe.includes('getFullYear') ||
          /\bDate\b/.test(maybe)
        ) {
          propTypeText = 'Date';
        } else {
          if (maybe.includes('Multilingual') && maybe.includes('import')) {
            propTypeText = getFixedType('Multilingual') || maybe;
          } else if (
            maybe.includes('ClientStatus') &&
            maybe.includes('import')
          ) {
            propTypeText = getFixedType('ClientStatus') || maybe;
          } else {
            propTypeText = expandImportedPatternsInTextGlobal(
              maybe,
              0,
              originSF
            );
          }
        }
      }

      // Ensure nested import(...) in textual forms are expanded with originSF
      propTypeText = expandImportedPatternsInTextGlobal(
        propTypeText,
        0,
        originSF
      );

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
  } catch {}
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

    // attempt to get generic argument type (CallableRequest<T>)
    let dataType: Type | undefined;
    try {
      const paramType = firstParam.getType?.();
      if (paramType) {
        const typeArgs = paramType.getTypeArguments?.() ?? [];
        if (typeArgs.length > 0) dataType = typeArgs[0];
      }
    } catch {}

    // fallback: parse textual type node and handle import(...) patterns (preferring types in `file`)
    if (!dataType) {
      try {
        const typeNodeText = firstParam.getTypeNode?.()?.getText?.() ?? '';
        const m = typeNodeText.match(/<\s*([^>]+)\s*>/);
        if (m) {
          const raw = m[1].trim();
          const maybeImported = resolveImportedTypeByText(raw, file);
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
              const expanded = expandImportedPatternsInTextGlobal(raw, 0, file);
              if (expanded.startsWith('{') && expanded.endsWith('}')) {
                const fields: Array<{
                  name: string;
                  type: string;
                  required: boolean;
                  description: string;
                }> = [];
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
              if (DEBUG && expanded !== raw)
                console.info(
                  'Textual expansion produced:',
                  expanded.slice(0, 300)
                );
            }
          }
        }
      } catch (e) {
        if (DEBUG) console.info('error parsing textual type node', e);
      }
    }

    const fields = dataType ? extractPropertiesFromType(dataType, file) : [];
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
