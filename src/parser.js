const TokenKind = {
    EOS: "EOS",
    LPAR: "LPAR",
    RPAR: "RPAR",
    IDENTIFIER: "IDENTIFIER",
    NUMBER: "NUMBER",
    SPACE: "SPACE"
}

class Token {
    constructor(kind, symbol) {
        this.kind = kind
        this.symbol = symbol
    }
}

const TOKEN_REGEXES = {
    [TokenKind.SPACE]: /^\s+/,
    [TokenKind.LPAR]: /^\(/,
    [TokenKind.RPAR]: /^\)/,
    [TokenKind.NUMBER]: /^-?\d+(\.\d*)?/,
    [TokenKind.IDENTIFIER]: /^\w\S*/,
}

function tokenize(stream) {
    let tokens = []
    while (stream.length) {
        // Search the next token
        // We do that by matching the remaing of the stream through all the 
        // declared regexes
        let token = null
        for (let kind in TOKEN_REGEXES) {
            let regex = TOKEN_REGEXES[kind]
            result = stream.match(regex)
            if (result != null) {
                let symbol = result[0]
                //console.debug(`found token ${kind} "${symbol}"`)
                token = new Token(kind, symbol)
                stream = stream.substring(token.symbol.length)
                break
            }
        }

        // No token found :'(
        if (token === null) {
            throw new Error("cannot parse " + stream)
        }

        // We don't emit SPACE token, waste of processing time
        // for the parser
        if (token.kind === TokenKind.SPACE) {
            continue
        }

        tokens.push(token)
    }

    // End of stream
    tokens.push(new Token(TokenKind.EOS, null))

    return tokens
}

// LL Parser
// https://en.wikipedia.org/wiki/LL_parser

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
// 0. S ::= SEXPR $
// 1. SEXPR ::= ( identifier ARGS )
// 2. ARGS ::= ARG ARGS
// 3. ARGS ::= ''
// 4. ARG ::= number
// 5. ARG ::= SEXPR
PARSER_RULES = [
    [Symbol.SEXPR, Symbol.EOS], // 0
    [Symbol.LPAR, Symbol.IDENTIFIER, Symbol.ARGS, Symbol.RPAR], // 1
    [Symbol.ARG, Symbol.ARGS], // 2
    [], // 3
    [Symbol.NUMBER], // 4
    [Symbol.SEXPR], // 5
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

function build_ast(tokens, symbol) {
    let token = tokens[0]
    if (token.kind == symbol) {
        tokens.shift()
        return {
            terminal: true,
            symbol: symbol,
            token: token
        }
    } else {
        try {
            let rule = PARSER_TABLE[symbol][token.kind]
            let derivation = PARSER_RULES[rule]
            return {
                terminal: false,
                symbol: symbol,
                rule: rule,
                childrens: derivation.map(s => build_ast(tokens, s))
            }
        } catch (error) {
            throw new Error(`Unexpected token ${token.symbol}`)
        }
    }
}

function parse(stream) {
    let tokens = tokenize(stream)
    let root = build_ast(tokens, Symbol.S)

    return root
}