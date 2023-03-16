import { load_scene } from "./scene.mjs";
import { generate_scene_shader } from "./shader.mjs"
import { WebGLRender } from "./webgl.mjs";


function main() {
    const canvas = document.getElementById("canvas")
    const scene_editor = document.getElementById("scene_editor")
    const scene_text = scene_editor.value

    // Load the scene
    let scene = load_scene(scene_text)
    console.log("scene:", scene)

    // Generate the shader
    let shader = generate_scene_shader(scene)
    console.log("shader:", shader)

    // Create the render
    let webgl_renderer = new WebGLRender(canvas)

    // Compile the scene shader and draw it
    webgl_renderer.set_scene_shader(shader)
    webgl_renderer.draw()
}

document.addEventListener("DOMContentLoaded", main)