import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ParapenteConfigurator() {
  const [span, setSpan] = useState(11.0);
  const [archRadius, setArchRadius] = useState(14.8);
  const [taperRatio, setTaperRatio] = useState(0.55);
  const [viewMode, setViewMode] = useState('3d');

  const mountRef = useRef(null);

  // 3D Three.js STL Renderer
  useEffect(() => {
    if (viewMode !== '3d' || !mountRef.current) return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);

    const camera = new THREE.PerspectiveCamera(45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x374151, 0x1f2937);
    scene.add(gridHelper);

    // Load generated STL file from public/ folder
    const loader = new STLLoader();
    loader.load('./canopy.stl', (geometry) => {
      geometry.center();
      const material = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.3,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [viewMode]);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', background: '#0f172a', color: '#f8fafc' }}>
      {/* Sidebar Controls */}
      <div style={{ width: '320px', padding: '24px', borderRight: '1px solid #334155', background: '#1e293b' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Parapente Arc Mark Lab</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Viewport Mode:</label>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569' }}
          >
            <option value="3d">3D Web Viewer (STL Mesh)</option>
            <option value="2d">2D Math Blueprint</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px' }}>Wingspan: {span} m</label>
          <input type="range" min="6" max="18" step="0.5" value={span} onChange={(e) => setSpan(parseFloat(e.target.value))} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px' }}>Arch Radius: {archRadius} m</label>
          <input type="range" min="8" max="25" step="0.5" value={archRadius} onChange={(e) => setArchRadius(parseFloat(e.target.value))} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px' }}>Taper Ratio: {taperRatio}</label>
          <input type="range" min="0.3" max="0.9" step="0.05" value={taperRatio} onChange={(e) => setTaperRatio(parseFloat(e.target.value))} style={{ width: '100%' }} />
        </div>

        <div style={{ marginTop: '30px', background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
          <h4 style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Python CLI Generator</h4>
          <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8', wordBreak: 'break-all', margin: 0 }}>
            python parapente_arc_mark_3d.py --export canopy.stl --span {span} --arch-radius {archRadius} --taper-ratio {taperRatio}
          </p>
        </div>
      </div>

      {/* Main Display Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {viewMode === '3d' ? (
          <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
            <h3>2D Parametric Blueprint Mode</h3>
          </div>
        )}
      </div>
    </div>
  );
}