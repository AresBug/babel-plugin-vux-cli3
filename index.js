const fs = require('fs')
const path = require('path')

module.exports = (babelHelper, opts = {}) => {
  const filename = opts.filename ? opts.filename : 'vux'
  let sep = path.sep
  const vuxMapsPath = `${require.resolve(filename).split(`${sep}${filename}${sep}`)[0]}${sep}${filename}${sep}src${sep}components${sep}map.json`
  global.vuxMaps = fs.existsSync(vuxMapsPath) ? require(vuxMapsPath) : {}

  const { types } = babelHelper
  return {
    visitor: {
      ImportDeclaration(path) {
        let node = path.node
        let { specifiers } = node
        if (filename === node.source.value && !types.isImportDefaultSpecifier(specifiers[0])) {
          let newImports = specifiers.map(specifier => {
            return types.importDeclaration(
              [types.importDefaultSpecifier(specifier.local)],
              types.stringLiteral(`${filename}/${global.vuxMaps[specifier.local.name]}`)
            )
          })
          path.replaceWithMultiple(newImports)
        }
      }
    }
  }
}
