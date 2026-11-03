precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uMouseVelocity;
uniform float uScrollProgress;
uniform float uScrollVelocity;
uniform float uSectionState;
uniform float uCraftState;
uniform float uRawCutMode;
uniform float uFinalGradeMode;
uniform float uVfxMode;
uniform float uColorTemp;

mat2 rot2(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / max(k, 0.0001), 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  return (p.x + p.y + p.z - s) * 0.57735027;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

// ---------------------------------------------------------------------------
// Abstract Cranial Monolith + Refractive Optical Ring SDF
// Returns vec2(distance, materialID)
// 1.0 = Dark Liquid Metal Cranial Monolith, 2.0 = Optical Glass Lens Ring
// ---------------------------------------------------------------------------
vec2 mapScene(vec3 p) {
  // Fast outer bounding sphere check
  float bound = length(p) - 1.65;
  if (bound > 0.25) {
    return vec2(bound, 0.0);
  }

  vec3 q = p;

  float yaw = uMouse.x * 0.48 + sin(uTime * 0.35) * 0.16 + uScrollProgress * 1.15;
  float pitch = -uMouse.y * 0.32 + cos(uTime * 0.25) * 0.08 + (uSectionState - 1.5) * 0.09;
  q.xz *= rot2(yaw);
  q.yz *= rot2(pitch);

  // Scroll velocity + Raw Cut Mode horizontal razor slice displacement
  float cutIntensity = clamp(
    abs(uScrollVelocity) * 0.22 + uRawCutMode * 0.55 + (1.0 - step(0.5, abs(uCraftState))) * 0.25,
    0.0,
    1.4
  );
  float sliceBand = floor(q.y * 7.5 + uTime * 1.2);
  q.x += sin(sliceBand * 19.7 + uTime * 4.0) * 0.09 * cutIntensity;

  // VFX mode & Mouse velocity high-frequency kinetic ripple
  float vfxWarp = uVfxMode * 0.75 + uMouseVelocity * 0.45 + max(0.0, 1.0 - abs(uCraftState - 2.0)) * 0.35;
  vec3 warpP = q + vec3(
    sin(q.y * 5.2 + uTime * 2.4),
    cos(q.z * 4.8 - uTime * 1.9),
    sin(q.x * 5.0 + uTime * 2.1)
  ) * (0.042 + 0.062 * vfxWarp);

  // 1. Upper Cranium Vault
  vec3 craniumP = warpP - vec3(0.0, 0.24, 0.0);
  craniumP.x *= 1.14;
  craniumP.z *= 0.92;
  float dome = length(craniumP) - 0.78;
  float facet = sdOctahedron(craniumP * vec3(1.0, 0.85, 0.95), 1.08);
  float head = mix(dome, facet, 0.38);

  // 2. Zygomatic / Cheekbone Monolithic Architecture
  vec3 zygoP = warpP - vec3(0.0, -0.06, 0.16);
  zygoP.x = abs(zygoP.x) - 0.36;
  float zygo = sdBox(zygoP, vec3(0.22, 0.14, 0.32)) - 0.06;
  head = smin(head, zygo, 0.16);

  // 3. Lower Mandible / Jaw Monolith
  vec3 jawP = warpP - vec3(0.0, -0.48, 0.10);
  jawP.x *= 1.35;
  float jawBox = sdBox(jawP, vec3(0.36, 0.28, 0.34)) - 0.05;
  head = smin(head, jawBox, 0.14);

  // 4. Temporal Cut Planes
  vec3 tempP = warpP;
  tempP.x = abs(tempP.x);
  float tempCut = dot(tempP - vec3(0.62, 0.15, 0.0), normalize(vec3(1.0, -0.18, 0.12)));
  head = smax(head, tempCut, 0.08);

  // 5. Dual Orbital Optical Cavities (Eye Sockets)
  vec3 orbitP = warpP - vec3(0.0, 0.06, 0.56);
  orbitP.x = abs(orbitP.x) - 0.27;
  orbitP.xy *= rot2(-0.14);
  float sockets = length(orbitP * vec3(0.92, 1.18, 0.78)) - 0.235;
  head = smax(head, -sockets, 0.075);

  // 6. Nasal Aperture Cavity
  vec3 nasalP = warpP - vec3(0.0, -0.16, 0.64);
  nasalP.y *= 0.82;
  nasalP.x *= 1.55;
  float nasal = sdOctahedron(nasalP, 0.19);
  head = smax(head, -nasal, 0.045);

  // 7. Horizontal Razor Edit Gaps along Jaw & Brow
  float razorGroove = abs(fract(warpP.y * 5.5 + 0.25) - 0.5) - 0.018 * (1.0 + cutIntensity * 1.4);
  head = smax(head, -razorGroove, 0.015);

  // 8. Orbiting Refractive Optical Glass Rings + Socket Cores
  vec3 ringP = p;
  ringP.xz *= rot2(-uTime * 0.42 - uMouse.x * 0.65);
  ringP.xy *= rot2(0.58 + uMouse.y * 0.35 + uSectionState * 0.22);
  float ring1 = sdTorus(ringP, vec2(1.18 + 0.08 * sin(uTime * 0.7), 0.042));

  vec3 ringP2 = p;
  ringP2.yz *= rot2(uTime * 0.31 + uScrollProgress * 2.2);
  ringP2.xz *= rot2(-0.75 + uCraftState * 0.45);
  float ring2 = sdTorus(ringP2, vec2(1.42, 0.026));

  vec3 coreP = warpP - vec3(0.0, 0.06, 0.44);
  coreP.x = abs(coreP.x) - 0.27;
  float opticalCore = length(coreP) - 0.105;

  float glassDist = min(min(ring1, ring2), opticalCore);

  if (glassDist < head) {
    return vec2(glassDist, 2.0);
  }
  return vec2(head, 1.0);
}

vec3 calcNormal(vec3 p) {
  const float h = 0.003;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * mapScene(p + k.xyy * h).x +
    k.yyx * mapScene(p + k.yyx * h).x +
    k.yxy * mapScene(p + k.yxy * h).x +
    k.xxx * mapScene(p + k.xxx * h).x
  );
}

