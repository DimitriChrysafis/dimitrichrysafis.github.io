struct VertexOutput {
    @builtin(position) position: vec4f, 
    @location(0) uv: vec2f, 
    @location(1) view_position: vec3f, 
    @location(2) speed: f32, 
}

struct FragmentInput {
    @location(0) uv: vec2f, 
    @location(1) view_position: vec3f, 
    @location(2) speed: f32, 
}

struct FragmentOutput {
    @location(0) frag_color: vec4f, 
}

struct RenderUniforms {
    texel_size: vec2f, 
    sphere_size: f32, 
    inv_projection_matrix: mat4x4f, 
    projection_matrix: mat4x4f, 
    view_matrix: mat4x4f, 
    inv_view_matrix: mat4x4f, 
    box_size: vec3f,
}

struct PosVel {
    position: vec3f, 
    v: vec3f, 
}

@group(0) @binding(0) var<storage> particles: array<PosVel>;
@group(0) @binding(1) var<uniform> uniforms: RenderUniforms;

@vertex
fn vs(    
    @builtin(vertex_index) vertex_index: u32, 
    @builtin(instance_index) instance_index: u32
) -> VertexOutput {
    // Create wireframe circle vertices (48 points for a denser, more solid circle)
    let num_segments = 48u;
    let segment_index = vertex_index % num_segments;
    let next_segment_index = (segment_index + 1u) % num_segments;
    
    // Create line pairs for the circle wireframe
    let line_vertex = vertex_index / num_segments; // 0 or 1 for each line segment
    
    let angle = f32(segment_index) * 2.0 * 3.14159 / f32(num_segments);
    let next_angle = f32(next_segment_index) * 2.0 * 3.14159 / f32(num_segments);
    
    var corner: vec2f;
    if (line_vertex == 0u) {
        corner = vec2f(cos(angle), sin(angle)) * uniforms.sphere_size;
    } else {
        corner = vec2f(cos(next_angle), sin(next_angle)) * uniforms.sphere_size;
    }
    
    let uv = corner / uniforms.sphere_size * 0.5 + 0.5;
    
    let real_position = particles[instance_index].position;
    let view_position = (uniforms.view_matrix * vec4f(real_position, 1.0)).xyz;
    
    let out_position = uniforms.projection_matrix * vec4f(view_position + vec3f(corner, 0.0), 1.0);
    
    let speed = sqrt(dot(particles[instance_index].v, particles[instance_index].v));
    
    return VertexOutput(out_position, uv, view_position, speed);
}

fn value_to_color(value: f32) -> vec3<f32> {
    // Ultra-creative cosmic nebula theme: deep space to stellar explosion
    let col0 = vec3f(0.05, 0.0, 0.15);    // Deep space void (slowest)
    let col1 = vec3f(0.4, 0.1, 0.6);      // Dark nebula purple
    let col2 = vec3f(0.8, 0.2, 0.9);      // Bright magenta plasma
    let col3 = vec3f(1.0, 0.4, 0.2);      // Hot stellar orange
    let col4 = vec3f(1.0, 0.9, 0.1);      // Solar flare yellow
    let col5 = vec3f(1.0, 0.0, 0.0);      // Bright red (fastest)
    
    // Add some dynamic color variation based on position for extra creativity
    let shimmer = sin(value * 20.0) * 0.1;
    
    var base_color: vec3f;
    
    if (0 <= value && value < 0.15) {
        let t = value / 0.15;
        base_color = mix(col0, col1, t);
    } else if (0.15 <= value && value < 0.35) {
        let t = (value - 0.15) / 0.2;
        base_color = mix(col1, col2, t);
    } else if (0.35 <= value && value < 0.55) {
        let t = (value - 0.35) / 0.2;
        base_color = mix(col2, col3, t);
    } else if (0.55 <= value && value < 0.8) {
        let t = (value - 0.55) / 0.25;
        base_color = mix(col3, col4, t);
    } else {
        let t = (value - 0.8) / 0.2;
        base_color = mix(col4, col5, t);
    }
    
    // Add subtle shimmer effect for ultra-fast particles
    if (value > 0.7) {
        let intensity = (value - 0.7) / 0.3;
        base_color += vec3f(shimmer * intensity, shimmer * intensity * 0.5, shimmer * intensity * 0.2);
    }
    
    return clamp(base_color, vec3f(0.0), vec3f(1.0));
}

@fragment
fn fs(input: FragmentInput) -> FragmentOutput {
    var out: FragmentOutput;
    
    // Use speed-based colors like the solid spheres
    var color: vec3f = value_to_color(input.speed / 1.5);
    out.frag_color = vec4f(color, 1.0);
    
    return out;
}
