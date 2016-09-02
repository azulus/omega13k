var colors = require('colors');
var babel = require('babel-core');
var babylon = require('babylon');
var fs = require('fs');
var oid = require('oid');
var path = require('path');
var types = require('babel-types');

const SHOULD_RENAME_LOCALS = true;
const SHOULD_REMOVE_COMMENTS = true;
const SHOULD_INLINE_CONSTS = true;
const SHOULD_RENAME_GLOBALS = true;
const SHOULD_MINIFY = true;

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

  var ast = babylon.parse(String(src), {
    sourceType: 'module',
    plugins: [
      'float32Array',
      'Error',
      'requestAnimationFrame',
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
    } else {
      return types.numericLiteral(val);
    }
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
          if (idx) {
            parent[key][idx] = createNodeForConst(node.object.name, node.property.name)
          } else {
            parent[key] = createNodeForConst(node.object.name, node.property.name)
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
          currentIndex[node.key.name] = node.value.value;
        }
      },

      'Node:exit': handleDelete
    });
  }

  var globalProperties = null;
  var refCount = {};

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

    globalProperties.properties.forEach(prop => {
      var oldKey = prop.key.name;
      var newKey = generateKey(keyCounter++);
      globalKeyMap[oldKey] = newKey;
      refCount[oldKey] = 0;
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
          refCount[node.property.name] = (refCount[node.property.name] || 0) + 1
          node.property.name = newKey;
        }
      }
    });

    // for (var key in refCount) {
    //     if (refCount[key] === 1) {
    //         console.warn(('$.' + key + ' is only used once, consider inlining').yellow);
    //     } else if (refCount[key] === 0) {
    //         console.warn(('$.' + key + ' is never used, consider removing').red);
    //     }
    // }
  }

  if (SHOULD_RENAME_LOCALS) {
    const VariableTypes = {
      PARAM: 1,
      GLOBAL: 2,
      LOCAL: 3
    };

    var functionStack = [{
      variables: {
        'alert': 'alert',
        'location': 'location',
        'Math': 'Math',
        'Object': 'Object',
        'Array': 'Array',
        'document': 'document',
        'parseFloat': 'parseFloat',
        'Audio': 'Audio',
        'jsfxr': 'jsfxr',
        'setTimeout': 'setTimeout',
        'setInterval': 'setInterval',
        'addEventListener': 'addEventListener',
        'removeEventListener': 'removeEventListener',
        'undefined': 'undefined',
        'Date': 'Date',
        'console': 'console'
      }
    }];

    var addMapping = (v) => {
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
        variables: {}
      };
      functionStack.push(curr);
      node.params.forEach(param => {
        if (param.type === 'AssignmentPattern') {
          addMapping(param.left.name);
        } else if (param.type === 'RestElement') {
          addMapping(param.argument.name);
        } else {
          addMapping(param.name);
        }
      });
    };

    var popFunction = (node) => {
      functionStack.pop();
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
        } else if (node.name !== mapping){
          node.name = mapping;
        }
      },

      'VariableDeclarator': (node, key, idx) => {
        if (node.id.type === 'Identifier') {
          addMapping(node.id.name);
        } else if (node.id.type === 'ArrayPattern') {
          node.id.elements.forEach(el => {
            addMapping(el.name);
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

  var transpiledSource = babel.transformFromAst(ast, src, {
    compact: SHOULD_MINIFY,
    comments: !SHOULD_REMOVE_COMMENTS,
    minified: SHOULD_MINIFY
  }).code;

  return new Buffer(transpiledSource, 'utf8');
}
