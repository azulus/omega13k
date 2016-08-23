var minifier = require('../minifier.js');
console.log(
  minifier(fs.readFileSync(path.join(__dirname, '..', 'dist', 'g.js')))
);
