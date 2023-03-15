class Vector3 {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
}

class Camera {
    constructor(position, view_port) {
        this.position = position
        this.view_port = view_port
    }
}

class Material {
    constructor(color, specular) {
        this.color = color
        this.specular = specular
    }
}

class Sphere {
    constructor(position, radius, material) {
        this.position = position
        this.radius = radius
        this.material = material
    }
}

class Union {
    constructor(nodes) {
        this.nodes = nodes
    }
}

class AmbiantLight {
    constructor(intensity) {
        this.intensity = intensity
    }
}

class OmniDirectionalAmbiantLight {
    constructor(intensity, position) {
        this.intensity = intensity
        this.position = position
    }
}

class DirectionalAmbiantLight {
    constructor(intensity, direction) {
        this.intensity = intensity
        this.direction = direction
    }
}

class Scene {
    constructor(camera, root, lights) {
        this.camera = camera
        this.root = root
        this.lights = lights
    }

    static load(stream) {
        let scene_data = parse(stream)
        return scene_data
    }
}