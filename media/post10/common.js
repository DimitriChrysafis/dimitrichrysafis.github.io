export const renderUniformsValues = new ArrayBuffer(304);
export const renderUniformsViews = {
  texel_size: new Float32Array(renderUniformsValues, 0, 2),
  sphere_size: new Float32Array(renderUniformsValues, 8, 2),
  inv_projection_matrix: new Float32Array(renderUniformsValues, 16, 16),
  projection_matrix: new Float32Array(renderUniformsValues, 80, 16),
  view_matrix: new Float32Array(renderUniformsValues, 144, 16),
  inv_view_matrix: new Float32Array(renderUniformsValues, 208, 16),
  box_size: new Float32Array(renderUniformsValues, 272, 3),
  render_z_offset: new Float32Array(renderUniformsValues, 284, 1),
  box_anchor_z: new Float32Array(renderUniformsValues, 288, 1),
};

export const numParticlesMax = 1000000;
