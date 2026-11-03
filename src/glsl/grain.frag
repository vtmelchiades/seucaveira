precision highp float;
// SEU CAVEIRA — hero grain field: projector-cadence film grain, scanlines,
// scope grid, pointer ripple, bone vignette. Pure math, zero textures.
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;      // 0..1
uniform float uScroll;    // 0..1 through hero
uniform float uGrain;     // intensity multiplier (reduced-motion aware)

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < 3; i++) { v += amp * vnoise(p); p *= 2.1; amp *= 0.55; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv - 0.5;
  p.x *= uRes.x / uRes.y;

  // projector cadence: quantize time to 24fps so grain "ticks" like film
  float t = floor(uTime * 24.0) / 24.0;

  // pointer ripple — displacement field around cursor
  vec2 m = uMouse - 0.5; m.x *= uRes.x / uRes.y;
  float md = length(p - m);
  float ripple = sin(md * 34.0 - uTime * 2.2) * exp(-md * 5.0) * 0.012;
  p += normalize(p - m + 1e-5) * ripple;

  // scope grid: faint, breathing with scroll
  vec2 g = fract(p * 14.0);
  float grid = smoothstep(0.97, 1.0, max(g.x, g.y)) * (0.10 - 0.07 * uScroll);

  // layered grain + faint drifting cloud field
  float gr = hash(gl_FragCoord.xy + t * 173.0) - 0.5;
  float cloud = fbm(p * 2.6 + vec2(t * 0.035, -t * 0.02));
  float beams = smoothstep(0.42, 0.9, cloud) * (0.05 - 0.035 * uScroll);

  // CRT scanline — one dark line every 3 device rows, plus slow sweep
  float scan = mod(gl_FragCoord.y, 3.0) < 1.0 ? -0.016 : 0.0;
  float sweep = exp(-pow(fract(uv.y - uTime * 0.07) - 0.5, 2.0) * 90.0) * 0.016;

  float vig = smoothstep(1.35, 0.35, length(p * vec2(0.92, 1.18)));
  float lum = vig * 0.055 + beams + grid + sweep + scan + gr * (0.075 + 0.1 * uGrain);

  // chromatic breathe on the bone field, very subtle
  float ca = 0.5 + 0.5 * sin(uv.y * 3.1 + uTime * 0.6);
  vec3 col = mix(vec3(0.925, 0.906, 0.870), vec3(1.0, 0.42, 0.18), 0.10 * ca) * max(lum, 0.0);
  col += vec3(0.02, 0.028, 0.03) * (1.0 - vig); // ambient room glow

  gl_FragColor = vec4(col, 1.0);
}
