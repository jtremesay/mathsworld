import { ll_parse } from "./sexpr/ll_parser.mjs";
import { tokenize } from "./sexpr/tokenizer.mjs";
import { SCENE_SHADER_SOURCE } from "./shader.mjs"
import { WebGLRender } from "./webgl.mjs";

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
// 0. S ::= SEXPR $
// 1. SEXPR ::= ( identifier ARGS )
// 2. ARGS ::= ARG ARGS
// 3. ARGS ::= ''
// 4. ARG ::= number
// 5. ARG ::= SEXPR
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

function main() {
    const scene_editor = document.getElementById("scene_editor")
    const scene_text = scene_editor.value

    // Tokenize the scene text
    let tokens = Array.from(tokenize(scene_text, TOKEN_REGEXES, TokenKind.EOS, [TokenKind.SPACE]))
    console.log("tokens:", tokens)

    // Build an LL AST
    let ll_ast_root = ll_parse(tokens, Symbol.S, PARSER_RULES, PARSER_TABLE)
    console.log("LL AST:", ll_ast_root)

    // TODO: build S-expr AST

    // TODO: build scene object?

    // TODO: generate the shader

    // Create the render
    let webgl_renderer = new WebGLRender(canvas)

    // Compile the scene shader and draw it
    webgl_renderer.set_scene_shader(SCENE_SHADER_SOURCE)
    webgl_renderer.draw()
}

document.addEventListener("DOMContentLoaded", main)