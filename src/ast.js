const walkPre = nodeName => (walker, node) => {
  if (walker[nodeName].pre) {
    walker[nodeName].pre(node);
  }
};

const walkPost = nodeName => (walker, node) => {
  if (walker[nodeName].post) {
    walker[nodeName].post(node);
  }
};

// Identifier = SimpleIdentifier | QualifiedIdentifier | Import
function isIdentifier(node) {
  return isSimpleIdentifier(node) || isQualifiedIdentifier(node) || isImport(node);
}
function walkIdentifier(walker, node) {
  if (isSimpleIdentifier(node)) {
    walkSimpleIdentifier(walker, node);
  }

  if (isQualifiedIdentifier(node)) {
    walkQualifiedIdentifier(walker, node);
  }

  if (isImport(node)) {
    walkImport(walker, node);
  }

  throw new Error('not an identifier');
}

// SimpleIdentifier = String
function simpleIdentifier(name) {
  return {node: 'simpleIdentifier', name};
}
function isSimpleIdentifier(node) {
  return node.node === 'simpleIdentifier';
}
function walkSimpleIdentifier(walker, node) {
  walkPre('simpleIdentifier')(walker, node);
  walkPost('simpleIdentifier')(walker, node);
}

// QualifiedIdentifier = (Identifier, String) // outer::inner
function qualifiedIdentifier(outer, inner) {
  return {node: 'qualifiedIdentifier', outer, inner};
}
function isQualifiedIdentifier(node) {
  return node.node === 'qualifiedIdentifier';
}
function walkQualifiedIdentifier(walker, node) {
  walkPre('qualifiedIdentifier')(walker, node);
  walkIdentifier(node.outer);
  walkPost('qualifiedIdentifier')(walker, node);
}

// Import = UEI
function importt(uei) {
  return {node: 'import', uei};
}
function isImport(node) {
  return node.node === 'import';
}
function walkImport(walker, node) {
  walkPre('import')(walker, node);
  walkPost('import')(walker, node);
}

// Module = ModuleLiteral | Identifier
function isModule(node) {
  return isModuleLiteral(node) || isIdentifier(node);
}
function walkModule(walker, node) {
  if (isModuleLiteral(node)) {
    walkModuleLiteral(walker, node);
  }

  if (isIdentifier(node)) {
    walkIdentifier(walker, node);
  }

  throw new Error('not a module');
}

// ModuleLiteral = List<Entry>
function moduleLiteral(entries) {
  return {node: 'moduleLiteral', entries};
}
function isModuleLiteral(node) {
  return node.node === 'moduleLiteral';
}
function walkModuleLiteral(walker, node) {
  walkPre('moduleLiteral')(walker, node);
  node.entries.forEach(entry => walkEntry(walker, entry));
  walkPost('moduleLiteral')(walker, node);
}

// Entry = ModuleBinding | TypeBinding | ExpressionBinding
function isEntry(node) {
  return isModuleBinding(node) || isTypeBinding(node) || isExpressionBinding(node);
}
function walkEntry(walker, node) {
  if (isModuleBinding(node)) {
    walkModuleBinding(walker, node);
  }

  if (isTypeBinding(node)) {
    walkTypeBinding(walker, node);
  }

  if (isExpressionBinding(node)) {
    walkExpressionBinding(walker, node);
  }

  throw new Error('not an entry');
}

// ModuleBinding = {isPublic: Bool, name: String, module: Module}
function moduleBinding(isPublic, name, module) {
  return {
    node: 'moduleBinding',
    isPublic,
    name,
    module
  };
}
function isModuleBinding(node) {
  return node.node === 'moduleBinding';
}
function walkModuleBinding(walker, node) {
  walkPre('moduleBinding')(walker, node);
  walkModule(walker, node.module);
  walkPost('moduleBinding')(walker, node);
}

// TypeBinding = {isPublic: Bool, name: String, type: Type}
function typeBinding(isPublic, name, type) {
  return {
    node: 'typeBinding',
    isPublic,
    name,
    type
  };
}
function isTypeBinding(node) {
  return node.node === 'typeBinding';
}
function walkTypeBinding(walker, node) {
  walkPre('typeBinding')(walker, node);
  walkType(walker, node.type);
  walkPost('typeBinding')(walker, node);
}

