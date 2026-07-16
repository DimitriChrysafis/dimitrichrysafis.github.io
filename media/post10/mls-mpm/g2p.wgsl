struct Particle {
    position: vec3f, 
    v: vec3f, 
    C: mat3x3f, 
}
struct Cell {
    vx: i32, 
    vy: i32, 
    vz: i32, 
    mass: i32, 
}

struct PistonState {
    wall_velocity_z: f32,
    boundary_width: f32,
    pad0: f32,
    pad1: f32,
}

struct InteractionState {
    point: vec3f,
    radius: f32,
    impulse: vec3f,
    strength: f32,
}

override fixed_point_multiplier: f32; 
override dt: f32; 

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read> cells: array<Cell>;
@group(0) @binding(2) var<uniform> real_box_size: vec3f;
@group(0) @binding(3) var<uniform> init_box_size: vec3f;
@group(0) @binding(4) var<uniform> piston_state: PistonState;
@group(0) @binding(5) var<uniform> interaction_state: InteractionState;

fn decodeFixedPoint(fixed_point: i32) -> f32 {
	return f32(fixed_point) / fixed_point_multiplier;
}


@compute @workgroup_size(64)
fn g2p(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x < arrayLength(&particles)) {
        particles[id.x].v = vec3f(0.);
        var weights: array<vec3f, 3>;

        let particle = particles[id.x];
        let cell_idx: vec3f = floor(particle.position);
        let cell_diff: vec3f = particle.position - (cell_idx + 0.5f);
        weights[0] = 0.5f * (0.5f - cell_diff) * (0.5f - cell_diff);
        weights[1] = 0.75f - cell_diff * cell_diff;
        weights[2] = 0.5f * (0.5f + cell_diff) * (0.5f + cell_diff);

        var B: mat3x3f = mat3x3f(vec3f(0.), vec3f(0.), vec3f(0.));
        for (var gx = 0; gx < 3; gx++) {
            for (var gy = 0; gy < 3; gy++) {
                for (var gz = 0; gz < 3; gz++) {
                    let weight: f32 = weights[gx].x * weights[gy].y * weights[gz].z;
                    let cell_x: vec3f = vec3f(
                        cell_idx.x + f32(gx) - 1., 
                        cell_idx.y + f32(gy) - 1.,
                        cell_idx.z + f32(gz) - 1.  
                    );
                    let cell_dist: vec3f = (cell_x + 0.5f) - particle.position;
                    let cell_index: i32 = 
                        i32(cell_x.x) * i32(init_box_size.y) * i32(init_box_size.z) + 
                        i32(cell_x.y) * i32(init_box_size.z) + 
                        i32(cell_x.z);
                    let weighted_velocity: vec3f = vec3f(
                        decodeFixedPoint(cells[cell_index].vx), 
                        decodeFixedPoint(cells[cell_index].vy), 
                        decodeFixedPoint(cells[cell_index].vz)
                    ) * weight;
                    let term: mat3x3f = mat3x3f(
                        weighted_velocity * cell_dist.x, 
                        weighted_velocity * cell_dist.y, 
                        weighted_velocity * cell_dist.z
                    );

                    B += term;

                    particles[id.x].v += weighted_velocity;
                }
            }
        }

        if (interaction_state.strength > 0.0) {
            let offset = particle.position - interaction_state.point;
            let distance = length(offset);
            if (distance < interaction_state.radius) {
                let influence = pow(1.0 - distance / interaction_state.radius, 2.0);
                let energy = influence * interaction_state.strength;
                let radial = normalize(offset + vec3f(0.0, 0.25, 0.0));
                let swirl = normalize(vec3f(-offset.z, 0.0, offset.x) + vec3f(0.001, 0.0, 0.001));
                particles[id.x].v += interaction_state.impulse * energy;
                particles[id.x].v += radial * (0.85 * energy) + swirl * (1.15 * energy);
            }
        }

        particles[id.x].C = B * 4.0f;
        particles[id.x].position += particles[id.x].v * dt;
        particles[id.x].position = vec3f(
            clamp(particles[id.x].position.x, 1., real_box_size.x - 2.), 
            clamp(particles[id.x].position.y, 1., real_box_size.y - 2.), 
            clamp(particles[id.x].position.z, 1., real_box_size.z - 2.)
        );
        
        let k = 3.0;
        let wall_stiffness = 0.3;
        let x_n: vec3f = particles[id.x].position + particles[id.x].v * dt * k;
        let wall_min: vec3f = vec3f(3.);
        let wall_max: vec3f = real_box_size - 4.;
        if (x_n.x < wall_min.x) { particles[id.x].v.x += wall_stiffness * (wall_min.x - x_n.x); }
        if (x_n.x > wall_max.x) { particles[id.x].v.x += wall_stiffness * (wall_max.x - x_n.x); }
        if (x_n.y < wall_min.y) { particles[id.x].v.y += wall_stiffness * (wall_min.y - x_n.y); }
        if (x_n.y > wall_max.y) { particles[id.x].v.y += wall_stiffness * (wall_max.y - x_n.y); }
        if (x_n.z < wall_min.z) { particles[id.x].v.z += wall_stiffness * (wall_min.z - x_n.z); }
        if (x_n.z > wall_max.z) {
            if (piston_state.wall_velocity_z < 0.0) {
                particles[id.x].v.z = min(particles[id.x].v.z, piston_state.wall_velocity_z);
            }
            particles[id.x].v.z += wall_stiffness * (wall_max.z - x_n.z);
        }
    }
}
