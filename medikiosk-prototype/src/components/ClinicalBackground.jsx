import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
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