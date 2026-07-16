struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
}

struct FragmentInput {
    @location(0) uv: vec2f,
}

struct BackgroundUniforms {
    texel_size: vec2f,
}

@group(0) @binding(0) var<uniform> uniforms: BackgroundUniforms;

const SUN_DIRECTION = vec3f(-0.3521804, 0.7043607, 0.6163156);

@vertex
fn vs(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    let positions = array<vec2f, 6>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f( 1.0,  1.0),
        vec2f(-1.0, -1.0),
        vec2f( 1.0,  1.0),
        vec2f(-1.0,  1.0),
    );
    let position = positions[vertex_index];
    return VertexOutput(vec4f(position, 0.9999, 1.0), position * 0.5 + 0.5);
}

fn environment(ray: vec3f) -> vec3f {
    let horizon = smoothstep(-0.45, 0.72, ray.y);
    let lower = vec3f(0.004, 0.008, 0.026);
    let upper = vec3f(0.035, 0.070, 0.150);
    let sky = mix(lower, upper, horizon);
    let sun = pow(max(dot(ray, SUN_DIRECTION), 0.0), 72.0);
    return sky + vec3f(0.28, 0.16, 0.64) * sun;
}

fn reflected_environment(position: vec3f, direction: vec3f) -> vec3f {
    if (direction.y < -0.001) {
        let floor_distance = (-1.10 - position.y) / direction.y;
        if (floor_distance > 0.0) {
            let floor_hit = position + direction * floor_distance;
            let grid = min(
                abs(fract(floor_hit.x * 0.34) - 0.5),
                abs(fract(floor_hit.z * 0.34) - 0.5)
            );
            let line = 1.0 - smoothstep(0.0, 0.034, grid);
            let floor = vec3f(0.010, 0.020, 0.052) + line * vec3f(0.11, 0.055, 0.26);
            return floor;
        }
    }
    return environment(direction);
}

fn ray_sphere(origin: vec3f, direction: vec3f, center: vec3f, radius: f32) -> f32 {
    let offset = origin - center;
    let b = dot(offset, direction);
    let c = dot(offset, offset) - radius * radius;
    let discriminant = b * b - c;
    if (discriminant < 0.0) {
        return -1.0;
    }
    return -b - sqrt(discriminant);
}

@fragment
fn fs(input: FragmentInput) -> @location(0) vec4f {
    let aspect = uniforms.texel_size.y / max(uniforms.texel_size.x, 0.00001);
    var screen = input.uv * 2.0 - 1.0;
    screen.x *= aspect;

    let ray_origin = vec3f(0.0, 0.06, 3.8);
    let ray_direction = normalize(vec3f(screen.x * 0.96, screen.y * 0.90, -1.75));
    var color = environment(ray_direction);

    let sphere_center = vec3f(0.58, 0.46, 0.0);
    let hit_distance = ray_sphere(ray_origin, ray_direction, sphere_center, 0.92);
    if (hit_distance > 0.0) {
        let hit_position = ray_origin + ray_direction * hit_distance;
        let normal = normalize(hit_position - sphere_center);
        let reflected_ray = reflect(ray_direction, normal);
        let reflection = reflected_environment(hit_position, reflected_ray);
        let fresnel_base = 1.0 - max(dot(-ray_direction, normal), 0.0);
        let fresnel = fresnel_base * fresnel_base * fresnel_base * fresnel_base;
        let glint = pow(max(dot(reflected_ray, SUN_DIRECTION), 0.0), 58.0);
        let orb = reflection * (0.58 + 0.34 * fresnel) + vec3f(0.16, 0.055, 0.38) * fresnel;
        color = orb + vec3f(0.68, 0.48, 1.0) * glint;
    }

    let vignette = dot(screen, screen);
    color *= 1.0 - 0.30 * smoothstep(0.35, 1.8, vignette);
    return vec4f(color, 1.0);
}
