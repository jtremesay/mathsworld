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

const Symbol = {
    [TokenKind.EOS]: TokenKind.EOS,
    [TokenKind.LPAR]: TokenKind.LPAR,
    [TokenKind.RPAR]: TokenKind.RPAR,
    [TokenKind.IDENTIFIER]: TokenKind.IDENTIFIER,
    [TokenKind.NUMBER]: TokenKind.NUMBER,
    S: "S", // Start symbol
    SEXPR: "SEXPR",
    EXPR: "EXPR",
    ARGS: "ARGS",
    ARG: "ARG",
}

const SEXPR_PARSER = new LLParser(LLGrammar.from_str(`
S → SEXPR $
SEXPR → LPAR IDENTIFIER ARGS RPAR
ARGS → ARG ARGS
ARGS → ε
ARG → NUMBER
ARG → SEXPR
`,
    Symbol.S))

class SExprNode {
    constructor(identifier, args) {
        this.identifier = identifier
        this.args = args
    }
}

class NumberNode {
    constructor(value) {
        this.value = value
    }
}

function build_arg(ll_arg) {
    const arg = ll_arg.children[0]
    if (arg.symbol == Symbol.SEXPR) {
        return build_sexpr(arg)
    } else {
        return parseFloat(arg.token.text)
    }
}

function build_args(ll_args) {
    if (ll_args.children.length == 0) {
        return []
    } else {
        return [build_arg(ll_args.children[0])].concat(build_args(ll_args.children[1]))
    }
}

function build_sexpr(ll_sexpr) {
    return new SExprNode(ll_sexpr.children[1].token.text, build_args(ll_sexpr.children[2]))
}

function build_s(ll_s) {
    return build_sexpr(ll_s.children[0])
}

export function parse_sexpr(sexpr) {
    // Tokenize the scene text
    const tokens = Array.from(tokenize(sexpr, TOKEN_REGEXES, TokenKind.EOS, [TokenKind.SPACE]))
    console.log("tokens:", tokens)

    // Build an LL AST
    const ll_ast = SEXPR_PARSER.parse(tokens)
    console.log("LL AST:", ll_ast)

    // Build S-expr AST
    const sexpr_ast = build_s(ll_ast)
    console.log("S-expr AST:", sexpr_ast)

    return sexpr_ast
}