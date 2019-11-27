const pkg = require('../package.json');
const manifest = require('../src/manifest');

if (pkg.version !== manifest.version) {
  console.log('Error: version code mismatch between package and manifest.');
  process.exit(1);
}
