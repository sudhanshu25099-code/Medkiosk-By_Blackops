# Recreate this Three.js scene: Soft Clinical Abstract

You are an expert Three.js creative developer. Produce a **single self-contained `index.html`**
that renders a calm, modern, and trustworthy background scene for a medical AI kiosk (MediKiosk) — exactly as specified below. Load Three.js **r0.143.0** via an ES-module importmap from unpkg; no build step, no bundler, pure ES modules in one `<script type="module">`. Hardcode every value given here as fixed constants.

## What it looks like
A soft, slow-moving abstract fluid mesh that gently undulates, providing a clean, calming "clinical" backdrop. The colors are predominantly crisp white, soft medical blue, and gentle teal. The camera looks slightly down at the mesh. As the user moves the cursor, the mesh subtly ripples or tilts to create a gentle, interactive, and modern feel without being distracting. The overall vibe is premium, accessible, and healthcare-focused.

## Page & boilerplate
- importmap: `three` → `https://unpkg.com/three@0.143.0/build/three.module.js`, `three/addons/` → `https://unpkg.com/three@0.143.0/examples/jsm/`.
- Clean page (`html, body { margin:0; padding:0; background:#f0f4f8; overflow: hidden; }`). A full-window fixed `<canvas id="scene">` (`position:fixed; inset:0; width:100vw; height:100vh; display:block; z-index:-1;`).
- Renderer: `new THREE.WebGL1Renderer({ canvas, antialias:true, alpha:true })`, `setPixelRatio(window.devicePixelRatio)`.
- Scene background: `0xf0f4f8`; fog `new THREE.FogExp2(0xf0f4f8, 0.03)`.
- Camera: `new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 100)` at `(0, -8, 12)`. Look at `(0, 0, 0)`.

## Fixed parameters (bake these in)
```js
const CONFIG = {
  bgColor: '#f0f4f8',      // Soft medical off-white
  colorA: '#0056b3',       // Clinical deep blue
  colorB: '#00a6e0',       // Vibrant medical cyan
  colorC: '#ffffff',       // Crisp white
  waveSpeed: 0.3,          // Slow, calming undulation (like breathing)
  waveHeight: 1.2,
  interactiveRipple: 0.4,
}
```

## Geometry & Material
A single `PlaneGeometry(60, 60, 128, 128)` rotated flat (`rotation.x = 0`).

`ShaderMaterial` with `transparent: true`, `wireframe: false`, `side: THREE.DoubleSide`.

Uniforms: `uTime: { value: 0 }`, `uColorA: { value: new THREE.Color('#0056b3') }`, `uColorB: { value: new THREE.Color('#00a6e0') }`, `uColorC: { value: new THREE.Color('#ffffff') }`, `uMouse: { value: new THREE.Vector2(0,0) }`.

Vertex shader (soft waves + mouse interaction):
```glsl
uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;
varying float vElevation;

// Classic 2D Perlin Noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float cnoise(vec2 P) {
  vec2 i = floor(P);
  vec2 f = fract(P);
  vec2 u = f*f*(3.0-2.0*f);
  float n = mix(mix(dot(-1.0+2.0*fract(permute(i.y + vec3(0.0, 1.0, 2.0))*2.0/7.0), vec2(f.x, f.y)), 
                    dot(-1.0+2.0*fract(permute(i.y + 1.0 + vec3(0.0, 1.0, 2.0))*2.0/7.0), vec2(f.x-1.0, f.y)), u.x),
                mix(dot(-1.0+2.0*fract(permute(i.y + vec3(0.0, 1.0, 2.0))*2.0/7.0), vec2(f.x, f.y-1.0)), 
                    dot(-1.0+2.0*fract(permute(i.y + 1.0 + vec3(0.0, 1.0, 2.0))*2.0/7.0), vec2(f.x-1.0, f.y-1.0)), u.x), u.y);
  return n;
}

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // Create smooth, calming waves using Perlin noise
  float elevation = cnoise(pos.xy * 0.1 + uTime * 0.2) * 1.5;
  elevation += cnoise(pos.xy * 0.2 - uTime * 0.1) * 0.5;
  
  // Interactive ripple based on mouse proximity
  float dist = distance(pos.xy, uMouse * 15.0);
  float ripple = sin(dist * 1.5 - uTime * 3.0) * exp(-dist * 0.15);
  elevation += ripple * 0.4;
  
  pos.z += elevation;
  vElevation = elevation;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

Fragment shader (clean medical gradient):
```glsl
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
varying vec2 vUv;
varying float vElevation;

void main() {
  // Mix colors based on elevation for a soft gradient look
  float mixRatio = (vElevation + 2.0) * 0.3;
  vec3 color = mix(uColorC, uColorB, mixRatio);
  color = mix(color, uColorA, smoothstep(0.7, 1.5, mixRatio));
  
  // Keep it bright, clinical and unobtrusive
  gl_FragColor = vec4(color, 0.9);
}
```

## Animation & interaction
**Pointer:** Track mouse movement. Map `clientX` and `clientY` to normalized device coordinates (NDC) `[-1, 1]`. 
Per frame: Smoothly interpolate the `uMouse` uniform toward the current NDC (`uMouse.lerp(targetMouse, 0.05)`) to create a gentle delayed reaction in the ripple effect.
Gently rotate the entire mesh group slightly based on the mouse position for a subtle parallax effect (`mesh.rotation.x = uMouse.y * 0.05`, `mesh.rotation.y = uMouse.x * 0.05`).

**Render loop (`requestAnimationFrame`):**
- Update `uTime.value = performance.now() / 1000`.
- Advance the mouse lerps.
- `renderer.render(scene, camera)`.

**Resize:**
Update renderer size, pixel ratio, and camera aspect ratio on window resize.

## Aesthetic Goal
The result must feel like a premium, trustworthy healthcare application. It should NOT be distracting. The movement should be almost imperceptible like slow breathing, creating a sense of calm for patients using the kiosk, while clearly using the "clinical blue on white" brand colors mentioned in the specifications.