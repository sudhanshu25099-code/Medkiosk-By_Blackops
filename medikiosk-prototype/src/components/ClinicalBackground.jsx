import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElevation;

  // Classic 2D Perlin Noise
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod289(Pi);
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;

    vec4 i = permute(permute(ix) + iy);

    vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;

    vec2 g00 = vec2(gx.x, gy.x);
    vec2 g10 = vec2(gx.y, gy.y);
    vec2 g01 = vec2(gx.z, gy.z);
    vec2 g11 = vec2(gx.w, gy.w);

    vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g10, g10), dot(g01, g01), dot(g11, g11)));
    g00 *= norm.x;
    g10 *= norm.y;
    g01 *= norm.z;
    g11 *= norm.w;

    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));

    vec2 fade_xy = Pf.xy * Pf.xy * (3.0 - 2.0 * Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Create smooth, calming waves using Perlin noise
    float elevation = cnoise(pos.xy * 0.1 + vec2(uTime * 0.2)) * 1.5;
    elevation += cnoise(pos.xy * 0.2 - vec2(uTime * 0.1)) * 0.5;
    
    // Interactive ripple based on mouse proximity
    float dist = distance(pos.xy, uMouse * 15.0);
    float ripple = sin(dist * 1.5 - uTime * 3.0) * exp(-dist * 0.15);
    elevation += ripple * 0.4;
    
    pos.z += elevation;
    vElevation = elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
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
`;

export default function ClinicalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f0f4f8');
    scene.fog = new THREE.FogExp2('#f0f4f8', 0.03);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, -8, 12);
    camera.lookAt(0, 0, 0);

    const geometry = new THREE.PlaneGeometry(60, 60, 128, 128);

    const material = new THREE.ShaderMaterial({
      transparent: true,
      wireframe: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTime:   { value: 0 },
        uColorA: { value: new THREE.Color('#0056b3') },
        uColorB: { value: new THREE.Color('#00a6e0') },
        uColorC: { value: new THREE.Color('#ffffff') },
        uMouse:  { value: new THREE.Vector2(0, 0) },
      },
      vertexShader,
      fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const targetMouse = new THREE.Vector2(0, 0);
    const handleMouse = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouse);

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = performance.now() / 1000;
      material.uniforms.uTime.value = t;
      material.uniforms.uMouse.value.lerp(targetMouse, 0.05);
      mesh.rotation.x = targetMouse.y * 0.05;
      mesh.rotation.y = targetMouse.x * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        display: 'block',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}