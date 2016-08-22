var babel = require('babel-core');
var babylon = require('babylon');
var fs = require('fs');
var oid = require('oid');
var path = require('path');
var types = require('ast-types');

var def = types.Type.def;
def('ObjectProperty').bases('Node');
def('ClassMethod').bases('Node');
def('StringLiteral').bases('Node');
def('ObjectMethod').bases('Node');
types.finalize();

var src = fs.readFileSync(path.join(__dirname, '..', 'g.js'));
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

visit(ast, {
  // 'CommentBlock': (node, key, idx) => {
  //   var parent = parentOf(node);
  //   if (!parent) return;
  //
  //   if (key.toLowerCase().indexOf('comment') !== -1) {
  //     parent[key] = [];
  //   } else if (key === 'tokens') {
  //     parent[key] = parent[key].filter(item => {
  //       return !item || typeof item !== 'object' || ['CommentBlock', 'CommentLine'].indexOf(item.type) !== -1;
  //     });
  //   } else {
  //     throw new Error(parent.type, key, idx)
  //   }
  // },
  //
  // 'CommentLine': (node, key, idx) => {
  //   var parent = parentOf(node);
  //   if (!parent) return;
  //
  //   if (key.toLowerCase().indexOf('comment') !== -1) {
  //     parent[key] = [];
  //   } else if (key === 'tokens') {
  //     parent[key] = parent[key].filter(item => {
  //       return !item || typeof item !== 'object' || ['CommentBlock', 'CommentLine'].indexOf(item.type) !== -1;
  //     });
  //   } else {
  //     throw new Error(parent.type, key, idx)
  //   }
  // },

  'BlockStatement': (node) => {
    // console.log(node);
  },

  'AssignmentExpression': (node) => {
    // console.log(node);
  },

  'Node': (node) => {
    if (['CommentBlock', 'CommentLine'].indexOf(node.type) === -1) {
      // console.log(node.type);
      if (node.loc) {
        // console.log(node.type, node.loc.indent);
        node.loc.indent = 0;
      }
    }
    node.leadingComments = null;
    node.comments = null;
    node.trailingComments = null;
  }
});

var transpiledSource = babel.transformFromAst(ast, src, {
  compact:true,
  comments:false
}).code;
console.log(transpiledSource);
