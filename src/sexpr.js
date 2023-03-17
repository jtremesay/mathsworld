import { tokenize } from "./tokenizer.js"
import { ll_parse } from "./ll_parser.js"

const TokenKind = {
    EOS: "EOS",
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

// Rules :
const PARSER_RULES = [
    // 0. S ::= SEXPR $
    [Symbol.S, [Symbol.SEXPR, Symbol.EOS]],
    // 1. SEXPR ::= ( identifier ARGS )
    [Symbol.SEXPR, [Symbol.LPAR, Symbol.IDENTIFIER, Symbol.ARGS, Symbol.RPAR]],
    // 2. ARGS ::= ARG ARGS
    [Symbol.ARGS, [Symbol.ARG, Symbol.ARGS]],
    // 3. ARGS ::= ''
    [Symbol.ARGS, []],
    // 4. ARG ::= number
    [Symbol.ARG, [Symbol.NUMBER]],
    // 5. ARG ::= SEXPR
    [Symbol.ARG, [Symbol.SEXPR]],
]

// Parser table
// Built width https://www.cs.princeton.edu/courses/archive/spring20/cos320/LL1/
//
//       |  (  |  )  |  id | number
// ------+-----+-----+-----+-------
// S     |  0  |     |     |     
// SEXPR |  1  |     |     |
// ARGS  |  2  |  3  |     |  2
// ARG   |  5  |     |     |  4
//
const PARSER_TABLE = {
    [Symbol.S]: {
        [Symbol.LPAR]: 0,
    },
    [Symbol.SEXPR]: {
        [Symbol.LPAR]: 1,
    },
    [Symbol.ARGS]: {
        [Symbol.LPAR]: 2,
        [Symbol.RPAR]: 3,
        [Symbol.NUMBER]: 2,
    },
    [Symbol.ARG]: {
        [Symbol.LPAR]: 5,
        [Symbol.NUMBER]: 4,
    },
}

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
    let arg = ll_arg.children[0]
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

    console.log("args", ll_args)

}

function build_sexpr(ll_sexpr) {
    return new SExprNode(ll_sexpr.children[1].token.text, build_args(ll_sexpr.children[2]))
}

function build_s(ll_s) {
    return build_sexpr(ll_s.children[0])
}

export function parse_sexpr(sexpr) {
    // Tokenize the scene text
    let tokens = Array.from(tokenize(sexpr, TOKEN_REGEXES, TokenKind.EOS, [TokenKind.SPACE]))
    console.log("tokens:", tokens)

    // Build an LL AST
    let ll_ast = ll_parse(tokens, Symbol.S, PARSER_RULES, PARSER_TABLE)
    console.log("LL AST:", ll_ast)

    // Build S-expr AST
    let sexpr_ast = build_s(ll_ast)
    console.log("S-expr AST:", sexpr_ast)

    return sexpr_ast
}