var babel = require('babel-core');
var babylon = require('babylon');
var fs = require('fs');
var oid = require('oid');
var path = require('path');
var types = require('babel-types');

module.exports = function (src) {
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

  var parentOf = function (node) {
    return parentHash[oid.hash(node)];
  }

  var visit = function (node, visitor, parent, initialKey, idx) {
      if (typeof node.type !== 'string') {
          return;
      }

      if (parentHash[oid.hash(node)]) throw new Error('Found parent twice');
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
              node[key].forEach(function (childNode, idx) {
                  if (typeof childNode === 'object' && !!childNode && childNode.type) {
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

  var erasableDeclarations = {};
  var currentIndexNode = null;
  var currentIndex = null;
  var indexMap = {};
  var toDeleteMap = {};

  var globalMap = null;
  var keySpace = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var keyMap = {};

  /**
   * Phase 1
   *   inline constants
   *   move all $.assign into initial definition
   *   strip comments / indents (necessary?)
   */
  visit(ast, {
    'VariableDeclarator': (node) => {
      if (node.id &&
          node.id.type === 'Identifier' &&
          node.id.name.indexOf('Index') !== -1) {
        currentIndexNode = node;
        currentIndex = {};
        indexMap[node.id.name] = currentIndex;

        erasableDeclarations[oid.hash(parentOf(node))] = true;
      } else if (node.id && node.id.type === 'Identifier' && node.id.name === '$') {
        globalMap = node.init;
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
        globalMap.properties = globalMap.properties.concat(node.arguments[1].properties);
        node.arguments[1].properties = [];

        var parent = parentOf(node);
        toDeleteMap[oid.hash(parent)] = true;
      }
    },

    'MemberExpression': (node, key, idx) => {
      if (node.object.type === 'Identifier' && indexMap[node.object.name]) {
          var parent = parentOf(node);
          if (idx) {
            parent[key][idx] = types.numericLiteral(indexMap[node.object.name][node.property.name]);
          } else {
            parent[key] = types.numericLiteral(indexMap[node.object.name][node.property.name]);
          }
      } else if (node.object.type === 'Identifier' && node.object.name === '$') {
        // console.log(node.property.name);
      }
    },

    'VariableDeclaration:exit': (node, key, idx) => {
      if (erasableDeclarations[oid.hash(node)]) {
        var parent = parentOf(node);
        parent[key] = parent[key].filter(n => n !== node)
      }
    },

    'VariableDeclarator:exit': (node, key, idx) => {
      if (node === currentIndexNode) {
        currentIndexNode = null;
        currentIndex = null;

        var parent = parentOf(node);
        var root = parentOf(parent);
      }
    },

    'ObjectProperty': (node) => {
      if (currentIndexNode) {
        currentIndex[node.key.name] = node.value.value;
      }
    },

    'Node': (node) => {
      if (['CommentBlock', 'CommentLine'].indexOf(node.type) === -1) {
        if (node.loc) {
          node.loc.indent = 0;
        }
      }
      node.leadingComments = null;
      node.comments = null;
      node.trailingComments = null;
    },

    'Node:exit': (node, key, idx) => {
      if (toDeleteMap[oid.hash(node)]) {
        var parent = parentOf(node);
        if (!parent) throw new Error('Unable to delete without parent');
        if (idx) {
          parent[key] = parent[key].filter(n => n !== node);
        } else {
          throw new Error('Unable to delete type ' + node.type + ' as ' + key);
        }
      }
    }
  });

  globalMap.properties.forEach(prop => {
    console.log(prop);
  });

  /**
   * Phase 2
   *   rename any referenced global properties
   */
  visit(ast, {

  });

  var transpiledSource = babel.transformFromAst(ast, src, {
    // compact:true,
    comments:false,
    // minified:true
  }).code;

  return new Buffer(transpiledSource, 'utf8');
}
