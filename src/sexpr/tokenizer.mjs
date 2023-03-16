export class Token {
    constructor(kind, text) {
        this.kind = kind
        this.text = text
    }
}

export function* tokenize(stream, rules, eos_kind, skip_tokens) {
    while (stream.length) {
        // Search the next token
        // We do that by matching the remaing of the stream through all the 
        // declared regexes
        let token = null
        for (let kind in rules) {
            let regex = rules[kind]
            let result = stream.match(regex)
            if (result != null) {
                let text = result[0]
                token = new Token(kind, text)
                stream = stream.substring(text.length)
                break
            }
        }

        // No token found :'(
        if (token === null) {
            throw new Error("cannot parse " + stream)
        }

        // Don't emit the specified tokens
        if (skip_tokens.find(t => t == token.kind)) {
            continue
        }


        yield token
    }

    // End of stream
    yield new Token(eos_kind, null)
}