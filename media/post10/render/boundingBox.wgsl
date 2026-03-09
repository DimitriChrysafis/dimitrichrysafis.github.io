struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) line_coord: vec2f,
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

@group(0) @binding(0) var<uniform> uniforms: RenderUniforms;

@vertex
fn vs(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    if (vertex_index < 6u) {
        var moving_wall_vertices = array<vec3f, 6>(
            vec3f(0.0, 0.0, 1.0), vec3f(0.0, 0.0625, 1.0), vec3f(1.0, 0.0, 1.0),
            vec3f(1.0, 0.0, 1.0), vec3f(0.0, 0.0625, 1.0), vec3f(1.0, 0.0625, 1.0)
        );

        let vertex_pos = moving_wall_vertices[vertex_index];
        let scaled_pos = vertex_pos * uniforms.box_size;
        let view_pos = uniforms.view_matrix * vec4f(scaled_pos, 1.0);
        let clip_pos = uniforms.projection_matrix * view_pos;

        return VertexOutput(clip_pos, vec2f(0.0, 0.0));
    }

    let wireframe_vertex_index = vertex_index - 6u;

    let line_thickness = 8.0;

    var box_edge_starts = array<vec3f, 8>(
        vec3f(0.0, 0.0, 0.0), vec3f(1.0, 0.0, 0.0), vec3f(1.0, 1.0, 0.0), vec3f(0.0, 1.0, 0.0),
        vec3f(0.0, 0.0, 0.0), vec3f(1.0, 0.0, 0.0), vec3f(1.0, 1.0, 0.0), vec3f(0.0, 1.0, 0.0)
    );

    var box_edge_ends = array<vec3f, 8>(
        vec3f(1.0, 0.0, 0.0), vec3f(1.0, 1.0, 0.0), vec3f(0.0, 1.0, 0.0), vec3f(0.0, 0.0, 0.0),
        vec3f(0.0, 0.0, 1.0), vec3f(1.0, 0.0, 1.0), vec3f(1.0, 1.0, 1.0), vec3f(0.0, 1.0, 1.0)
    );

    let edge_index = wireframe_vertex_index / 6u;
    let quad_vertex = wireframe_vertex_index % 6u;

    let start_pos = box_edge_starts[edge_index] * uniforms.box_size;
    let end_pos = box_edge_ends[edge_index] * uniforms.box_size;

    let start_view = (uniforms.view_matrix * vec4f(start_pos, 1.0)).xyz;
    let end_view = (uniforms.view_matrix * vec4f(end_pos, 1.0)).xyz;

    let line_dir = normalize(end_view - start_view);
    let line_right = normalize(cross(line_dir, vec3f(0.0, 0.0, 1.0)));
    let line_up = cross(line_right, line_dir);

    let thickness_view = line_thickness * 0.001;

    var quad_positions = array<vec3f, 6>(
        start_view - line_right * thickness_view,
        start_view + line_right * thickness_view,
        end_view - line_right * thickness_view,
        end_view - line_right * thickness_view,
        start_view + line_right * thickness_view,
        end_view + line_right * thickness_view
    );

    let final_view_pos = quad_positions[quad_vertex];
    let clip_pos = uniforms.projection_matrix * vec4f(final_view_pos, 1.0);

    var line_coords = array<vec2f, 6>(
        vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),
        vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0)
    );

    return VertexOutput(clip_pos, line_coords[quad_vertex]);
}

@fragment
fn fs(input: VertexOutput) -> @location(0) vec4f {
    if (input.line_coord.x == 0.0 && input.line_coord.y == 0.0) {
        return vec4f(0.0, 0.4, 1.0, 0.5);
    }
    return vec4f(0.0, 0.0, 0.0, 1.0);
}
