import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElevation;

  vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289v3(((x*34.0)+1.0)*x); }

  float cnoise(vec2 P) {
    vec2 i = floor(P);
    vec2 f = fract(P);
    vec2 u = f*f*(3.0-2.0*f);
    vec2 i0 = mod289v2(i);
    vec2 i1 = mod289v2(i + vec2(1.0));
    vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x);
    vec4 iy = vec4(i0.y, i0.y, i1.y, i1.y);
    vec4 ixy = ix + iy;
    vec4 ixy0 = mod289v3(vec3(ixy.xy, 0.0)).xyxy;
    vec4 ixy1 = mod289v3(vec3(ixy.zw, 0.0)).xyxy;
    vec4 gx0 = fract(permute(ixy0.xzxz) / 41.0) * 2.0 - 1.0;
    vec4 gy0 = abs(gx0) - 0.5;
    vec4 tx0 = floor(gx0 + 0.5);
    gx0 = gx0 - tx0;
    vec4 gx1 = fract(permute(ixy1.xzxz) / 41.0) * 2.0 - 1.0;
    vec4 gy1 = abs(gx1) - 0.5;
    vec4 tx1 = floor(gx1 + 0.5);
    gx1 = gx1 - tx1;
    vec4 g0 = vec4(gx0.x, gy0.x, gx0.y, gy0.y);
    vec4 g1 = vec4(gx0.z, gy0.z, gx0.w, gy0.w);
    vec4 g2 = vec4(gx1.x, gy1.x, gx1.y, gy1.y);
    vec4 g3 = vec4(gx1.z, gy1.z, gx1.w, gy1.w);
    vec4 norm0 = 1.79284291400159 - 0.85373472095314 * vec4(dot(g0.xy,g0.xy), dot(g0.zw,g0.zw), dot(g1.xy,g1.xy), dot(g1.zw,g1.zw));
    g0 *= norm0.xxzz;
    g1 *= norm0.yyww;
    vec4 norm1 = 1.79284291400159 - 0.85373472095314 * vec4(dot(g2.xy,g2.xy), dot(g2.zw,g2.zw), dot(g3.xy,g3.xy), dot(g3.zw,g3.zw));
    g2 *= norm1.xxzz;
    g3 *= norm1.yyww;
    vec2 f0 = vec2(f.x, f.y);
    vec2 f1 = vec2(f.x-1.0, f.y);
    vec2 f2 = vec2(f.x, f.y-1.0);
    vec2 f3 = vec2(f.x-1.0, f.y-1.0);
    float n00 = dot(g0.xy, f0);
    float n10 = dot(g0.zw, f1);
    float n01 = dot(g1.xy, f2);
    float n11 = dot(g1.zw, f3);
    float nx0 = mix(n00, n10, u.x);
    float nx1 = mix(n01, n11, u.x);
    return 2.3 * mix(nx0, nx1, u.y);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float elevation = cnoise(pos.xy * 0.10 + uTime * 0.18) * 1.4;
    elevation += cnoise(pos.xy * 0.22 - uTime * 0.09) * 0.55;
    elevation += cnoise(pos.xy * 0.40 + uTime * 0.14) * 0.20;

    float dist = distance(pos.xy, uMouse * 16.0);
    float ripple = sin(dist * 1.4 - uTime * 2.8) * exp(-dist * 0.18);
    elevation += ripple * 0.45;

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
    float mixRatio = clamp((vElevation + 2.0) * 0.28, 0.0, 1.0);
    vec3 color = mix(uColorC, uColorB, mixRatio);
    color = mix(color, uColorA, smoothstep(0.65, 1.0, mixRatio));
    gl_FragColor = vec4(color, 0.92);
  }
`;

export default function ClinicalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#eef3f9');
    scene.fog = new THREE.FogExp2('#eef3f9', 0.025);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, -9, 14);
    camera.lookAt(0, 0, 0);

    const geometry = new THREE.PlaneGeometry(60, 60, 120, 120);

    const material = new THREE.ShaderMaterial({
      transparent: true,
      wireframe: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTime:   { value: 0 },
        uColorA: { value: new THREE.Color('#0a4f9e') },
        uColorB: { value: new THREE.Color('#0096d6') },
        uColorC: { value: new THREE.Color('#d6eeff') },
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
      mesh.rotation.x = targetMouse.y * 0.04;
      mesh.rotation.y = targetMouse.x * 0.04;
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