// Type = Identifier | ADT | FnType
function isType(node) {
  return isIdentifier(node) || isADT(node) || isFnType(node);
}
function walkType(walker, node) {
  if (isIdentifier(node)) {
    walkIdentifier(walker, node);
  }

  if (isADT(node)) {
    walkADT(walker, node);
  }

  if (isFnType(node)) {
    walkFnType(walker, node);
  }

  throw new Error('not a type');
}

// ADT = List<Summand>
function adt(summands) {
  return {node: 'adt', summands};
}
function isADT(node) {
  return node.node === 'adt';
}
function walkADT(walker, node) {
  walkPre('adt')(walker, node);
  node.summands.forEach(summand => walkSummand(walker, summand));
  walkPost('adt')(walker, node);
}

// Summand = {tag: String, products: List<Type>}
function summand(tag, products) {
  return {node: 'summand', tag, products};
}
function isSummand(node) {
  return node.node === 'summand';
}
function walkSummand(walker, node) {
  walkPre('summand')(walker, node);
  node.products.forEach(product => walkType(walker, product));
  walkPost('summand')(walker, node);
}

// FnType = {args: List<Type>, out: Type}
function fnType(args, out) {
  return {node: 'fnType', args, out};
}
function isFnType(node) {
  return node.node === 'fnType';
}
function walkFnType(walker, node) {
  walkPre('fnType')(walker, node);
  node.args.forEach(arg => walkType(walker, arg));
  walkType(walker, node.out);
  walkPost('fnType')(walker, node);
}

// ExpressionBinding = {isPublic: Bool, name: String, expression: Expression}
function expressionBinding(isPublic, name, expression) {
  return {
    node: 'expressionBinding',
    isPublic,
    name,
    expression
  };
}
function isExpressionBinding(node) {
  return node.node === 'expressionBinding';
}
function walkExpressionBinding(walker, node) {
  walkPre('expressionBinding')(walker, node);
  walkExpression(walker, node.expression);
  walkPost('expressionBinding')(walker, node);
}

// Expression = Identifier | Projection | Case | FnLiteral | Application
function isExpression(node) {
  return isIdentifier(node) || isProjection(node) || isCase(node) ||
  isFnLiteral(node) || isApplication(node);
}
function walkExpression(walker, node) {
  if (isIdentifier(node)) {
    walkIdentifier(walker, node);
  }

  if (isProjection(node)) {
    walkProjection(walker, node);
  }

  if (isCase(node)) {
    walkCase(walker, node);
  }

  if (isFnLiteral(node)) {
    walkFnLiteral(walker, node);
  }

  if (isApplication(node)) {
    walkApplication(walker, node);
  }

  throw new Error('not an expression');
}

// Projection = {expression: Expression, index: Nat}
function projection(expression, index) {
  return {node: 'projection', expression, index};
}
function isProjection(node) {
  return node.node === 'projection';
}
function walkProjection(walker, node) {
  walkPre('projection')(walker, node);
  walkExpression(walker, node.expression);
  walkPost('projection')(walker, node);
}

// Case = List<Branch>
function casee(branches) {
  return {node: 'case', branches};
}
function isCase(node) {
  return node.node === 'case';
}
function walkCase(walker, node) {
  walkPre('case')(walker, node);
  node.branches.forEach(branch => walkBranch(walker, branch));
  walkPost('case')(walker, node);
}

// Branch = {tag: String, boundNames: List<String>, body: Expression}
function branch(tag, boundNames, body) {
  return {
    node: 'branch',
    tag,
    boundNames,
    body
  };
}
function isBranch(node) {
  return node.node === 'branch';
}
function walkBranch(walker, node) {
  walkPre('branch')(walker, node);
  walkExpression(walker, node.body);
  walkPost('branch')(walker, node);
}

// FnLiteral = {args: List<String>, body: Expression}
function fnLiteral(args, body) {
  return {node: 'fnLiteral', args, body};
}
function isFnLiteral(node) {
  return node.node === 'fnLiteral';
}
function walkFnLiteral(walker, node) {
  walkPre('fnLiteral')(walker, node);
  walkExpression(walker, node.body);
  walkPost('fnLiteral')(walker, node);
}

