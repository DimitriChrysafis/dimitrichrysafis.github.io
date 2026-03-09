struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) world_position: vec3f,
    @location(1) world_normal: vec3f,
    @location(2) part_kind: f32,
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

struct Piece {
    min_corner: vec3f,
    max_corner: vec3f,
    kind: f32,
}

@group(0) @binding(0) var<uniform> uniforms: RenderUniforms;

const KIND_WALL = 0.0;
const KIND_FRAME = 1.0;
const KIND_HEADER = 2.0;
const KIND_PLATE = 3.0;
const KIND_COLLAR = 4.0;
const KIND_BODY = 5.0;
const KIND_ROD = 6.0;
const KIND_PAD = 7.0;
const KIND_BRACE = 8.0;

const WALL_THICKNESS = 4.0;
const FRAME_COUNT = 4u;
const ACTUATOR_COUNT = 2u;
const PIECES_PER_ACTUATOR = 13u;
const TOTAL_PIECES = 1u + FRAME_COUNT + ACTUATOR_COUNT * PIECES_PER_ACTUATOR;

fn wall_height() -> f32 {
    return uniforms.box_size.y * 0.48;
}

fn quad_corner(index: u32) -> vec2f {
    var corners = array<vec2f, 6>(
        vec2f(0.0, 0.0),
        vec2f(1.0, 0.0),
        vec2f(1.0, 1.0),
        vec2f(0.0, 0.0),
        vec2f(1.0, 1.0),
        vec2f(0.0, 1.0),
    );
    return corners[index];
}

fn actuator_center_y(index: u32) -> f32 {
    let ys = array<f32, 2>(10.8, 10.8);
    return ys[index];
}

fn actuator_lane_x(index: u32) -> f32 {
    let xs = array<f32, 2>(19.0, 81.0);
    return xs[index];
}

fn actuator_machine_z(index: u32) -> f32 {
    let zs = array<f32, 2>(174.5, 174.5);
    return zs[index];
}

fn frame_piece(index: u32) -> Piece {
    if (index == 1u) {
        return Piece(
            vec3f(3.0, 0.0, 166.0),
            vec3f(97.0, 5.5, 192.0),
            KIND_HEADER
        );
    }
    if (index == 2u) {
        return Piece(
            vec3f(5.5, 5.5, 170.0),
            vec3f(25.5, 27.5, 190.0),
            KIND_FRAME
        );
    }
    if (index == 3u) {
        return Piece(
            vec3f(74.5, 5.5, 170.0),
            vec3f(94.5, 27.5, 190.0),
            KIND_FRAME
        );
    }
    return Piece(
        vec3f(25.5, 18.0, 177.0),
        vec3f(74.5, 24.0, 185.0),
        KIND_HEADER
    );
}

