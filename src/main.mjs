import { load_scene } from "./scene.mjs";
import { generate_scene_shader } from "./shader.mjs"
import { WebGLRender } from "./webgl.mjs";


function main() {
    const canvas = document.getElementById("canvas")
    const scene_editor = document.getElementById("scene_editor")

    // Create the render
    let webgl_renderer = new WebGLRender(canvas)

    function rebuild_shader() {
        // Load the scene
        const scene_text = scene_editor.value
        let scene = load_scene(scene_text)
        console.log("scene:", scene)

        // Generate the shader
        let shader = generate_scene_shader(scene)
        console.log("shader:", shader)

        // Compile the scene shader and draw it
        webgl_renderer.set_scene_shader(shader)
        webgl_renderer.draw()
    }

    scene_editor.addEventListener("input", rebuild_shader)
    rebuild_shader()
}

document.addEventListener("DOMContentLoaded", main)