// Application = {fn: Expression, args: List<Expression>}
function application(fn, args) {
  return {node: 'application', fn, args};
}
function isApplication(node) {
  return node.node === 'application';
}
function walkApplication(walker, node) {
  walkPre('application')(walker, node);
  walkExpression(walker, node.fn);
  node.args.forEach(arg => walkExpression(walker, arg));
  walkPost('application')(walker, node);
}

function isNode(node) {
  return (node.node === 'simpleIdentifier') ||
  (node.node === 'qualifiedIdentifier') ||
  (node.node === 'import') ||
  (node.node === 'moduleLiteral') ||
  (node.node === 'moduleBinding') ||
  (node.node === 'typeBinding') ||
  (node.node === 'adt') ||
  (node.node === 'summand') ||
  (node.node === 'fnType') ||
  (node.node === 'expressionBinding') ||
  (node.node === 'projection') ||
  (node.node === 'case') ||
  (node.node === 'branch') ||
  (node.node === 'fnLiteral') ||
  (node.node === 'application');
}

function walkNode(walker, node) {
  if (isSimpleIdentifier(node)) {
    return walkSimpleIdentifier(walker, node);
  }

  if (isQualifiedIdentifier(node)) {
    return walkQualifiedIdentifier(walker, node);
  }

  if (isImport(node)) {
    return walkImport(walker, node);
  }

  if (isModuleLiteral(node)) {
    return walkModuleLiteral(walker, node);
  }

  if (isModuleBinding(node)) {
    return walkModuleBinding(walker, node);
  }

  if (isTypeBinding(node)) {
    return walkTypeBinding(walker, node);
  }

  if (isADT(node)) {
    return walkADT(walker, node);
  }

  if (isSummand(node)) {
    return walkSummand(walker, node);
  }

  if (isFnType(node)) {
    return walkFnType(walker, node);
  }

  if (isExpressionBinding(node)) {
    return walkExpressionBinding(walker, node);
  }

  if (isProjection(node)) {
    return walkProjection(walker, node);
  }

  if (isCase(node)) {
    return walkCase(walker, node);
  }

  if (isBranch(node)) {
    return walkBranch(walker, node);
  }

  if (isFnLiteral(node)) {
    return walkFnLiteral(walker, node);
  }

  if (isApplication(node)) {
    return walkApplication(walker, node);
  }

  throw new Error('invalid node');
}

const throwOnFalse = bool => {
  if (!bool) {
    throw new Error();
  }
};

// Takes a node and recursively checks whether it and its descendents have the
// expected fields.
function validateNode(node) {
  if (!isNode(node)) {
    return false;
  }

  const walker = {
    simpleIdentifier: {
      pre: node => throwOnFalse(isSimpleIdentifier(node) && (typeof node.name === 'string'))
    },
    qualifiedIdentifier: {
      pre: node => throwOnFalse(isQualifiedIdentifier(node) && (typeof node.inner === 'string'))
    },
    import: {
      pre: node => throwOnFalse(isImport(node))
    },
    moduleLiteral: {
      pre: node => throwOnFalse(isModuleLiteral(node) && Array.isArray(node.entries))
    },
    moduleBinding: {
      pre: node => throwOnFalse(isModuleBinding(node) && (typeof node.isPublic === 'boolean') &&
        (typeof node.name === 'string'))
    },
    typeBinding: {
      pre: node => throwOnFalse(isTypeBinding(node) && (typeof node.isPublic === 'boolean') &&
        (typeof node.name === 'string'))
    },
    adt: {
      pre: node => throwOnFalse(isADT(node) && Array.isArray(node.summands))
    },
    summand: {
      pre: node => throwOnFalse(isSummand(node) && (typeof node.tag === 'string') &&
        Array.isArray(node.products))
    },
    fnType: {
      pre: node => throwOnFalse(isFnType(node) && Array.isArray(node.args))
    },
    expressionBinding: {
      pre: node => throwOnFalse(isExpressionBinding(node) && (typeof node.isPublic === 'boolean') &&
        (typeof node.name === 'string'))
    },
    projection: {
      pre: node => throwOnFalse(isProjection(node) && (typeof node.index === 'number'))
    },
    case: {
      pre: node => throwOnFalse(isCase(node) && Array.isArray(node.branches))
    },
    branch: {
      pre: node => throwOnFalse(isBranch(node) && (typeof node.tag === 'string') &&
        Array.isArray(node.boundNames))
    },
    fnLiteral: {
      pre: node => throwOnFalse(isFnLiteral(node) && Array.isArray(node.args))
    },
    application: {
      pre: node => throwOnFalse(isApplication(node) && Array.isArray(node.args))
    }
  };

  try {
    walkNode(walker, node);
    return true;
  } catch (err) {
    return false;
  }
}