fn actuator_piece(actuator_index: u32, piece_type: u32, wall_front: f32) -> Piece {
    let center_y = actuator_center_y(actuator_index);
    let lane_x = actuator_lane_x(actuator_index);
    let machine_z = actuator_machine_z(actuator_index);
    let side = select(-1.0, 1.0, actuator_index == 1u);
    let rod_start = wall_front + 0.70;
    let body_front = machine_z - 7.4;
    let guide_end = body_front - 1.6;
    let plate_z0 = wall_front - 0.10;
    let plate_z1 = wall_front + 0.22;
    let pad_z0 = wall_front + 0.22;
    let pad_z1 = wall_front + 0.70;

    if (piece_type == 0u) {
        return Piece(
            vec3f(lane_x - 0.42, center_y - 1.08, plate_z0),
            vec3f(lane_x + 0.42, center_y + 1.08, plate_z1),
            KIND_PLATE
        );
    }
    if (piece_type == 1u) {
        return Piece(
            vec3f(lane_x - 0.30, center_y - 0.72, pad_z0),
            vec3f(lane_x + 0.30, center_y + 0.72, pad_z1),
            KIND_PAD
        );
    }
    if (piece_type == 2u) {
        return Piece(
            vec3f(lane_x - 0.28, center_y - 0.38, rod_start),
            vec3f(lane_x + 0.28, center_y + 0.38, guide_end),
            KIND_ROD
        );
    }
    if (piece_type == 3u) {
        return Piece(
            vec3f(lane_x - 0.10, center_y + 1.16, rod_start + 0.6),
            vec3f(lane_x + 0.10, center_y + 1.42, guide_end + 1.2),
            KIND_ROD
        );
    }
    if (piece_type == 4u) {
        return Piece(
            vec3f(lane_x - 0.10, center_y - 1.42, rod_start + 0.6),
            vec3f(lane_x + 0.10, center_y - 1.16, guide_end + 1.2),
            KIND_ROD
        );
    }
    if (piece_type == 5u) {
        return Piece(
            vec3f(lane_x - 0.98, center_y - 1.36, body_front - 1.6),
            vec3f(lane_x + 0.98, center_y + 1.36, body_front + 0.2),
            KIND_COLLAR
        );
    }
    if (piece_type == 6u) {
        return Piece(
            vec3f(lane_x - 3.15, center_y - 2.05, body_front + 0.2),
            vec3f(lane_x + 3.15, center_y + 2.05, machine_z + 5.8),
            KIND_BODY
        );
    }
    if (piece_type == 7u) {
        return Piece(
            vec3f(lane_x - 3.65, center_y - 2.42, machine_z - 0.8),
            vec3f(lane_x + 3.65, center_y + 2.42, machine_z + 2.7),
            KIND_BRACE
        );
    }
    if (piece_type == 8u) {
        return Piece(
            vec3f(lane_x - 2.95, center_y - 1.95, machine_z + 5.8),
            vec3f(lane_x + 2.95, center_y + 1.95, machine_z + 7.8),
            KIND_COLLAR
        );
    }
    if (piece_type == 9u) {
        return Piece(
            vec3f(lane_x - 4.5, center_y - 2.8, machine_z + 7.8),
            vec3f(lane_x + 4.5, center_y + 2.8, machine_z + 12.4),
            KIND_BRACE
        );
    }
    if (piece_type == 10u) {
        return Piece(
            vec3f(lane_x + side * 2.7, center_y - 2.45, machine_z - 1.0),
            vec3f(lane_x + side * 5.1, center_y + 2.45, machine_z + 9.8),
            KIND_BRACE
        );
    }
    if (piece_type == 11u) {
        return Piece(
        vec3f(lane_x - 1.45, center_y + 1.90, machine_z - 0.5),
        vec3f(lane_x + 1.45, center_y + 2.55, machine_z + 9.0),
        KIND_BRACE
        );
    }
    return Piece(
        vec3f(lane_x - 1.45, center_y - 2.55, machine_z - 0.5),
        vec3f(lane_x + 1.45, center_y - 1.90, machine_z + 9.0),
        KIND_BRACE
    );
}

fn get_piece(index: u32) -> Piece {
    let wall_front = uniforms.box_size.z;
    let wall_back = wall_front - WALL_THICKNESS;
    let top = wall_height();

    if (index == 0u) {
        return Piece(
            vec3f(0.0, 0.0, wall_back),
            vec3f(uniforms.box_size.x, top, wall_front),
            KIND_WALL
        );
    }

    if (index <= FRAME_COUNT) {
        return frame_piece(index);
    }

    let actuator_local = index - 1u - FRAME_COUNT;
    let actuator_index = actuator_local / PIECES_PER_ACTUATOR;
    let piece_type = actuator_local % PIECES_PER_ACTUATOR;
    return actuator_piece(actuator_index, piece_type, wall_front);
}

fn face_position(piece: Piece, face: u32, uv: vec2f) -> vec3f {
    let min_corner = piece.min_corner;
    let max_corner = piece.max_corner;

    switch face {
        case 0u: {
            return vec3f(
                max_corner.x,
                min_corner.y + (max_corner.y - min_corner.y) * uv.x,
                min_corner.z + (max_corner.z - min_corner.z) * uv.y
            );
        }
        case 1u: {
            return vec3f(
                min_corner.x,
                min_corner.y + (max_corner.y - min_corner.y) * uv.x,
                max_corner.z - (max_corner.z - min_corner.z) * uv.y
            );
        }
        case 2u: {
            return vec3f(
                min_corner.x + (max_corner.x - min_corner.x) * uv.x,
                max_corner.y,
                min_corner.z + (max_corner.z - min_corner.z) * uv.y
            );
        }
        case 3u: {
            return vec3f(
                min_corner.x + (max_corner.x - min_corner.x) * uv.x,
                min_corner.y,
                max_corner.z - (max_corner.z - min_corner.z) * uv.y
            );
        }
        case 4u: {
            return vec3f(
                min_corner.x + (max_corner.x - min_corner.x) * uv.x,
                min_corner.y + (max_corner.y - min_corner.y) * uv.y,
                max_corner.z
            );
        }
        default: {
            return vec3f(
                max_corner.x - (max_corner.x - min_corner.x) * uv.x,
                min_corner.y + (max_corner.y - min_corner.y) * uv.y,
                min_corner.z
            );
        }
    }
}

