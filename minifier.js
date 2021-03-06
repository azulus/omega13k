var colors = require('colors');
var babel = require('babel-core');
var babylon = require('babylon');
var fs = require('fs');
var oid = require('oid');
var path = require('path');
var types = require('babel-types');

const SHOULD_INLINE_BLOCK_STATEMENTS = false; // DOES NOT WORK CORRECTLY
const SHOULD_INLINE_CONSTS = true;
const SHOULD_MERGE_CONSECUTIVE_DECLARATIONS = true;
const SHOULD_MINIFY = true;
const SHOULD_RENAME_GLOBALS = true;
const SHOULD_RENAME_LOCALS = true;
const SHOULD_REMOVE_COMMENTS = true;
const SHOULD_REMOVE_UNUSED_GLOBALS = true; // requires SHOULD_RENAME_GLOBALS
const SHOULD_WARN_ABOUT_SINGLE_USE_LOCALS = true;

var keyCounter = 0;
var keySpace = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(
  '');
var generateKey = (idx) => {
  var keyString = '';
  while (true) {
    keyString = keySpace[idx % keySpace.length] + keyString;
    if (idx < keySpace.length) {
      return keyString;
    } else {
      idx = Math.floor(idx / keySpace.length);
    }
  }
};

module.exports = function(src) {
  var srcLines = String(src).split(/\n/);

  var getSource = (node) => {
    var loc = node.loc;
    var lines = [];
    for (var l = loc.start.line; l <= loc.end.line; l++) {
      var line = srcLines[l - 1];

      if (l === loc.end.line) {
        line = line.substr(0, loc.end.column);
      }

      if (l === loc.start.line) {
        line = line.substr(loc.start.column);
      }
      lines.push(line);
    }
    return lines.join('\n');
  }

  var minimizeSource = (src) => src.replace(/[\n\s\t]/g, ' ').replace(/\s{2,}/g, ' ')

  var ast = babylon.parse(String(src), {
    sourceType: 'module',
    plugins: [
      'jsx',
      'flow',
      'asyncFunctions',
      'classConstructorCall',
      'doExpressions',
      'trailingFunctionCommas',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'exponentiationOperator',
      'asyncGenerators',
      'functionBind',
      'functionSent'
    ]
  });

  var testAst = babylon.parse(String('for (let i =0; i < 10; i++) if (i === 0) break;'), {
    sourceType: 'module',
    plugins: [
      'jsx',
      'flow',
      'asyncFunctions',
      'classConstructorCall',
      'doExpressions',
      'trailingFunctionCommas',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'exponentiationOperator',
      'asyncGenerators',
      'functionBind',
      'functionSent'
    ]
  });

  var parentHash = {};

  var parentOf = function(node) {
    return parentHash[oid.hash(node)];
  }

  var visit = function(node, visitor, parent, initialKey, idx) {
    if (typeof node.type !== 'string') {
      return;
    }

    parentHash[oid.hash(node)] = parent;

    // call entry functions as necessary
    if (visitor['Node']) {
      visitor['Node'](node, initialKey, idx);
    }
    if (visitor[node.type]) {
      visitor[node.type](node, initialKey, idx);
    }

    // iterate through all children which look like ast nodes
    for (var key in node) {
      if (['type', 'loc', 'parent'].indexOf(key) !== -1) {
        continue;
      }

      if (typeof node[key] === 'object' && !!node[key] && node[key].type) {
        visit(node[key], visitor, node, key);
      } else if (Array.isArray(node[key])) {
        node[key].forEach(function(childNode, idx) {
          if (typeof childNode === 'object' && !!childNode && childNode
            .type) {
            visit(childNode, visitor, node, key, idx);
          }
        });
      }
    }

    // call exit functions
    var exitKey = node.type + ':exit';
    if (visitor[exitKey]) {
      visitor[exitKey](node, initialKey, idx);
    }
    if (visitor['Node:exit']) {
      visitor['Node:exit'](node, initialKey, idx);
    }
  };

  var handleDelete = (node, key, idx) => {
    if (toDeleteMap[oid.hash(node)]) {
      var parent = parentOf(node);
      if (!parent) throw new Error('Unable to delete without parent');
      if (idx) {
        parent[key] = parent[key].filter(n => n !== node);
      } else {
        var moreInfo = '';
        node.declarations.forEach(decl => {
            if (decl.id.name.indexOf('Index') !== -1 || decl.id.name.indexOf('Const') !== -1) {
              moreInfo += '. The variable, ' + decl.id.name + ', ends with either Const or Index. Please rename it.'
            }
        })
        throw new Error('Unable to delete type ' + node.type + ' as ' + key + moreInfo);
      }
    }
  };

  var nodeTypes = [];
  visit(ast, {
    'Node': (node, key, idx) => {
      if (nodeTypes.indexOf(node.type) === -1) {
        nodeTypes.push(node.type);
      }
    }
  });

  var currentIndexNode = null;
  var currentIndex = null;
  var indexMap = {};
  var toDeleteMap = {};

  var createNodeForConst = (objName, propName) => {
    var val = indexMap[objName][propName];
    if (typeof val === 'string') {
      return types.stringLiteral(val);
    } else if (typeof val === 'number'){
      return types.numericLiteral(val);
    } else {
      return null;
    }
  }

  if (SHOULD_RENAME_LOCALS) {
    const VariableTypes = {
      PARAM: 1,
      GLOBAL: 2,
      LOCAL: 3
    };

    var functionStack = [{
      variables: {
        'Array': 'Array',
        'Audio': 'Audio',
        'Date': 'Date',
        'Error': 'Error',
        'Float32Array': 'Float32Array',
        'Infinity': 'Infinity',
        'Math': 'Math',
        'Object': 'Object',

        'addEventListener': 'addEventListener',
        'alert': 'alert',
        'console': 'console',
        'document': 'document',
        'jsfxr': 'jsfxr',
        'location': 'location',
        'parseFloat': 'parseFloat',
        'parseInt': 'parseInt',
        'removeEventListener': 'removeEventListener',
        'requestAnimationFrame': 'requestAnimationFrame',
        'setInterval': 'setInterval',
        'setTimeout': 'setTimeout',
        'undefined': 'undefined',
        'window': 'window'
      },
      count: {},
      node: 'global'
    }];

    var addMapping = (v, refCount) => {
      var key;
      if (functionStack.length === 1) {
        key = v;
      } else {
        var idx = 0;
        key;
        while (true) {
          key = generateKey(idx);
          if (!isMapped(key)) {
            break;
          }
          idx++;
        }
      }
      functionStack[functionStack.length - 1].variables[v] = key;
      incrementCount(v, refCount);
      return key;
    }

    var isMapped = (v) => {
      for (var i = functionStack.length - 1; i >= 0; i--) {
        var vars = functionStack[i].variables;
        for (var j in vars) {
          if (vars[j] === v) {
            return true;
          }
        }
      }
      return false;
    }

    var incrementCount = (v, refCount) => {
      refCount = refCount || 1;
      for (var i = functionStack.length - 1; i >= 0; i--) {
        if (functionStack[i].variables[v]) {
          functionStack[i].count[v] = (functionStack[i].count[v] || 0) + refCount;
        }
      }
    }

    var getMapping = (v) => {
      for (var i = functionStack.length - 1; i >= 0; i--) {
        if (functionStack[i].variables[v]) {
          return functionStack[i].variables[v];
        }
      }
    }

    var changedNodes = {};

    // all references must be to $, _, a constant, or in a local let
    // all params will be renamed
    // all variables

    var pushFunction = (node) => {
      var curr = {
        variables: {},
        count: {},
        node: node
      };
      functionStack.push(curr);
      node.params.forEach(param => {
        if (param.type === 'AssignmentPattern') {
          addMapping(param.left.name, 2);
        } else if (param.type === 'RestElement') {
          addMapping(param.argument.name, 2);
        } else {
          addMapping(param.name, 2);
        }
      });
    };

    var popFunction = (node) => {
      var removedStack = functionStack.pop();
      for (var key in removedStack.count) {
        if (SHOULD_WARN_ABOUT_SINGLE_USE_LOCALS && removedStack.count[key] <= 2) {
          if (removedStack.node && parentOf(removedStack.node) && parentOf(removedStack.node).type === 'ObjectProperty') {
            console.log(key + ' only referenced once in global property: ' + parentOf(removedStack.node).key.name);
          } else {
            console.log(key + ' only referenced once in unknown scope');
          }
        }
      }
    };

    visit(ast, {
      'Identifier': (node, key, idx) => {
        if (key === 'key') return;
        if (key === 'property' && parentOf(node).computed !== true) return;

        var mapping = getMapping(node.name);
        if (!mapping) {
          console.log(
            'VARIABLE ' + node.name + ' MUST BE DEFINED ON $ namespace or in a let/const',
            getSource(parentOf(node)));
        } else {
          incrementCount(node.name);
          if (node.name !== mapping){
            node.name = mapping;
          }
        }
      },

      'VariableDeclarator': (node, key, idx) => {
        if (node.id.type === 'Identifier') {
          addMapping(node.id.name);
        } else if (node.id.type === 'ArrayPattern') {
          node.id.elements.forEach(el => {
            if (el && el.name) addMapping(el.name);
          });
        } else if (node.id.type === 'ObjectPattern') {
          node.id.properties.forEach(prop => {
            addMapping(prop.key.name);
          });
        } else {
          throw new Error('Unable to handle declaration of type: ' + node.id.type);
        }
      },

      'FunctionExpression': pushFunction,
      'FunctionExpression:exit': popFunction,
      'ArrowFunctionExpression': pushFunction,
      'ArrowFunctionExpression:exit': popFunction
    });
  }

  /**
   * Phase 1
   *   inline constants
   */
  if (SHOULD_INLINE_CONSTS) {
    visit(ast, {
      'VariableDeclarator': (node) => {
        if (node.id &&
          node.id.type === 'Identifier' &&
          (node.id.name.indexOf('Index') !== -1 || node.id.name.indexOf('Const') !== -1)
        ) {
          currentIndexNode = node;
          currentIndex = {};
          indexMap[node.id.name] = currentIndex;

          toDeleteMap[oid.hash(parentOf(node))] = true;
        }
      },

      'MemberExpression': (node, key, idx) => {
        if (node.object.type === 'Identifier' && indexMap[node.object.name]) {
          var parent = parentOf(node);
          var val = createNodeForConst(node.object.name, node.property.name);
          if (!val) {
            console.warn('Unable to inline ' + node.object.name + '.' + node.property.name);
            return;
          }
          if (typeof idx !== 'undefined') {
            parent[key][idx] = val;
          } else {
            parent[key] = val;
          }
        }
      },

      'VariableDeclarator:exit': (node, key, idx) => {
        if (node === currentIndexNode) {
          currentIndexNode = null;
          currentIndex = null;
        }
      },

      'ObjectProperty': (node) => {
        if (currentIndexNode) {
          switch(node.value.type) {
            case 'UnaryExpression':
              currentIndex[node.key.name] = -1 * node.value.argument.value;
              break;
            case 'TemplateLiteral':
              // template literals, no interpolation
              currentIndex[node.key.name] = node.value.quasis.map(quasi => quasi.value.raw).join('');
              break;
            default:
              currentIndex[node.key.name] = node.value.value;
              if (currentIndex[node.key.name] === undefined) {
                throw new Error();
              }
              break;
          }
        }
      },

      'Node:exit': handleDelete
    });
  }

  var globalProperties = null;

  if (SHOULD_MERGE_CONSECUTIVE_DECLARATIONS) {
    visit(ast, {
      'VariableDeclaration': (node, key, idx) => {
        node.kind = 'let';
        if (typeof idx === 'undefined' || idx === 0) return;
        var parent = parentOf(node);

        var currIdx = idx;
        while (true) {
          if (currIdx > 0 && parent[key][currIdx - 1].type === 'VariableDeclaration') {
            currIdx--
          } else break;
        }

        if (currIdx === idx) return;
        parent[key][currIdx].declarations = parent[key][currIdx].declarations.concat(node.declarations);
        node.declarations = [];
      },

      'BlockStatement:exit': (node, key, idx) => {
          node.body = node.body.filter(n => n.type !== 'VariableDeclaration' ||
            n.declarations.length > 0);
      },

      'Program:exit': (node, key, idx) => {
          node.body = node.body.filter(n => n.type !== 'VariableDeclaration' ||
            n.declarations.length > 0);
      }
    });
  }

  /**
   * Phase 2
   *   rename globals
   */
  if (SHOULD_RENAME_GLOBALS) {
    visit(ast, {
      'VariableDeclarator': (node) => {
        if (node.id && node.id.type === 'Identifier' && node.id.name ===
          '$') {
          globalProperties = node.init;
        }
      },

      'CallExpression': (node, key, idx) => {
        if (node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === '$' &&
          node.callee.property.name === 'assign' &&
          node.arguments.length === 2 &&
          node.arguments[0].type === 'Identifier' &&
          node.arguments[0].name === '$') {
          globalProperties.properties = globalProperties.properties.concat(
            node.arguments[1].properties);
          node.arguments[1].properties = [];

          var parent = parentOf(node);
          toDeleteMap[oid.hash(parent)] = true;
        }
      },

      'Node:exit': handleDelete
    });

    var globalKeyMap = {};
    var globalReverseKeyMap = {};

    globalProperties.properties.forEach(prop => {
      var oldKey = prop.key.name;
      var newKey = generateKey(keyCounter++);
      globalKeyMap[oldKey] = newKey;
      globalReverseKeyMap[newKey] = oldKey;
      prop.key.name = newKey;
    });

    /**
     * Phase 3
     *   rename any referenced global properties
     */
    visit(ast, {
      'MemberExpression': (node, key, idx) => {
        if (node.object.type === 'Identifier' &&
          node.object.name === '$') {
          if (node.property.type !== 'StringLiteral' && node.property.type !==
            'Identifier') {
            throw new Error('Unable to reason about $ reference:' +
              JSON.stringify(node.property));
          }
          var newKey = globalKeyMap[node.property.name];
          if (typeof newKey !== 'string') {
            throw new Error('Unable to rename: ' + node.property.name);
          }
          node.property.name = newKey;
        }
      }
    });

    if (SHOULD_REMOVE_UNUSED_GLOBALS) {
      do {
        var refCount = {};
        var originalRemoveKeys = [];
        var removeKeys = [];

        globalProperties.properties.forEach(prop => {
          var oldKey = prop.key.name;
          refCount[oldKey] = 0;
        });

        /**
         * Phase 3
         *   rename any referenced global properties
         */
        visit(ast, {
          'MemberExpression': (node, key, idx) => {
            if (node.object.type === 'Identifier' &&
              node.object.name === '$') {
              refCount[node.property.name] = (refCount[node.property.name] || 0) + 1
            }
          }
        });

        // remove all globals on $ that are never used
        for (var key in refCount) {
          if (refCount[key] === 0) {
            removeKeys.push(key);
            originalRemoveKeys.push(globalReverseKeyMap[key]);
          }
        }
        if (removeKeys.length > 0) {
          console.warn('REMOVING UNUSED GLOBALS: ' + originalRemoveKeys.join(', '));
          globalProperties.properties = globalProperties.properties.filter(prop => removeKeys.indexOf(prop.key.name) === -1)
        }
      } while (removeKeys.length > 0);
    }
  }

  if (SHOULD_INLINE_BLOCK_STATEMENTS) {
    visit(ast, {
      'BlockStatement:exit': (node, key, idx) => {
        if (node.body && node.body.length === 1) {
          var child = node.body[0];
          var parent = parentOf(node);

          if (child.type === 'ExpressionStatement' &&
            (
              (parent.type === 'IfStatement' && key === 'consequent')
              || (parent.type === 'WhileStatement' && key === 'body')
              || (parent.type === 'WhileStatement' && key === 'consequent')
              || (parent.type === 'IfStatement' && key === 'body')
              || (parent.type === 'IfStatement' && key === 'alternate')
              || (parent.type === 'ForStatement' && key === 'body')
              || (parent.type === 'ArrowFunctionExpression' && key === 'body')
            )) {
            // var es = types.expressionStatement();
            // console.log(es);
            parent[key] = child;
          } else if (['ContinueStatement', 'ReturnStatement', 'ThrowStatement', 'BreakStatement'].indexOf(child.type) !== -1 &&
              ['IfStatement'].indexOf(parent.type) !== -1) {
            parent[key] = child;
          } else if (child.type === 'ReturnStatement') {
            parent[key] = child.argument;
          }
        }
      }
    });
  }

  var transpiledSource = babel.transformFromAst(ast, src, {
    compact: SHOULD_MINIFY,
    comments: !SHOULD_REMOVE_COMMENTS,
    minified: SHOULD_MINIFY
  }).code;

  return new Buffer(transpiledSource, 'utf8');
}
