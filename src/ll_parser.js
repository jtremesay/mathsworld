function union(a, b) {
    let u = new Set(a)
    for (const e of b) {
        u.add(e)
    }

    return u
}

function difference(a, b) {
    let u = new Set(a)
    for (const e of b) {
        u.delete(e);
    }

    return u
}

function intersection(a, b) {
    return new Set(a.filter(e => b.has(e)))
}



export class LLRule {
    constructor(lhs, rhs) {
        this.lhs = lhs
        this.rhs = rhs
    }

    static from_str(rule_str) {
        let split = rule_str.split("→").map(s => s.trim())

        return new LLRule(split[0], split[1].split(" ").map(s => s.trim()))
    }
}

export class LLGrammar {
    constructor(rules, terminal_symbols, non_terminal_symbols, start) {
        this.rules = rules
        this.terminal_symbols = terminal_symbols
        this.non_terminal_symbols = non_terminal_symbols
        this.start = start
    }

    static from_str(rules_str, start) {
        // Build the list of rules
        const rules = rules_str.split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => LLRule.from_str(s))

        // Build the sets of non terminal and terminal symbols.
        const symbols = new Set(rules.map(r => r.rhs).reduce((p, c) => p.concat(c), []))
        // Non terminal symbols are lhs of rules.
        const non_terminal_symbols = new Set(rules.map(r => r.lhs))
        // Terminal symbols are rhs symbols that are not lhs.
        // Merge all the right parts into one fat array, and filter
        // non terminal symbols
        const terminal_symbols = difference(symbols, non_terminal_symbols)

        return new LLGrammar(rules, terminal_symbols, non_terminal_symbols, start)
    }
}

function compute_nullables(grammar) {
    const nullables = new Set("ε")
    let done = false
    while (!done) {
        done = true
        for (const rule of grammar.rules) {
            if (rule.rhs.every(x => nullables.has(x))) {
                if (!(nullables.has(rule.lhs))) {
                    nullables.add(rule.lhs)
                    done = false
                }
            }
        }
    }

    //nullables.delete("ε")

    return nullables
}

function compute_first_rhs(rhs, nullables, firsts) {
    // find longest nullable prefix
    var end = rhs.findIndex((symbol) => !(nullables.has(symbol)));
    if (end == -1) {
        end = rhs.length;
    }

    return rhs.slice(0, end + 1).map((symbol) => firsts[symbol]).reduce(union, new Set());
}


function compute_firsts(grammar, nullables) {
    const firsts = {}

    for (const symbol of grammar.terminal_symbols) {
        firsts[symbol] = new Set([symbol]);
    }

    for (const symbol of grammar.non_terminal_symbols) {
        firsts[symbol] = new Set();
    }

    let done = false;
    while (!done) {
        done = true
        for (const rule of grammar.rules) {
            for (const terminal of compute_first_rhs(rule.rhs, nullables, firsts)) {
                if (!firsts[rule.lhs].has(terminal)) {
                    firsts[rule.lhs].add(terminal);
                    done = false;
                }
            }
        }
    }

    return firsts
}

function compute_follows(grammar, nullables, firsts) {
    let follows = {}

    for (const symbol of grammar.non_terminal_symbols) {
        follows[symbol] = new Set();
    }

    let done = false;
    while (!done) {
        done = true;

        for (const rule of grammar.rules) {
            // invariant: rule_follow is the follow set for position i of rule.rhs
            let rule_follow = follows[rule.lhs];
            for (let i = rule.rhs.length - 1; i >= 0; i--) {
                if (grammar.non_terminal_symbols.has(rule.rhs[i])) {
                    rule_follow.forEach(function (terminal) {
                        if (!follows[rule.rhs[i]].has(terminal)) {
                            follows[rule.rhs[i]].add(terminal)
                            done = false
                        }
                    });
                }

                if (nullables.has(rule.rhs[i])) {
                    rule_follow = union(rule_follow, firsts[rule.rhs[i]]);
                } else {
                    rule_follow = firsts[rule.rhs[i]];
                }
            }
        }
    }

    return follows;
}

function build_table(grammar) {
    const nullables = compute_nullables(grammar)
    const firsts = compute_firsts(grammar, nullables)
    const follows = compute_follows(grammar, nullables, firsts)

    const table = {}
    for (let nts of grammar.non_terminal_symbols) {
        table[nts] = {}
        for (let ts of grammar.terminal_symbols) {
            table[nts][ts] = []
        }
    }

    for (const rule of grammar.rules) {
        for (const a of compute_first_rhs(rule.rhs, nullables, firsts)) {
            table[rule.lhs][a] = rule.rhs
        }

        if (rule.rhs.every(x => nullables.has(x))) {
            for (const a of follows[rule.lhs]) {
                table[rule.lhs][a] = []
            }
        }
    }

    return table
}

class NonTerminalSymbol {
    constructor(symbol, children) {
        this.symbol = symbol
        this.children = children
    }

    accept(visitor) {
        return visitor.visit_non_terminal_symbol(this)
    }
}

class TerminalSymbol {
    constructor(symbol, token) {
        this.symbol = symbol
        this.token = token
    }

    accept(visitor) {
        return visitor.visit_terminal_symbol(this)
    }
}

export class LLParser {
    constructor(grammar) {
        this.grammar = grammar
        this.table = build_table(grammar)
    }

    parse(tokens) {
        return this.parse_symbol(this.grammar.start, tokens)
    }

    parse_symbol(symbol, tokens) {
        const token = tokens[0]
        if (token.kind == symbol) {
            tokens.shift()

            return new TerminalSymbol(symbol, token)
        } else {
            let derivation = null;
            try {
                derivation = this.table[symbol][token.kind]
            } catch (error) {
                throw new Error(`Unexpected token "${token.text}" (${token.kind})`)
            }

            return new NonTerminalSymbol(
                symbol,
                derivation.map(s => this.parse_symbol(s, tokens))
            )
        }
    }
}