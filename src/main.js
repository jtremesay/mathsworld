import { load_scene } from "./scene.js"
import { generate_scene_shader } from "./shader.js"
import { WebGLRender } from "./webgl.js"


function main() {
    const canvas = document.getElementById("canvas")
    const scene_editor = document.getElementById("scene_editor")
    const shader_editor = document.getElementById("shader_editor")

    // Create the render
    const webgl_renderer = new WebGLRender(canvas)

    function rebuild_shader() {
        // Load the scene
        const scene_text = scene_editor.value
        const scene = load_scene(scene_text)
        console.log("scene:", scene)

        // Generate the shader
        const shader = generate_scene_shader(scene)
        shader_editor.value = shader

        // Compile the scene shader and draw it
        webgl_renderer.set_scene_shader(shader)
        webgl_renderer.draw()
    }

    scene_editor.addEventListener("input", rebuild_shader)
    rebuild_shader()
}

document.addEventListener("DOMContentLoaded", main)