fn face_normal(face: u32) -> vec3f {
    switch face {
        case 0u: { return vec3f(1.0, 0.0, 0.0); }
        case 1u: { return vec3f(-1.0, 0.0, 0.0); }
        case 2u: { return vec3f(0.0, 1.0, 0.0); }
        case 3u: { return vec3f(0.0, -1.0, 0.0); }
        case 4u: { return vec3f(0.0, 0.0, 1.0); }
        default: { return vec3f(0.0, 0.0, -1.0); }
    }
}

fn hash21(p: vec2f) -> f32 {
    let h = dot(p, vec2f(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
}

fn seam_line(coord: f32, period: f32, width: f32) -> f32 {
    let local = fract(coord / period);
    let distance_to_edge = min(local, 1.0 - local);
    return 1.0 - smoothstep(0.0, width, distance_to_edge);
}

fn rivet_mask(uv: vec2f) -> f32 {
    let r0 = 1.0 - smoothstep(0.03, 0.10, length(uv - vec2f(0.18, 0.18)));
    let r1 = 1.0 - smoothstep(0.03, 0.10, length(uv - vec2f(0.82, 0.18)));
    let r2 = 1.0 - smoothstep(0.03, 0.10, length(uv - vec2f(0.18, 0.82)));
    let r3 = 1.0 - smoothstep(0.03, 0.10, length(uv - vec2f(0.82, 0.82)));
    return max(max(r0, r1), max(r2, r3));
}

fn brick_sample(uv: vec2f) -> vec3f {
    let row = floor(uv.y);
    let offset = select(0.0, 0.5, fract(row * 0.5) > 0.25);
    let shifted = vec2f(uv.x + offset, uv.y);
    let cell = floor(shifted);
    let local = fract(shifted);
    let edge = min(min(local.x, local.y), min(1.0 - local.x, 1.0 - local.y));
    let mortar_mask = smoothstep(0.05, 0.16, edge);
    let tint = hash21(cell);
    let base = mix(vec3f(0.33, 0.13, 0.08), vec3f(0.74, 0.30, 0.18), tint);
    let soot = 0.84 + 0.16 * sin(uv.x * 1.7 + uv.y * 0.6);
    let grain = 0.90 + 0.12 * sin(uv.x * 5.6) * sin(uv.y * 3.4);
    let brick = base * soot * grain;
    let mortar = vec3f(0.78, 0.73, 0.68);
    return mix(mortar, brick, mortar_mask);
}

fn concrete_color(world_position: vec3f) -> vec3f {
    let grain = 0.84 + 0.08 * sin(world_position.x * 0.14 + world_position.y * 0.18 + world_position.z * 0.06);
    let panel = seam_line(world_position.x + world_position.z * 0.10, 26.0, 0.045);
    let lift = seam_line(world_position.y + world_position.z * 0.04, 11.5, 0.03);
    let stain = 0.92 + 0.08 * sin(world_position.x * 0.09 - world_position.z * 0.05);
    return vec3f(0.33, 0.32, 0.30) * grain * stain - vec3f(0.08) * panel - vec3f(0.04) * lift;
}

fn piston_drive() -> f32 {
    return clamp((uniforms.box_size.z - 60.0) / 80.0, 0.0, 1.0);
}

fn wall_surface_color(world_position: vec3f, normal: vec3f) -> vec3f {
    if (abs(normal.z) > 0.88) {
        let uv = vec2f(world_position.x / 10.4, world_position.y / 6.1);
        return brick_sample(uv);
    }
    if (abs(normal.x) > 0.88) {
        let uv = vec2f((uniforms.box_size.z - world_position.z) * 0.92, world_position.y / 6.1);
        return brick_sample(uv);
    }
    return concrete_color(world_position);
}

fn metal_color(world_position: vec3f, normal: vec3f, kind: f32) -> vec3f {
    let drive = piston_drive();
    let heat = mix(vec3f(0.20, 0.78, 0.98), vec3f(1.0, 0.44, 0.10), drive);
    let brushed = 0.5 + 0.5 * sin(world_position.z * 0.52 + world_position.y * 0.18 + world_position.x * 0.10);
    let seams = seam_line(world_position.z + world_position.x * 0.3, 10.0, 0.07);
    let bolts = rivet_mask(fract(vec2f(world_position.y, world_position.z) * 0.06));
    let edge_glint = pow(max(0.0, dot(normal, vec3f(0.0, 0.0, 1.0))), 8.0);

    if (kind == KIND_FRAME) {
        let base = concrete_color(world_position);
        return base * 0.88 + vec3f(0.02) * edge_glint;
    }
    if (kind == KIND_HEADER) {
        let base = concrete_color(world_position + vec3f(0.0, 7.0, 0.0));
        return base * 1.02 + vec3f(0.03) * edge_glint;
    }
    if (kind == KIND_PLATE) {
        return mix(vec3f(0.24, 0.23, 0.21), heat, 0.10)
            + vec3f(0.03, 0.03, 0.03) * brushed
            + vec3f(0.04) * edge_glint;
    }
    if (kind == KIND_COLLAR) {
        return mix(vec3f(0.30, 0.31, 0.33), heat, 0.16)
            + vec3f(0.08, 0.08, 0.09) * brushed
            + vec3f(0.11) * edge_glint;
    }
    if (kind == KIND_BODY) {
        let base = mix(vec3f(0.08, 0.09, 0.10), vec3f(0.16, 0.14, 0.12), drive);
        return base
            + vec3f(0.05, 0.05, 0.06) * brushed
            - vec3f(0.03) * seams
            + heat * 0.06
            + vec3f(0.07) * edge_glint;
    }
    if (kind == KIND_ROD) {
        return mix(vec3f(0.70, 0.72, 0.74), heat, 0.62)
            + vec3f(0.12, 0.12, 0.13) * brushed
            + vec3f(0.16) * edge_glint;
    }
    if (kind == KIND_PAD) {
        return mix(vec3f(0.22, 0.21, 0.19), heat, 0.12)
            + vec3f(0.04, 0.04, 0.04) * brushed
            + vec3f(0.04) * edge_glint;
    }
    if (kind == KIND_BRACE) {
        return vec3f(0.12, 0.13, 0.15)
            + vec3f(0.05, 0.05, 0.06) * brushed
            - vec3f(0.04) * seams
            + heat * 0.02
            + vec3f(0.05) * bolts
            + vec3f(0.07) * edge_glint;
    }

    return vec3f(0.18, 0.19, 0.21)
        + vec3f(0.06, 0.07, 0.08) * brushed
        + vec3f(0.06) * edge_glint;
}

@vertex
fn vs(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    let piece_index = vertex_index / 36u;
    let piece_vertex = vertex_index % 36u;
    let face = piece_vertex / 6u;
    let quad_index = piece_vertex % 6u;
    let piece = get_piece(piece_index);
    let uv = quad_corner(quad_index);
    let world_position = face_position(piece, face, uv);
    let world_normal = face_normal(face);
    let view_position = uniforms.view_matrix * vec4f(world_position, 1.0);
    let clip_position = uniforms.projection_matrix * view_position;

    return VertexOutput(clip_position, world_position, world_normal, piece.kind);
}

@fragment
fn fs(input: VertexOutput) -> @location(0) vec4f {
    let normal = normalize(input.world_normal);
    let light_a = normalize(vec3f(0.46, 0.82, 0.34));
    let light_b = normalize(vec3f(-0.56, 0.22, 0.80));
    let light_c = normalize(vec3f(-0.16, -0.92, 0.22));
    let ambient = 0.30;
    let diffuse =
        max(0.0, dot(normal, light_a)) * 0.92 +
        max(0.0, dot(normal, light_b)) * 0.34 +
        max(0.0, dot(normal, light_c)) * 0.14;

    let camera_position = uniforms.inv_view_matrix[3].xyz;
    let view_dir = normalize(camera_position - input.world_position);
    let half_a = normalize(light_a + view_dir);
    let half_b = normalize(light_b + view_dir);
    let fresnel = pow(1.0 - max(0.0, dot(normal, view_dir)), 4.0);

    var color = vec3f(0.5);
    var specular = 0.0;
    if (input.part_kind == KIND_WALL) {
        color = wall_surface_color(input.world_position, normal);
        specular =
            pow(max(0.0, dot(normal, half_a)), 20.0) * 0.05 +
            pow(max(0.0, dot(normal, half_b)), 24.0) * 0.03;
    } else {
        color = metal_color(input.world_position, normal, input.part_kind);
        specular =
            pow(max(0.0, dot(normal, half_a)), 34.0) * 0.18 +
            pow(max(0.0, dot(normal, half_b)), 44.0) * 0.12;
    }

    let shaded = color * (ambient + diffuse) + vec3f(specular + fresnel * 0.06);
    return vec4f(shaded, 1.0);
}