vec3 sampleStudioEnv(vec3 rd, float tempShift) {
  vec3 warmKey = mix(vec3(0.92, 0.58, 0.18), vec3(1.0, 0.76, 0.28), clamp(tempShift * 0.5 + 0.5, 0.0, 1.0));
  vec3 crimsonRim = vec3(0.88, 0.11, 0.28);
  vec3 steelFill = mix(vec3(0.16, 0.22, 0.30), vec3(0.28, 0.18, 0.12), clamp(tempShift * 0.5 + 0.5, 0.0, 1.0));

  float studioBox1 = pow(max(0.0, dot(rd, normalize(vec3(0.75, 0.55, -0.35)))), 14.0);
  float studioBox2 = pow(max(0.0, dot(rd, normalize(vec3(-0.82, 0.20, -0.45)))), 10.0);
  float topStrip = smoothstep(0.86, 0.96, rd.y) * smoothstep(0.6, 0.0, abs(rd.x));
  float anamorphicHorizon = exp(-abs(rd.y + 0.05) * 18.0) * 0.28;

  vec3 env = vec3(0.015, 0.015, 0.018);
  env += warmKey * (studioBox1 * 1.65 + anamorphicHorizon);
  env += crimsonRim * (studioBox2 * 1.45);
  env += steelFill * (topStrip * 1.15 + pow(max(0.0, -rd.z), 4.0) * 0.22);
  return env;
}

