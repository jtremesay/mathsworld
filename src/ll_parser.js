class NonTerminalSymbol {
    constructor(symbol, children) {
        this.symbol = symbol
        this.children = children
    }
}

class TerminalSymbol {
    constructor(symbol, token) {
        this.symbol = symbol
        this.token = token
    }
}

function build_table(rules) {
    // TODO
}

function parse(tokens, symbol, rules, table) {
    const token = tokens[0]
    if (token.kind == symbol) {
        tokens.shift()

        return new TerminalSymbol(symbol, token)
    } else {
        try {
            const rule = table[symbol][token.kind]
            const derivation = rules[rule][1]

            return new NonTerminalSymbol(
                symbol,
                derivation.map(s => parse(tokens, s, rules, table))
            )
        } catch (error) {
            throw new Error(`Unexpected token ${token.text}`)
        }
    }
}

export function ll_parse(tokens, start_symbol, rules, table) {
    // TODO: remove table from parameters and use build_table(rules)
    // const table = build_table(rules)
    return parse(tokens, start_symbol, rules, table)
}