// Takes a (valid) node and returns a Set of all UEIs imported within the node.
function allImportedUEIs(node) {
  const ueis = new Set();

  const walker = {
    import: {
      pre: node => ueis.add(node.uei)
    }
  };

  walkNode(walker, node);

  return ueis;
}

const indent = (amount, content) => ' '.repeat(amount).concat(content);

function ppSimpleIdentifier(node) {
  return node.name;
}

function ppQualifiedIdentifier(node, indentation) {
  return `${prettyPrint(node.outer, indentation)}::${node.inner}`;
}

function ppImport(node, indentation) {
  const uei = node.uei.prettyPrint ? node.uei.prettyPrint(indentation) : JSON.stringify(node.uei);

  return `import[${uei}]`;
}

function ppModuleLiteral(node, indentation) {
  let str = '{\n';

  if (node.entries.length > 0) {
    str += node.entries.map(
      entry => `${indent(indentation + 2, prettyPrint(entry, indentation + 2))};\n`
    ).join('\n');

    str += indent(indentation, '');
  }

  str += '}\n';

  return str;
}

function ppModuleBinding(node, indentation) {
  return `${node.isPublic ? 'public ' : ''}module ${node.name} = ${prettyPrint(node.module, indentation)}`;
}

function ppTypeBinding(node, indentation) {
  return `${node.isPublic ? 'public ' : ''}type ${node.name} = ${prettyPrint(node.type, indentation)}`;
}

function ppADT(node, indentation) {
  let str = '{\n';

  if (node.summands.length > 0) {
    str += node.summands.map(
      summand => `${indent(indentation + 2, ppSummand(summand, indentation + 2))},\n`
    ).join('\n');

    str += indent(indentation, '');
  }

  str += '}\n';

  return str;
}

function ppSummand(node, indentation) {
  let str = `${node.tag}`;

  if (node.product.length > 0) {
    str += '(';
    str += node.products.map(product => prettyPrint(product, indentation)).join(', ');
    str += ')';
  }

  return str;
}

function ppFnType(node, indentation) {
  let str = '(';
  str += node.args.map(arg => prettyPrint(arg, indentation)).join(', ');
  str += ') -> ';
  str += prettyPrint(node.out, indentation);
  return str;
}

function ppExpressionBinding(node, indentation) {
  return `${node.isPublic ? 'public ' : ''}type ${node.name} = ${prettyPrint(node.expression, indentation)}`;
}

function ppProjection(node, indentation) {
  return `${prettyPrint(node.expression, indentation)}.${node.index}`;
}

function ppCase(node, indentation) {
  let str = '{\n';

  if (node.branches.length > 0) {
    str += node.branches.map(
      branch => `${indent(indentation + 2, ppBranch(branch, indentation + 2))},\n`
    ).join('\n');

    str += indent(indentation, '');
  }

  str += '}\n';

  return str;
}

function ppBranch(node, indentation) {
  let str = node.tag;

  if (node.boundNames.length > 0) {
    str += '(';
    str += node.boundNames.map(boundName => prettyPrint(boundName, indentation)).join(', ');
    str += ')';
  }

  return str;
}

function ppFnLiteral(node, indentation) {
  let str = '(';
  str += node.args.map(arg => prettyPrint(arg, indentation)).join(', ');
  str += ') -> {\n';
  str += indent(indentation + 2, prettyPrint(node.body, indentation + 2));
  str += indent(indentation, '}\n');
  return str;
}

