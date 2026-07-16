struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
    @location(1) speed: f32,
}

struct FragmentInput {
    @location(0) uv: vec2f,
    @location(1) speed: f32,
}

struct FragmentOutput {
    @location(0) frag_color: vec4f,
}

const LIGHT1_DIR = vec3f(0.5773503, 0.5773503, 0.5773503);
const LIGHT2_DIR = vec3f(-0.4082483, 0.8164966, -0.4082483);
const LIGHT3_DIR = vec3f(0.0, -0.8944272, 0.4472136);

struct RenderUniforms {
    texel_size: vec2f,
    sphere_size: f32,
    inv_projection_matrix: mat4x4f,
    projection_matrix: mat4x4f,
    view_matrix: mat4x4f,
    inv_view_matrix: mat4x4f,
    box_size: vec3f,
    render_z_offset: f32,
    box_anchor_z: f32,
    render_stride: u32,
}

struct Particle {
    position: vec3f,
    v: vec3f,
    C: mat3x3f,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: RenderUniforms;

@vertex
fn vs(
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32
) -> VertexOutput {
    var corner_positions = array(
        vec2( 0.5,  0.5),
        vec2( 0.5, -0.5),
        vec2(-0.5, -0.5),
        vec2( 0.5,  0.5),
        vec2(-0.5, -0.5),
        vec2(-0.5,  0.5),
    );

    let corner = vec3(corner_positions[vertex_index] * uniforms.sphere_size, 0.0);
    let uv = corner_positions[vertex_index] + 0.5;

    let particle_index = instance_index * uniforms.render_stride;
    let particle = particles[particle_index];
    let real_position = particle.position + vec3f(0.0, 0.0, uniforms.render_z_offset);
    let view_position = (uniforms.view_matrix * vec4f(real_position, 1.0)).xyz;

    let out_position = uniforms.projection_matrix * vec4f(view_position + corner, 1.0);

    let speed = sqrt(dot(particle.v, particle.v));

    return VertexOutput(out_position, uv, speed);
}

fn value_to_color(value: f32) -> vec3f {
    let col0 = vec3f(0.05, 0.0, 0.15);
    let col1 = vec3f(0.4, 0.1, 0.6);
    let col2 = vec3f(0.8, 0.2, 0.9);
    let col3 = vec3f(1.0, 0.4, 0.2);
    let col4 = vec3f(1.0, 0.9, 0.1);
    let col5 = vec3f(1.0, 0.0, 0.0);
    var base_color: vec3f;

    if (value < 0.15) {
        base_color = mix(col0, col1, value / 0.15);
    } else if (value < 0.35) {
        base_color = mix(col1, col2, (value - 0.15) / 0.2);
    } else if (value < 0.55) {
        base_color = mix(col2, col3, (value - 0.35) / 0.2);
    } else if (value < 0.8) {
        base_color = mix(col3, col4, (value - 0.55) / 0.25);
    } else {
        base_color = mix(col4, col5, (value - 0.8) / 0.2);
    }

    return base_color;
}

@fragment
fn fs(input: FragmentInput) -> FragmentOutput {
    var out: FragmentOutput;

    let normalxy = input.uv * 2.0 - 1.0;
    let r2 = dot(normalxy, normalxy);
    if (r2 > 1.0) {
        discard;
    }
    let normalz = sqrt(1.0 - r2);
    let normal = vec3f(normalxy, normalz);

    let diffuse1 = max(0.0, dot(normal, LIGHT1_DIR)) * 0.8;
    let diffuse2 = max(0.0, dot(normal, LIGHT2_DIR)) * 0.4;
    let diffuse3 = max(0.0, dot(normal, LIGHT3_DIR)) * 0.3;
    let total_lighting = 0.4 + diffuse1 + diffuse2 + diffuse3;
    let color = value_to_color(input.speed / 1.5);
    let rim_base = 1.0 - abs(normalz);
    let rim_factor = rim_base * rim_base;
    let speed_factor = min(input.speed / 2.0, 1.0);
    let rim_lighting = rim_factor * speed_factor * 0.3;

    out.frag_color = vec4(color * total_lighting + vec3f(rim_lighting), 1.0);
    return out;
}
