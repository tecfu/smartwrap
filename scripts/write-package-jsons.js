'use strict'
const fs = require('fs')
const path = require('path')

fs.writeFileSync(
  path.join('dist', 'esm', 'package.json'),
  JSON.stringify({ type: 'module' }, null, 2) + '\n'
)
fs.writeFileSync(
  path.join('dist', 'cjs', 'package.json'),
  JSON.stringify({ type: 'commonjs' }, null, 2) + '\n'
)

// CJS interop: allow `const smartwrap = require('smartwrap')` to be the function
const cjsMain = path.join('dist', 'cjs', 'main.js')
if (fs.existsSync(cjsMain)) {
  let code = fs.readFileSync(cjsMain, 'utf8')
  if (!code.includes('module.exports = exports.default')) {
    code +=
      '\nmodule.exports = exports.default;\n' +
      'module.exports.default = exports.default;\n' +
      'module.exports.smartwrap = exports.smartwrap;\n' +
      'module.exports.SmartwrapOptions = undefined;\n'
    // SmartwrapOptions is type-only; strip that last line - types don't exist at runtime
    code = code.replace(
      'module.exports.SmartwrapOptions = undefined;\n',
      ''
    )
    fs.writeFileSync(cjsMain, code)
  }
}


console.log('Wrote dist package metadata and CJS interop')