vec3 renderRaymarch(vec2 p) {
  vec3 ro = vec3(
    uMouse.x * 0.22,
    uMouse.y * 0.16,
    2.85 - 0.18 * sin(uScrollProgress * 3.14159)
  );
  vec3 ta = vec3(0.0, -0.04, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = normalize(cross(uu, ww));

  vec2 lensP = p;
  lensP.x *= 0.94;
  vec3 rd = normalize(lensP.x * uu + lensP.y * vv + 1.68 * ww);

  vec3 col = vec3(0.015, 0.015, 0.017);
  vec3 keyTone = mix(vec3(0.88, 0.56, 0.16), vec3(1.0, 0.72, 0.24), clamp(uColorTemp * 0.5 + 0.5, 0.0, 1.0));
  vec3 rimTone = vec3(0.88, 0.11, 0.28);

  // Analytical Ray-Sphere Intersection to skip empty space outside radius 1.62
  float b = dot(ro, rd);
  float c = dot(ro, ro) - 1.62 * 1.62;
  float disc = b * b - c;

  float volumetricAcc = exp(-length(p - vec2(uMouse.x * 0.15, uMouse.y * 0.12)) * 1.8) * 0.18;

  if (disc > 0.0) {
    float sqrtDisc = sqrt(disc);
    float tStart = max(0.0, -b - sqrtDisc);
    float tEnd = -b + sqrtDisc;
    float t = tStart;
    float matId = 0.0;

    for (int i = 0; i < 32; i++) {
      if (t > tEnd) break;
      vec3 pos = ro + rd * t;
      vec2 h = mapScene(pos);
      volumetricAcc += exp(-max(h.x, 0.0) * 4.5) * 0.016;
      if (abs(h.x) < 0.0035) {
        matId = h.y;
        break;
      }
      t += max(h.x * 0.9, 0.012);
    }

    col += volumetricAcc * mix(rimTone, keyTone, clamp(p.x * 0.5 + 0.5, 0.0, 1.0)) * 0.65;

    if (matId > 0.5) {
      vec3 pos = ro + rd * t;
      vec3 nor = calcNormal(pos);
      vec3 viewDir = -rd;
      float fresnel = pow(1.0 - max(dot(nor, viewDir), 0.0), 4.0);
      float ao = clamp(0.5 + 0.5 * nor.y, 0.25, 1.0);

      vec3 lightDir1 = normalize(vec3(1.2, 0.9, 1.1));
      vec3 lightDir2 = normalize(vec3(-1.4, -0.3, 0.6));
      vec3 lightDir3 = normalize(vec3(0.0, 1.5, -1.2));

      float diff1 = max(dot(nor, lightDir1), 0.0);
      float diff2 = max(dot(nor, lightDir2), 0.0);
      float rimBack = pow(clamp(1.0 + dot(nor, rd), 0.0, 1.0), 3.0);

      float spec1 = pow(max(dot(nor, normalize(lightDir1 + viewDir)), 0.0), 48.0);
      float spec2 = pow(max(dot(nor, normalize(lightDir2 + viewDir)), 0.0), 28.0);
      float spec3 = pow(max(dot(nor, normalize(lightDir3 + viewDir)), 0.0), 64.0);

      vec3 reflDir = reflect(rd, nor);
      vec3 envRefl = sampleStudioEnv(reflDir, uColorTemp);

      if (matId < 1.5) {
        vec3 baseMetal = vec3(0.032, 0.033, 0.038);
        vec3 metalColor = baseMetal * (0.25 + 0.75 * diff1) * ao;
        metalColor += envRefl * (0.18 + 0.82 * fresnel) * ao;
        metalColor += keyTone * (spec1 * 1.35 + diff1 * 0.14);
        metalColor += rimTone * (spec2 * 0.95 + diff2 * 0.18 + rimBack * 0.42);
        metalColor += vec3(0.75, 0.82, 0.92) * spec3 * 0.55;

        float vfxBlend = clamp(uVfxMode + max(0.0, 1.0 - abs(uCraftState - 2.0)) * 0.65, 0.0, 1.0);
        if (vfxBlend > 0.01) {
          float isoY = smoothstep(0.91, 0.98, abs(sin(pos.y * 28.0 - uTime * 2.5)));
          float isoX = smoothstep(0.93, 0.99, abs(sin(pos.x * 28.0)));
          float wire = max(isoY, isoX);
          vec3 wireCol = mix(vec3(0.95, 0.22, 0.32), vec3(0.95, 0.68, 0.20), fresnel);
          metalColor = mix(metalColor, metalColor + wireCol * wire * 0.85, vfxBlend);
        }
        col = metalColor;
      } else {
        vec3 refrR = refract(rd, nor, 1.0 / 1.46);
        vec3 refrG = refract(rd, nor, 1.0 / 1.52);
        vec3 refrB = refract(rd, nor, 1.0 / 1.58);
        vec3 glassRefr = vec3(
          sampleStudioEnv(refrR, uColorTemp).r,
          sampleStudioEnv(refrG, uColorTemp).g,
          sampleStudioEnv(refrB, uColorTemp).b
        );
        col = mix(glassRefr * 1.35, envRefl * 1.8, fresnel) + keyTone * spec1 * 2.2 + rimTone * rimBack * 0.95;
      }
    }
  } else {
    col += volumetricAcc * mix(rimTone, keyTone, clamp(p.x * 0.5 + 0.5, 0.0, 1.0)) * 0.45;
  }

  float streak = exp(-abs(p.y - 0.06) * 26.0) * exp(-abs(p.x) * 1.8) * 0.22;
  col += mix(keyTone, rimTone, 0.4) * streak * (0.6 + 0.4 * uFinalGradeMode);

  return col;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * 2.0 * aspect;
  vec2 mouseP = uMouse * aspect;

  // 1. VFX MODE (motion_AGORA_VAI.aep): Optical Distortion
  float distToMouse = length(p - mouseP);
  if (uVfxMode > 0.01) {
    float ripple = sin(distToMouse * 18.0 - uTime * 7.0) * exp(-distToMouse * 2.6);
    vec2 radialDir = normalize(p - mouseP + vec2(0.0001));
    p += radialDir * ripple * (0.045 + uMouseVelocity * 0.06) * uVfxMode;
  }

  // 2. Single-Pass Raymarch + Analytical Anamorphic Edge Chromatic Aberration
  vec3 col = renderRaymarch(p);
  float edgeDist = dot(p, p);
  float caStrength = (0.045 * uFinalGradeMode + 0.095 * uVfxMode + 0.05 * clamp(abs(uScrollVelocity) * 0.1, 0.0, 1.0)) * edgeDist;
  float edgeFringe = sin(p.x * 16.0 + uTime * 2.0) * caStrength;
  col.r += edgeFringe * 0.85 + edgeDist * 0.018 * uFinalGradeMode;
  col.b -= edgeFringe * 0.85 - edgeDist * 0.012 * uVfxMode;

  // 3. KINETIC VECTOR FIELD MESH OVERLAY (motion_AGORA_VAI.aep)
  if (uVfxMode > 0.01) {
    vec2 gridScale = p * 11.0;
    vec2 cellId = floor(gridScale);
    vec2 cellUv = fract(gridScale) - 0.5;
    vec2 cellWorld = (cellId + 0.5) / 11.0;
    float dMouse = length(cellWorld - mouseP);
    float influence = exp(-dMouse * 2.2) * (0.55 + uMouseVelocity * 1.4);

    float angle = atan(mouseP.y - cellWorld.y, mouseP.x - cellWorld.x) + uTime * 0.8;
    vec2 rUv = rot2(-angle) * cellUv;
    float vectorLine = smoothstep(0.032, 0.008, abs(rUv.y)) * smoothstep(0.38, 0.1, abs(rUv.x));
    float nodeDot = smoothstep(0.08, 0.03, length(cellUv));

    vec3 vfxColor = mix(vec3(0.92, 0.16, 0.30), vec3(0.96, 0.68, 0.22), clamp(influence, 0.0, 1.0));
    col += vfxColor * (vectorLine * influence * 0.65 + nodeDot * 0.18 * (0.4 + influence)) * uVfxMode;
  }

  // 4. RAW CUT MODE (v37_final_FINAL.mov): Stark Dry Contrast & Cut Grid
  if (uRawCutMode > 0.01) {
    float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
    vec3 dryCol = mix(vec3(luma), col, 0.55);
    dryCol = smoothstep(0.02, 0.88, dryCol);
    vec2 thirdDist = abs(fract(uv * 3.0) - 0.5);
    float hairGrid = smoothstep(0.497, 0.4995, max(thirdDist.x, thirdDist.y)) * 0.08;
    dryCol += vec3(0.85, 0.85, 0.85) * hairGrid;
    col = mix(col, dryCol, uRawCutMode * 0.75);
  }

  // 5. COLOR GRADE TOGGLE (cor_aprovada_cliente2.grade):
  //    uFinalGradeMode = 1.0 -> Padrão Seu Caveira (#040404 + 35mm Grain + S-Curve)
  //    uFinalGradeMode = 0.0 -> Sem Pós / Câmera Bruta ARRI LogC3 (Flat Washed Set)
  vec3 graded = col;
  graded = clamp((graded * (2.51 * graded + 0.03)) / (graded * (2.43 * graded + 0.59) + 0.14), 0.0, 1.0);
  float vignette = smoothstep(2.35, 0.35, length(p));
  graded *= mix(0.38, 1.08, vignette);
  graded = max(graded, vec3(0.0156, 0.0156, 0.0156));

  float frameStep = floor(uTime * 24.0);
  float grain = hash12(uv * uResolution.xy * 0.65 + vec2(frameStep * 17.3, frameStep * 31.7)) - 0.5;
  float lumaMask = 1.0 - smoothstep(0.0, 0.85, dot(graded, vec3(0.299, 0.587, 0.114))) * 0.5;
  graded += grain * 0.048 * lumaMask;

  float rawLuma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  vec3 logC = log(1.0 + max(col, vec3(0.0)) * 5.5) / log(6.5);
  float logLuma = dot(logC, vec3(0.2126, 0.7152, 0.0722));
  vec3 desaturatedLog = mix(vec3(logLuma), logC, 0.24);
  vec3 rawSensor = vec3(0.165, 0.172, 0.168) + desaturatedLog * vec3(0.52, 0.54, 0.50);
  float cmosBand = sin(uv.y * uResolution.y * 0.5 + frameStep * 0.7) * 0.008 + rawLuma * 0.01;
  rawSensor += cmosBand;

  vec3 finalColor = mix(rawSensor, graded, clamp(uFinalGradeMode, 0.0, 1.0));

  gl_FragColor = vec4(finalColor, 1.0);
}
