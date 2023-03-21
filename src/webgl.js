function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader)
        gl.deleteShader(shader)
        throw new Error(
            `An error occurred compiling the shaders: ${error}`
        )
    }

    return shader
}

export class WebGLRender {
    static VS_SOURCE = `
attribute vec4 aVertexPosition;
void main() {
    gl_Position = aVertexPosition;
}
    `


    constructor(canvas) {
        this.canvas = canvas
        this.gl = canvas.getContext("webgl");
        if (this.gl === null) {
            throw new Error(
                "Unable to initialize WebGL. Your browser or machine may not support it."
            )
        }
        this.program_info = {
            program: null,
            v_shader: loadShader(this.gl, this.gl.VERTEX_SHADER, WebGLRender.VS_SOURCE),
            f_shader: null
        }

        this.position_buffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.position_buffer)
        const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)
    }

    set_scene_shader(source) {
        // Delete previous program
        this.gl.deleteProgram(this.program_info.program)

        // Create the fragment shader
        this.gl.deleteShader(this.program_info.f_shader)
        this.program_info.f_shader = loadShader(this.gl, this.gl.FRAGMENT_SHADER, source)

        // Compile the shader
        this.program_info.program = this.gl.createProgram()
        this.gl.attachShader(this.program_info.program, this.program_info.v_shader)
        this.gl.attachShader(this.program_info.program, this.program_info.f_shader)
        this.gl.linkProgram(this.program_info.program)

        if (!this.gl.getProgramParameter(this.program_info.program, this.gl.LINK_STATUS)) {
            throw new Error(
                `Unable to initialize the shader program: ${this.gl.getProgramInfoLog(
                    this.program_info.program
                )}`
            )
        }

        this.program_info.attrib_locations = {
            vertex_position: this.gl.getAttribLocation(this.program_info.program, "aVertexPosition"),
        }
        this.program_info.uniform_locations = {
            resolution: this.gl.getUniformLocation(this.program_info.program, "iResolution"),
        }
    }

    draw() {
        this.gl.clearColor(1.0, 0.0, 1.0, 1.0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)

        if (this.program_info.program) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.position_buffer)
            this.gl.vertexAttribPointer(
                this.program_info.attrib_locations.vertex_position,
                2,
                this.gl.FLOAT,
                false,
                0,
                0
            )
            this.gl.enableVertexAttribArray(this.program_info.attrib_locations.vertex_position)
            this.gl.useProgram(this.program_info.program)
            this.gl.uniform2f(this.program_info.uniform_locations.resolution, this.canvas.width, this.canvas.width, 1.0)

            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
        }
    }
}