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
    @builtin(frag_depth) frag_depth: f32, 
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

    let real_position = particles[instance_index].position;
    let view_position = (uniforms.view_matrix * vec4f(real_position, 1.0)).xyz;

    let out_position = uniforms.projection_matrix * vec4f(view_position + corner, 1.0);

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

    var normalxy: vec2f = input.uv * 2.0 - 1.0;
    var r2: f32 = dot(normalxy, normalxy);
    if (r2 > 1.0) {
        discard;
    }
    var normalz = sqrt(1.0 - r2);
    var normal = vec3(normalxy, normalz);

    var radius = uniforms.sphere_size / 2;
    var real_view_pos: vec4f = vec4f(input.view_position + normal * radius, 1.0);
    var clip_space_pos: vec4f = uniforms.projection_matrix * real_view_pos;
    out.frag_depth = clip_space_pos.z / clip_space_pos.w;

    // Multiple light sources for better lighting
    let light1_dir = normalize(vec3(1.0, 1.0, 1.0));     // Main light from top-right
    let light2_dir = normalize(vec3(-0.5, 1.0, -0.5));   // Secondary light from left
    let light3_dir = normalize(vec3(0.0, -1.0, 0.5));    // Fill light from below
    
    // Calculate diffuse lighting from multiple sources
    let diffuse1 = max(0.0, dot(normal, light1_dir)) * 0.8;
    let diffuse2 = max(0.0, dot(normal, light2_dir)) * 0.4;
    let diffuse3 = max(0.0, dot(normal, light3_dir)) * 0.3;
    
    // Add ambient lighting
    let ambient = 0.4;
    
    // Combine all lighting
    let total_lighting = ambient + diffuse1 + diffuse2 + diffuse3;
    
    var color: vec3f = value_to_color(input.speed / 1.5);
    
    // Apply enhanced lighting with some rim lighting for fast particles
    let rim_factor = pow(1.0 - abs(normalz), 2.0);
    let speed_factor = min(input.speed / 2.0, 1.0);
    let rim_lighting = rim_factor * speed_factor * 0.3;
    
    out.frag_color = vec4(color * total_lighting + vec3(rim_lighting), 1.0);
    return out;
}
