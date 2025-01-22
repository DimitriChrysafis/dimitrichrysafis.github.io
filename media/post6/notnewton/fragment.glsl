#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform float iTime;
uniform vec2 iResolution;
uniform float zoom;
uniform vec2 mousePos;
uniform vec2 pan;

const int NSTEPS = 100;
const float AA = 2.0;

const vec2[4] PARAMS = vec2[](
    vec2(1.8462756, 0.09627581),
    vec2(1.958591, 0.011278),
    vec2(1.857382, 0.076258),
    vec2(2.0, 0.0)
);

void TransA(inout vec2 z, float a, float b, inout float scale) {
    float iR = 1.0/dot(z,z);
    z *= iR;
    scale *= iR;
    z.x = z.x - b;
    z.y = a - z.y;
}

bool separation(vec2 z, float a, float b) {
    float K = sign(b)*(2.0*a-1.95)/4.3;
    float M = 7.2-(1.95-a)*18.0;
    float f = (z.x >= -b/2.0) ? 1.0 : -1.0;
    return z.y >= 0.5*a + K*f*(1.0 - exp(-M*abs(z.x + b * 0.5)));
}

vec4 Kleinian(vec2 z, float a, float b, inout float scale) {
    vec2 lz = z+vec2(1.0);
    vec2 llz = z-vec2(1.0);
    float f = sign(b);
    float flag = 1.0;

    for (int i = 0; i < 2*NSTEPS; i++) {
        z.x = z.x+f*b/a*z.y;
        z.x = mod(z.x + 1.0, 2.0) - 1.0;
        z.x = z.x-f*b/a*z.y;

        if (separation(z,a,b)) {
            z = vec2(-b, a) - z;
            flag++;
        }

        TransA(z,a,b,scale);

        if (dot(z-llz,z-llz) < 1e-6) {
            return vec4(0.0,float(i),0.05,scale);
        }

        if (z.y < 0.0) return vec4(flag,float(i),-z.y,scale);
        if (z.y > a) return vec4(flag,float(i),z.y-a,scale);

        llz = lz;
        lz = z;
    }
    return vec4(0.0,float(NSTEPS),0.0,0.0);
}

vec3 hsv2rgb( in vec3 c ) {
  vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,3.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
  rgb = rgb*rgb*(3.0-2.0*rgb);
  return c.z * mix( vec3(1.0), rgb, c.y);
}


void main() {
    vec4 fragSum = vec4(0.0);

    for(float i = 0.0; i < AA; i++) {
        for(float j = 0.0; j < AA; j++) {
            vec2 offset = vec2(i, j) / AA;
            vec2 uv = (2.0 * (vUv + offset/iResolution) - 1.0) * zoom;
            uv.x *= iResolution.x/iResolution.y;

            uv += pan;

            float t = mod(0.2*iTime, 4.0);
            int idx = int(t);
            float fract = t - float(idx);
            vec2 Klein = mix(PARAMS[idx], PARAMS[(idx+1)%4], smoothstep(0.0, 1.0, fract));

            float scale = 1.0;
            vec4 hit = Kleinian(uv - mousePos * 0.001, Klein.x, Klein.y, scale);

            vec3 col = vec3(0.0);
            if (hit.x != 0.0) {
                col = hsv2rgb(vec3(0.7 + hit.y / float(NSTEPS), 1.0, 1.0));
            }

            fragSum += vec4(col, 1.0);
        }
    }

    fragSum /= AA * AA;

    vec2 vuv = vUv * 2.0 - 1.0;
    float vignette = 1.0 - dot(vuv, vuv) * 0.3;
    fragSum.rgb *= vignette;

    fragColor = vec4(pow(fragSum.rgb, vec3(0.4545)), 1.0);
}
