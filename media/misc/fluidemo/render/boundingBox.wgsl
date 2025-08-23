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
    // First 6 vertices are for the solid moving wall (Z=1 face)
    if (vertex_index < 6u) {
        // Solid moving wall vertices (Z=1 face, bottom 6.25% only - Y from 0.0 to 0.0625 - hiding 75% of current wall)
        var moving_wall_vertices = array<vec3f, 6>(
            vec3f(0.0, 0.0, 1.0), vec3f(0.0, 0.0625, 1.0), vec3f(1.0, 0.0, 1.0), // Triangle 1 (counter-clockwise)
            vec3f(1.0, 0.0, 1.0), vec3f(0.0, 0.0625, 1.0), vec3f(1.0, 0.0625, 1.0)  // Triangle 2 (counter-clockwise)
        );
        
        let vertex_pos = moving_wall_vertices[vertex_index];
        let scaled_pos = vertex_pos * uniforms.box_size;
        let view_pos = uniforms.view_matrix * vec4f(scaled_pos, 1.0);
        let clip_pos = uniforms.projection_matrix * view_pos;
        
        return VertexOutput(clip_pos, vec2f(0.0, 0.0));
    }
    
    // Remaining vertices are for thick wireframe edges (excluding back wall edges)
    let wireframe_vertex_index = vertex_index - 6u;
    
    // Line thickness in pixels (make it much thicker)
    let line_thickness = 8.0;
    
    // Define the remaining edges (excluding the 4 edges of the moving wall Z=1)
    var box_edge_starts = array<vec3f, 8>(
        // Back wall (Z=0) edges - keep these
        vec3f(0.0, 0.0, 0.0), vec3f(1.0, 0.0, 0.0), vec3f(1.0, 1.0, 0.0), vec3f(0.0, 1.0, 0.0),
        // Vertical edges connecting Z=0 to Z=1 - keep these
        vec3f(0.0, 0.0, 0.0), vec3f(1.0, 0.0, 0.0), vec3f(1.0, 1.0, 0.0), vec3f(0.0, 1.0, 0.0)
    );
    
    var box_edge_ends = array<vec3f, 8>(
        // Back wall (Z=0) edges - keep these
        vec3f(1.0, 0.0, 0.0), vec3f(1.0, 1.0, 0.0), vec3f(0.0, 1.0, 0.0), vec3f(0.0, 0.0, 0.0),
        // Vertical edges connecting Z=0 to Z=1 - keep these
        vec3f(0.0, 0.0, 1.0), vec3f(1.0, 0.0, 1.0), vec3f(1.0, 1.0, 1.0), vec3f(0.0, 1.0, 1.0)
    );
    
    // Each edge is rendered as a quad (6 vertices: 2 triangles)
    let edge_index = wireframe_vertex_index / 6u;
    let quad_vertex = wireframe_vertex_index % 6u;
    
    // Get the edge start and end positions
    let start_pos = box_edge_starts[edge_index] * uniforms.box_size;
    let end_pos = box_edge_ends[edge_index] * uniforms.box_size;
    
    // Transform to view space
    let start_view = (uniforms.view_matrix * vec4f(start_pos, 1.0)).xyz;
    let end_view = (uniforms.view_matrix * vec4f(end_pos, 1.0)).xyz;
    
    // Calculate line direction and perpendicular vectors in view space
    let line_dir = normalize(end_view - start_view);
    let line_right = normalize(cross(line_dir, vec3f(0.0, 0.0, 1.0)));
    let line_up = cross(line_right, line_dir);
    
    // Convert thickness from pixels to view space
    let thickness_view = line_thickness * 0.001; // Adjust this multiplier for desired thickness
    
    // Create quad vertices for thick line
    var quad_positions = array<vec3f, 6>(
        start_view - line_right * thickness_view, // Bottom left
        start_view + line_right * thickness_view, // Bottom right  
        end_view - line_right * thickness_view,   // Top left
        end_view - line_right * thickness_view,   // Top left (repeated for second triangle)
        start_view + line_right * thickness_view, // Bottom right (repeated)
        end_view + line_right * thickness_view    // Top right
    );
    
    let final_view_pos = quad_positions[quad_vertex];
    let clip_pos = uniforms.projection_matrix * vec4f(final_view_pos, 1.0);
    
    // Line coordinates for fragment shader
    var line_coords = array<vec2f, 6>(
        vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),
        vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0)
    );
    
    return VertexOutput(clip_pos, line_coords[quad_vertex]);
}

@fragment  
fn fs(input: VertexOutput) -> @location(0) vec4f {
    // Check if this is the moving wall (line_coord will be 0,0 for wall vertices)
    if (input.line_coord.x == 0.0 && input.line_coord.y == 0.0) {
        // Solid blue color for the moving wall
        return vec4f(0.0, 0.4, 1.0, 0.5); // Solid blue with 50% transparency
    } else {
        // Dark black wireframe color
        return vec4f(0.0, 0.0, 0.0, 1.0);
    }
}