function ppApplication(node, indentation) {
  let str = prettyPrint(node.fn, indentation);
  str += '(';
  str += node.args.map(arg => prettyPrint(arg, indentation)).join(', ');
  str += ')';
  return str;
}

// Takes a node pretty prints it.
function prettyPrint(node, indentation) {
  if (!indentation) {
    indentation = 0;
  }

  if (isSimpleIdentifier(node)) {
    return ppSimpleIdentifier(node, indentation);
  }

  if (isQualifiedIdentifier(node)) {
    return ppQualifiedIdentifier(node, indentation);
  }

  if (isImport(node)) {
    return ppImport(node, indentation);
  }

  if (isModuleLiteral(node)) {
    return ppModuleLiteral(node, indentation);
  }

  if (isModuleBinding(node)) {
    return ppModuleBinding(node, indentation);
  }

  if (isTypeBinding(node)) {
    return ppTypeBinding(node, indentation);
  }

  if (isADT(node)) {
    return ppADT(node, indentation);
  }

  if (isSummand(node)) {
    return ppSummand(node, indentation);
  }

  if (isFnType(node)) {
    return ppFnType(node, indentation);
  }

  if (isExpressionBinding(node)) {
    return ppExpressionBinding(node, indentation);
  }

  if (isProjection(node)) {
    return ppProjection(node, indentation);
  }

  if (isCase(node)) {
    return ppCase(node, indentation);
  }

  if (isBranch(node)) {
    return ppBranch(node, indentation);
  }

  if (isFnLiteral(node)) {
    return ppFnLiteral(node, indentation);
  }

  if (isApplication(node)) {
    return ppApplication(node, indentation);
  }

  throw new Error('invalid node');
}

exports.isIdentifier = isIdentifier;
exports.walkIdentifier = walkIdentifier;
exports.simpleIdentifier = simpleIdentifier;
exports.isSimpleIdentifier = isSimpleIdentifier;
exports.walkSimpleIdentifier = walkSimpleIdentifier;
exports.qualifiedIdentifier = qualifiedIdentifier;
exports.isQualifiedIdentifier = isQualifiedIdentifier;
exports.walkQualifiedIdentifier = walkQualifiedIdentifier;
exports.importt = importt;
exports.isImport = isImport;
exports.walkImport = walkImport;
exports.isModule = isModule;
exports.walkModule = walkModule;
exports.moduleLiteral = moduleLiteral;
exports.isModuleLiteral = isModuleLiteral;
exports.walkModuleLiteral = walkModuleLiteral;
exports.isEntry = isEntry;
exports.walkEntry = walkEntry;
exports.moduleBinding = moduleBinding;
exports.isModuleBinding = isModuleBinding;
exports.walkModuleBinding = walkModuleBinding;
exports.typeBinding = typeBinding;
exports.isTypeBinding = isTypeBinding;
exports.walkTypeBinding = walkTypeBinding;
exports.isType = isType;
exports.walkType = walkType;
exports.adt = adt;
exports.isADT = isADT;
exports.walkADT = walkADT;
exports.summand = summand;
exports.isSummand = isSummand;
exports.walkSummand = walkSummand;
exports.fnType = fnType;
exports.isFnType = isFnType;
exports.walkFnType = walkFnType;
exports.expressionBinding = expressionBinding;
exports.isExpressionBinding = isExpressionBinding;
exports.walkExpressionBinding = walkExpressionBinding;
exports.isExpression = isExpression;
exports.walkExpression = walkExpression;
exports.projection = projection;
exports.isProjection = isProjection;
exports.walkProjection = walkProjection;
exports.casee = casee;
exports.isCase = isCase;
exports.walkCase = walkCase;
exports.branch = branch;
exports.isBranch = isBranch;
exports.walkBranch = walkBranch;
exports.fnLiteral = fnLiteral;
exports.isFnLiteral = isFnLiteral;
exports.walkFnLiteral = walkFnLiteral;
exports.application = application;
exports.isApplication = isApplication;
exports.walkApplication = walkApplication;
exports.isNode = isNode;
exports.walkNode = walkNode;
exports.validateNode = validateNode;
exports.allImportedUEIs = allImportedUEIs;
exports.prettyPrint = prettyPrint;
