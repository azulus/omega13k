var babel = require('babel-core');
var babylon = require('babylon');
var fs = require('fs');
var oid = require('oid');
var path = require('path');
var types = require('babel-types');

const SHOULD_REMOVE_COMMENTS = true;
const SHOULD_INLINE_CONSTS = true;
const SHOULD_RENAME_GLOBALS = true;
const SHOULD_MINIFY = true;

module.exports = function(src) {
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
        throw new Error('Unable to delete type ' + node.type + ' as ' + key);
      }
    }
  };

  var currentIndexNode = null;
  var currentIndex = null;
  var indexMap = {};
  var toDeleteMap = {};

  /**
   * Phase 1
   *   inline constants
   */
  if (SHOULD_INLINE_CONSTS) {
    visit(ast, {
      'VariableDeclarator': (node) => {
        if (node.id &&
          node.id.type === 'Identifier' &&
          node.id.name.indexOf('Index') !== -1) {
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
            parent[key][idx] = types.numericLiteral(indexMap[node.object
              .name][node.property.name]);
          } else {
            parent[key] = types.numericLiteral(indexMap[node.object.name]
              [node.property.name]);
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

    var keyCounter = 0;
    var keySpace = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(
      '');
    var keyMap = {};

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

    globalProperties.properties.forEach(prop => {
      var oldKey = prop.key.name;
      var newKey = generateKey(keyCounter++);
      keyMap[oldKey] = newKey;
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
          var newKey = keyMap[node.property.name];
          if (typeof newKey !== 'string') {
            throw new Error('Unable to rename', node.property.name);
          }
          node.property.name = newKey;
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
