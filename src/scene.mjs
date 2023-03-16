import { parse_sexpr } from "./sexpr.mjs";

class Vector3 {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    static from_sexpr(sexpr) {
        return new Vector3(
            sexpr.args[0],
            sexpr.args[1],
            sexpr.args[2],
        )
    }
}

class Camera {
    constructor(position, view_port) {
        this.position = position
        this.view_port = view_port
    }

    static from_sexpr(sexpr) {
        return new Camera(
            Vector3.from_sexpr(sexpr.args[0]),
            Vector3.from_sexpr(sexpr.args[1]),
        )
    }
}

class Material {
    constructor(color, specular) {
        this.color = color
        this.specular = specular
    }

    static from_sexpr(sexpr) {
        return new Material(
            Vector3.from_sexpr(sexpr.args[0]),
            sexpr.args[1]
        )
    }
}

class Sphere {
    constructor(position, radius, material) {
        this.position = position
        this.radius = radius
        this.material = material
    }

    static from_sexpr(sexpr) {
        return new Sphere(
            Vector3.from_sexpr(sexpr.args[0]),
            sexpr.args[1],
            Material.from_sexpr(sexpr.args[2])
        )
    }
}

class Union {
    constructor(nodes) {
        this.nodes = nodes
    }

    static from_sexpr(sexpr) {
        return new Union(sexpr.args[0].args.map(node_from_sexpr))
    }
}

function node_from_sexpr(sexpr) {
    if (sexpr.identifier == "union") {
        return Union.from_sexpr(sexpr)
    } else {
        return Sphere.from_sexpr(sexpr)
    }
}

class AmbiantLight {
    constructor(intensity) {
        this.intensity = intensity
    }

    static from_sexpr(sexpr) {
        return new AmbiantLight(
            sexpr.args[0],
        )
    }
}

class OmniDirectionalLight {
    constructor(intensity, position) {
        this.intensity = intensity

        this.position = position
    }
    static from_sexpr(sexpr) {
        return new OmniDirectionalLight(
            sexpr.args[0],
            Vector3.from_sexpr(sexpr.args[1]),
        )
    }
}

class DirectionalLight {
    constructor(intensity, direction) {
        this.intensity = intensity
        this.direction = direction
    }

    static from_sexpr(sexpr) {
        return new DirectionalLight(
            sexpr.args[0],
            Vector3.from_sexpr(sexpr.args[1]),
        )
    }
}

function light_from_sexpr(sexpr) {
    if (sexpr.identifier == "ambiant_light") {
        return AmbiantLight.from_sexpr(sexpr)
    } else if (sexpr.identifier == "omni_directional_light") {
        return OmniDirectionalLight.from_sexpr(sexpr)
    } else {
        return DirectionalLight.from_sexpr(sexpr)
    }
}

function lights_from_sexpr(sexpr) {
    return sexpr.args.map(light_from_sexpr)
}

class Scene {
    constructor(camera, root, lights) {
        this.camera = camera
        this.root = root
        this.lights = lights
    }

    static from_sexpr(sexpr) {
        return new Scene(
            Camera.from_sexpr(sexpr.args[0]),
            node_from_sexpr(sexpr.args[1]),
            lights_from_sexpr(sexpr.args[2])
        )
    }
}

export function load_scene(scene_text) {
    let scene_sexpr = parse_sexpr(scene_text)
    return Scene.from_sexpr(scene_sexpr)
}