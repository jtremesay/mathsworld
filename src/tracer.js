"use strict";

const vsSource = `
attribute vec4 aVertexPosition;
void main() {
    gl_Position = aVertexPosition;
}
`;

const fsSource = `
precision highp float;
uniform vec2 uResolution;

const float INFINITY = 1e9;

struct Material {
    vec3 color;
    float specular;
};

struct Sphere {
    vec3 position;
    float radius;
    Material material;
};

struct Hit {
    vec3 position;
    vec3 normal;
    float distance;
    Material material;
};

Hit sdf_union(Hit a, Hit b) {
    if (a.distance <= b.distance) {
        return a;
    } else {
        return b;
    };
}

const Hit NO_HIT = Hit(
    vec3(INFINITY, INFINITY, INFINITY),
    vec3(0.0, 0.0, 0.0),
    INFINITY,
    Material(
        vec3(1.0, 1.0, 1.0),
        0.0
    )
);

Hit sdf_sphere(vec3 camera, vec3 ray, vec3 position, float radius, Material material) {
    vec3 co = camera - position;
    float a = dot(ray, ray);
    float b = dot(co, ray) * 2.0;
    float c = dot(co, co) - radius * radius;
    float delta = b * b - 4.0 * a * c;
    if (delta < 0.0) {
        return NO_HIT;
    }

    float d1 = (-b + sqrt(delta)) / (a + a);
    float d2 = (-b - sqrt(delta)) / (a + a);
    float d = min(d1, d2);
    if (d < 0.0) {
        return NO_HIT;
    }

    vec3 hit_position = camera + ray * d;
    vec3 normal = normalize(hit_position - position);    
    
    return Hit(
        hit_position,
        normal,
        d,
        material
    );
}

float directional_light(float intensity, vec3 direction, vec3 normal, float specular, vec3 inverse_direction) {
    // Diffuse
    float n_dot_l = dot(normal, direction);
    float i = 0.0;
    if (n_dot_l > 0.0) {
        i += intensity * n_dot_l / (length(normal) * length(direction));
    }

    // Specular
    if (specular > -1.0) {
        vec3 r = normal * n_dot_l * 2.0 - direction;
        float r_dot_v = dot(r, inverse_direction);
        if (r_dot_v > 0.0) {
            i += intensity * pow((r_dot_v / (length(r) * length(inverse_direction))), specular);
        }
    }

    return i;
}

float compute_lights(vec3 position, vec3 normal, float specular, vec3 inverse_direction) {
    float intensity = 0.0;

    // AMBIANT LIGHTS BEGIN
    intensity += 0.2;
    // AMBIANT LIGHTS END

    // OMNIDIRECTIONAL LIGHTS BEGIN
    intensity += directional_light(
        0.6, 
        vec3(2.0, 1.0, 0.0) - position, 
        normal, 
        specular, 
        inverse_direction
    );
    // OMNIDIRECTIONAL LIGHTS END

    // DIRECTIONAL LIGHTS BEGIN
    intensity += directional_light(
        0.2, 
        vec3(1.0, 4.0, 4.0), 
        normal, 
        specular, 
        inverse_direction);
    // DIRECTIONAL LIGHTS END

    return intensity;
}

Hit scene(vec3 camera, vec3 direction) {
    return sdf_union(
        sdf_union(
            sdf_sphere(
                camera,
                direction,
                vec3(0.0, -5001.0, 0.0),
                5000.0,
                Material(
                    vec3(1.0, 1.0, 0.0),
                    1000.0
                )
            ),
            sdf_sphere(
                camera,
                direction,
                vec3(0.0, -1.0, 3.0),
                1.0,
                Material(
                    vec3(1.0, 0.0, 0.0),
                    500.0
                )
            )
        ),
        sdf_union(
            sdf_sphere(
                camera,
                direction,
                vec3(2.0, 0.0, 4.0),
                1.0,
                Material(
                    vec3(0.0, 0.0, 1.0),
                    500.0
                )
            ),
            sdf_sphere(
                camera,
                direction,
                vec3(-2.0, 0.0, 4.0),
                1.0,
                Material(
                    vec3(0.0, 1.0, 0.0),
                    10.0
                )
            )
        )
    );
}

void main() {
    // Relative position on the screen
    // (0, 0) = bottom left
    // (1, 1) = top right
    // (1, 0) = bottom right
    vec2 uv = gl_FragCoord.xy / uResolution;

    // View port
    vec3 view_port = vec3(1.0, 1.0, 1.0);

    // Camera
    vec3 camera = vec3(0.0, 0.0, 0.0);

    // The direction of the ray for the current pixel
    vec3 direction = vec3(
        uv.x - 0.5,
        uv.y - 0.5,
        1.0
    ) * view_port;

    Hit hit = scene(camera, direction);
    if (hit.distance < INFINITY) {
        gl_FragColor = vec4(
            hit.material.color * compute_lights(
                hit.position, 
                hit.normal, 
                hit.material.specular, 
                -direction
            ), 
            1.0
        );
    } else {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
}
`;

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
        );
        gl.deleteShader(shader);

        return null;
    }

    return shader;
}

function drawScene(gl, canvas_width, canvas_height, programInfo, positionBuffer) {
    gl.clearColor(1.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.useProgram(programInfo.program);
    gl.uniform2f(programInfo.uniformLocations.resolution, canvas_width, canvas_width, 1.0);


    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function main() {
    const canvas = document.getElementById("canvas")
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        alert(
            "Unable to initialize WebGL. Your browser or machine may not support it."
        );
        return;
    }

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram
            )}`
        );

        return;
    }

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        },
        uniformLocations: {
            resolution: gl.getUniformLocation(shaderProgram, "uResolution"),
        },
    };

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    drawScene(gl, canvas.width, canvas.clientHeight, programInfo, positionBuffer);
}


document.addEventListener("DOMContentLoaded", main)