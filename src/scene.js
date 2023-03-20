import { parse_sexpr } from "./sexpr.js"

export class Vector3 {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    accept(visitor) {
        return visitor.visit(this)
    }
}

export class Camera {
    constructor(position, view_port) {
        this.position = position
        this.view_port = view_port
    }

    accept(visitor) {
        return visitor.visit(this)
    }
}

export class Material {
    constructor(color, specular) {
        this.color = color
        this.specular = specular
    }

    accept(visitor) {
        return visitor.visit(this)
    }
}

export class Sphere {
    constructor(position, radius, material) {
        this.position = position
        this.radius = radius
        this.material = material
    }

    accept(visitor) {
        return visitor.visit(this)
    }
}

export class Union {
    constructor(nodes) {
        this.nodes = nodes
    }

    accept(visitor) {
        return visitor.visit(this)
    }
}

export class AmbiantLight {
    constructor(intensity) {
        this.intensity = intensity
    }

    accept(visitor) {
        return visitor.visit(this)
    }
}

export class OmniDirectionalLight {
    constructor(intensity, position) {
        this.intensity = intensity

        this.position = position
    }

    accept(visitor) {
        return visitor.visit(this)
    }
}

export class DirectionalLight {
    constructor(intensity, direction) {
        this.intensity = intensity
        this.direction = direction
    }

    accept(visitor) {
        return visitor.visit(this)
    }
}

export class Scene {
    constructor(camera, root, lights) {
        this.camera = camera
        this.root = root
        this.lights = lights
    }

    accept(visitor) {
        return visitor.visit(this)
    }
}

class SceneDeserializerVisitor {
    visit_list(node) {
        return Array.from(node.args.map(c => c.accept(this)))
    }

    visit_vector3(node) {
        return new Vector3(
            node.args[0],
            node.args[1],
            node.args[2],
        )
    }

    visit_color(node) {
        return this.visit_vector3(node)
    }

    visit_camera(node) {
        return new Camera(
            node.args[0].accept(this),
            node.args[1].accept(this),
        )
    }

    visit_union(node) {
        return new Union(node.args[0].accept(this))
    }

    visit_material(node) {
        return new Material(
            node.args[0].accept(this),
            node.args[1],
        )
    }

    visit_sphere(node) {
        return new Sphere(
            node.args[0].accept(this),
            node.args[1],
            node.args[2].accept(this),
        )
    }

    visit_ambiant_light(node) {
        return new AmbiantLight(
            node.args[0],
        )
    }

    visit_omni_directional_light(node) {
        return new OmniDirectionalLight(
            node.args[0],
            node.args[1].accept(this),
        )
    }

    visit_directional_light(node) {
        return new OmniDirectionalLight(
            node.args[0],
            node.args[1].accept(this),
        )
    }

    visit_scene(node) {
        return new Scene(
            node.args[0].accept(this),
            node.args[1].accept(this),
            node.args[2].accept(this),
        )
    }

    visit(node) {
        let method = this[`visit_${node.identifier}`]
        if (method === undefined) {
            throw new Error(`Unimplemented method for ${node.identifier}`)
        }

        return method.bind(this)(node)
    }
}


export function load_scene(scene_text) {
    const scene_sexpr = parse_sexpr(scene_text)

    let scene_visitor = new SceneDeserializerVisitor()

    return scene_sexpr.accept(scene_visitor)
}

