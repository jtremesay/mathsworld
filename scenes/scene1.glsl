
precision highp float;
uniform vec2 iResolution;

const float INFINITY = 1e9;

struct Material {
    vec3 color;
    float specular;
};

struct Hit {
    vec3 position;
    vec3 normal;
    float distance;
    Material material;
};

const Hit NO_HIT = Hit(
    vec3(INFINITY, INFINITY, INFINITY),
    vec3(0.0, 0.0, 0.0),
    INFINITY,
    Material(
        vec3(1.0, 1.0, 1.0),
        0.0
    )
);

Hit sdf_union(Hit a, Hit b) {
    if (a.distance <= b.distance) {
        return a;
    } else {
        return b;
    };
}

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

Hit scene(vec3 camera, vec3 direction) {
    return sdf_union(
            sdf_sphere(
            camera,
            direction,
            vec3(0.00000000, -5001.00000000, 0.00000000),
            5000.00000000,
            Material(vec3(1.00000000, 1.00000000, 0.00000000), 1000.00000000)
        ), 
            sdf_union(
            sdf_sphere(
            camera,
            direction,
            vec3(0.00000000, -1.00000000, 3.00000000),
            1.00000000,
            Material(vec3(1.00000000, 0.00000000, 0.00000000), 500.00000000)
        ), 
            sdf_union(
            sdf_sphere(
            camera,
            direction,
            vec3(2.00000000, 0.00000000, 4.00000000),
            1.00000000,
            Material(vec3(0.00000000, 0.00000000, 1.00000000), 500.00000000)
        ), 
            sdf_sphere(
            camera,
            direction,
            vec3(-2.00000000, 0.00000000, 4.00000000),
            1.00000000,
            Material(vec3(0.00000000, 1.00000000, 0.00000000), 10.00000000)
        )
        )
        )
        );
    
}

float directional_light(float intensity, vec3 direction, vec3 position, vec3 normal, float specular, vec3 inverse_direction) {
    if (scene(position, direction).distance < INFINITY) {
        return 0.0;
    }

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
    intensity += 0.20000000;
intensity += directional_light(
        0.60000000, 
        vec3(2.00000000, 1.00000000, 0.00000000) - position, 
        position,
        normal, 
        specular, 
        inverse_direction
    );
intensity += directional_light(
        0.20000000, 
        vec3(1.00000000, 4.00000000, 4.00000000) - position, 
        position,
        normal, 
        specular, 
        inverse_direction
    );


    return intensity;
}

void main() {
    // Relative position on the screen
    // (0, 0) = bottom left
    // (1, 1) = top right
    // (1, 0) = bottom right
    vec2 uv = gl_FragCoord.xy / iResolution;

    // View port
    vec3 view_port = vec3(1.00000000, 1.00000000, 1.00000000);

    // Camera
    vec3 camera = vec3(0.00000000, 0.00000000, 0.00000000);

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
    