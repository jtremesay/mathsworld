import { tokenize } from "./tokenizer.js"
import { LLGrammar, LLParser } from "./ll_parser.js"

const TokenKind = {
    EOS: "$",
    LPAR: "LPAR",
    RPAR: "RPAR",
    IDENTIFIER: "IDENTIFIER",
    NUMBER: "NUMBER",
    SPACE: "SPACE"
}

const TOKEN_REGEXES = {
    [TokenKind.SPACE]: /^\s+/,
    [TokenKind.LPAR]: /^\(/,
    [TokenKind.RPAR]: /^\)/,
    [TokenKind.NUMBER]: /^-?\d+(\.\d*)?/,
    [TokenKind.IDENTIFIER]: /^\w\S*/,
}

const SEXPR_PARSER = new LLParser(LLGrammar.from_str(`
S → SEXPR $
SEXPR → LPAR IDENTIFIER ARGS RPAR
ARGS → ARG ARGS
ARGS → ε
ARG → NUMBER
ARG → SEXPR
`,
    "S"))

class SExprNode {
    constructor(identifier, args) {
        this.identifier = identifier
        this.args = args
    }

    accept(visitor) {
        return visitor.visit(this)
    }
}

class LL2SEXPRVisitor {
    visit_S(node) {
        return this.visit(node.children[0])
    }

    visit_SEXPR(node) {
        return new SExprNode(
            this.visit(node.children[1]),
            this.visit(node.children[2])
        )
    }

    visit_ARGS(node) {
        if (node.children.length == 0) {
            return []
        }

        return [this.visit(node.children[0])].concat(this.visit(node.children[1]))
    }

    visit_ARG(node) {
        return this.visit(node.children[0])
    }

    visit_non_terminal_symbol(node) {
        return this[`visit_${node.symbol}`](node)
    }

    visit_IDENTIFIER(node) {
        return node.token.text
    }

    visit_NUMBER(node) {
        return parseFloat(node.token.text)
    }

    visit(node) {
        let method = this[`visit_${node.symbol}`]
        if (method === undefined) {
            throw new Error(`Unimplemented method for ${node.symbol}`)
        }

        return method.bind(this)(node)
    }
}

export function parse_sexpr(sexpr) {
    // Tokenize the scene text
    const tokens = Array.from(tokenize(sexpr, TOKEN_REGEXES, TokenKind.EOS, [TokenKind.SPACE]))
    console.log("tokens:", tokens)

    // Build an LL AST
    const ll_ast = SEXPR_PARSER.parse(tokens)
    console.log("LL AST:", ll_ast)

    // Build S-expr AST
    const ll2sexpr_visitor = new LL2SEXPRVisitor()
    const sexpr_ast = ll2sexpr_visitor.visit(ll_ast)
    console.log("S-expr AST:", sexpr_ast)

    return sexpr_ast
}