import * as ts from 'typescript'
import * as path from 'path'

// for spitroast to work in node, import paths must end in `.js`.
// while typescript supports this, deno does not. Deno only accepts imports from
// `.ts` or from no extension. So we have one runtime that accepts no extension,
// and one runtime that accepts only with extensions. Btw tsc won't work with .ts either.
// this transformer adds `.js` extensions onto the dist.
// based on @zoltu/typescript-transformer-append-js-extension for ttypescript 4.x, but now with ts-patch 5.x
// -- sink

export default (_: ts.Program) => (transformationContext: ts.TransformationContext) => (sourceFile: ts.SourceFile) => {
    function visitNode(node: ts.Node): ts.VisitResult<ts.Node> {
        if (shouldMutateModuleSpecifier(node)) {
            if (ts.isImportDeclaration(node)) {
                const newModuleSpecifier = ts.factory.createStringLiteral(`${node.moduleSpecifier.text}.js`)
                node = ts.factory.updateImportDeclaration(node, node.modifiers, node.importClause, newModuleSpecifier, node.attributes)
            } else if (ts.isExportDeclaration(node)) {
                const newModuleSpecifier = ts.factory.createStringLiteral(`${node.moduleSpecifier.text}.js`)
                node = ts.factory.updateExportDeclaration(node, node.modifiers, node.isTypeOnly, node.exportClause, newModuleSpecifier, node.attributes)
            }
        }

        return ts.visitEachChild(node, visitNode, transformationContext)
    }

    function shouldMutateModuleSpecifier(node: ts.Node): node is (ts.ImportDeclaration | ts.ExportDeclaration) & {
        moduleSpecifier: ts.StringLiteral
    } {
        if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) return false
        if (node.moduleSpecifier === undefined) return false
        // only when module specifier is valid
        if (!ts.isStringLiteral(node.moduleSpecifier)) return false
        // only when path is relative
        if (!node.moduleSpecifier.text.startsWith('./') && !node.moduleSpecifier.text.startsWith('../')) return false
        // only when module specifier has no extension
        if (path.extname(node.moduleSpecifier.text) !== '') return false
        return true
    }

    return ts.visitNode(sourceFile, visitNode)
}
