precision highp float;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform bool uMousePressed;
uniform float uTime;

vec2 root[3];
vec3 cols[3];

vec2 cmult(vec2 a, vec2 b) {
    return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

vec2 cdiv(vec2 a, vec2 b) {
    vec2 o = vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y);
    return o / dot(b, b);
}

vec2 func(vec2 uv) {
    vec2 o = vec2(1.0, 0.0);
    for(int i = 0; i < 3; i++) {
        o = cmult(o, (uv - root[i]));
    }
    return o;
}

vec2 der(vec2 uv) {
    vec2 o = vec2(0.0, 0.0);
    for(int i = 0; i < 3; i++) {
        vec2 p = vec2(1.0, 0.0);
        for(int j = 0; j < 3; j++) {
            if (i != j) {
                p = cmult(p, uv - root[j]);
            }
        }
        o += p;
    }
    return o;
}

float length2(vec2 p) {
    return sqrt(dot(p, p));
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float seg(vec2 p, vec2 a, vec2 b, float r) {
    vec2 g = b - a;
    vec2 h = p - a;
    float d = length2(h - g * clamp(dot(g, h) / dot(g,g), 0.0, 1.0));
    return smoothstep(r, 0.5*r, d);
}

vec3 colFractal(vec2 p) {
    vec2 uv = p;
    float l = 0.0;

    for(int i = 0; i < 30; i++) {
        vec2 temp = uv;
        uv -= cdiv(func(uv), der(uv));

        for(int i = 0; i < 3; i++) {
            if (length2(uv - root[i]) < 0.001) {
                vec3 baseColor = hsv2rgb(vec3(float(i) / 3.0 + uTime * 0.1, 0.8, 1.0));
                vec3 shadedCol = clamp(baseColor/(log2(l + 2.0)), 0.0, 1.0);
                return mix(shadedCol, baseColor, 0.2) + vec3(0.1 * sin(l * 3.0 + uTime));
            }
        }
        l += length2(temp - uv);
    }
    return vec3(0.0);
}

void main() {
    float t = uTime * 0.5;
    root[0] = vec2(0.5 * cos(t), 0.5 * sin(t));
    root[1] = vec2(-1.0 * cos(t * 0.7), 0.86603 * sin(t * 0.7));
    root[2] = vec2(-1.0 * sin(t * 0.5), -0.86603 * cos(t * 0.5));

    vec4 screen = vec4(-2.2, -1.2, 1.2, 1.2);
    vec2 uv = mix(screen.xy, screen.zw, gl_FragCoord.xy/uResolution);

    vec3 col = colFractal(uv);
    col += 0.05 * vec3(sin(uTime + uv.x), cos(uTime + uv.y), sin(uTime * 0.5));

    if (uMousePressed) {
        vec2 mousePos = mix(screen.xy, screen.zw, uMouse/uResolution);
        vec2 p = mousePos;

        for(int i = 0; i < 30; i++) {
                        bool hitRoot = false;
            for(int j = 0; j < 3; j++) {
                if(length2(p - root[j]) < 0.0001) hitRoot = true;
            }

            float dist = length2(uv - p);
            if(dist < 0.03) {
                col = mix(col, vec3(1.0, 0.5, 0.0), smoothstep(0.03, 0.0, dist));
            }

            vec2 temp = p;
            p -= cdiv(func(p), der(p));
            col += vec3(0.8, 0.9, 1.0) * seg(uv, p, temp, 0.01);

            if (hitRoot) break;
        }
    }

    for(int i = 0; i < 3; i++) {
        float dist = length2(uv - root[i]);
        if(dist < 0.03) {
            vec3 glowColor = hsv2rgb(vec3(float(i) / 3.0 + uTime * 0.1, 0.8, 1.0));
            col = mix(col, glowColor, smoothstep(0.03, 0.0, dist));
        }
    }

    gl_FragColor = vec4(col, 1.0);
}

