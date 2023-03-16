import { load_scene } from "./scene.mjs";
import { SCENE_SHADER_SOURCE } from "./shader.mjs"
import { WebGLRender } from "./webgl.mjs";


function main() {
    const scene_editor = document.getElementById("scene_editor")
    const scene_text = scene_editor.value

    // Load the scene
    let scene = load_scene(scene_text)
    console.log("scene:", scene)

    // TODO: generate the shader

    // Create the render
    let webgl_renderer = new WebGLRender(canvas)

    // Compile the scene shader and draw it
    webgl_renderer.set_scene_shader(SCENE_SHADER_SOURCE)
    webgl_renderer.draw()
}

document.addEventListener("DOMContentLoaded", main)