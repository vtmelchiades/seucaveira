precision highp float;
// SEU CAVEIRA — reel: procedural "plano" rendered twice (LOG x FINAL), split by
// a draggable reveal line. Terrain = stacked sine ridges; sun + fbm clouds;
// reflection. Grading is lift/gamma/gain math, no textures.
uniform vec2 uRes;
uniform float uTime;
uniform float uReveal;   // 0..1 split position
uniform float uAnimate;  // 0 = reduced motion (freeze sun/clouds)

float hash(vec2 p) {
  p = fract(p * vec2(321.13, 124.41));
  p += dot(p, p + 51.71);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}
float ridge(vec2 uv, float y0, float amp, float freq, float ph) {
  float y = y0
    + amp * 0.55 * sin(uv.x * freq + ph)
    + amp * 0.30 * sin(uv.x * freq * 2.7 + ph * 1.7)
    + amp * 0.18 * sin(uv.x * freq * 6.1 - ph);
  return smoothstep(y, y - 0.012, uv.y);
}

vec3 scene(vec2 uv, float t, out float sunMask) {
  float horizon = 0.42;
  // sky: warm gradient toward the sun lane
  float sunX = 0.68, sunY = 0.60;
  vec2 sunPos = vec2(sunX, horizon + (1.0 - horizon) * 0.34);
  float d = distance((uv - sunPos) * vec2(1.8, 1.0), vec2(0.0));
  float sun = smoothstep(0.075, 0.048, d);
  float halo = exp(-d * 3.4) * 0.55;
  sunMask = sun;

  vec3 sky = mix(vec3(0.045, 0.075, 0.085), vec3(0.85, 0.55, 0.28), smoothstep(horizon, 0.8, uv.y * 0.35 + 0.62));
  sky = mix(sky, vec3(0.98, 0.68, 0.32), halo);
  // clouds drift
  float cl = fbm(vec2(uv.x * 3.2 + t * 0.05, uv.y * 5.0 + 12.0));
  cl = smoothstep(0.55, 0.85, cl) * smoothstep(horizon, horizon + 0.42, uv.y) * 0.5;
  sky += cl * vec3(0.9, 0.75, 0.6);
  sky += sun * vec3(1.0, 0.82, 0.5);

  // ridges (two dark layers + reflection of the near one below horizon)
  float m1 = ridge(uv, horizon, 0.10, 5.0, 1.3);
  float m2 = ridge(uv, horizon, 0.18, 2.6, 4.9);
  vec3 col = sky;
  col = mix(col, vec3(0.05, 0.09, 0.10), m2 * 0.9);
  col = mix(col, vec3(0.02, 0.04, 0.05), m1);
  // water under horizon: mirrored sky + ripple
  float below = smoothstep(horizon, horizon - 0.02, uv.y);
  vec2 ruv = vec2(uv.x, horizon + (horizon - uv.y));
  float rip = 0.012 * sin(uv.y * 220.0 + t * 2.0) * below;
  float rSun = smoothstep(0.085, 0.05, distance((vec2(uv.x + rip, ruv.y) - sunPos) * vec2(1.8, 1.0), vec2(0.0)));
  vec3 water = mix(vec3(0.02, 0.05, 0.06), vec3(0.1, 0.16, 0.16), fbm(vec2(uv.x * 8.0, uv.y * 26.0 - t * 0.2)));
  water += rSun * vec3(1.0, 0.6, 0.25) * (0.7 + 0.5 * sin(uv.y * 60.0));
  col = mix(col, water, below);
  return col;
}

vec3 logify(vec3 c) {
  // flat "camera log": crush contrast, desaturate, lift shadows toward grey
  c = (c - 0.03) / 0.94;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(l) * 0.9 + 0.06, c, 0.45);
  c = mix(c, vec3(0.45, 0.47, 0.45), 0.30);
  return c;
}
vec3 grade(vec3 c, float sun) {
  // teal & orange: lift blues in shadows, push highlights warm, roll-off
  vec3 lift = vec3(0.008, 0.02, 0.030);
  vec3 gain = vec3(1.06, 1.0, 0.90);
  c = pow(max(c + lift, 0.0), vec3(1.06, 1.0, 0.94)) * gain;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, vec3(0.03, 0.16, 0.19) + c * 1.18, smoothstep(0.35, 0.0, l) * 0.6);  // teal shadows
  c += sun * vec3(0.25, 0.10, -0.06) * 0.55;                                        // orange key
  c = c / (1.0 + 0.35 * c);                                                           // filmic roll-off
  float sat = 1.28;
  float g2 = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(g2), c, sat);
  return clamp(c, 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float t = uAnimate > 0.5 ? uTime : 0.0;

  float sunA;
  vec3 fin = scene(uv, t, sunA);
  fin = grade(fin, sunA);
  vec3 logc = logify(scene(uv, t, sunA));

  float split = 1.0 - uReveal; // reveal grows from left to right
  float edge = smoothstep(0.004, 0.0, abs(uv.x - split));
  vec3 col = mix(logc, fin, step(split, uv.x));

  // hard white line + RGB split at the boundary
  float j = 0.0035 * smoothstep(0.5, 0.0, abs(uv.x - split));
  col.r = mix(col.r, mix(logc.r, fin.r, step(split, uv.x + j)), edge);
  col.b = mix(col.b, mix(logc.b, fin.b, step(split, uv.x - j)), edge);
  col += vec3(0.95, 0.93, 0.88) * edge * 0.85;

  // house grain + scanlines on both sides
  float gr = hash(gl_FragCoord.xy + floor(t * 24.0) * 91.0) - 0.5;
  col += gr * 0.05;
  col -= mod(gl_FragCoord.y, 3.0) < 1.0 ? 0.012 : 0.0;
  // letterbox vignette
  col *= 0.75 + 0.25 * smoothstep(0.0, 0.16, uv.x * (1.0 - uv.x)) * smoothstep(0.0, 0.12, uv.y * (1.0 - uv.y));

  gl_FragColor = vec4(col, 1.0);
}
