'use client';

import { Component, ReactNode, Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';

function ControllerModel({ onReady }: { onReady: () => void }) {
  const gltf = useGLTF('/models/model.glb');
  useEffect(() => {
    onReady();
  }, [gltf, onReady]);

  return <primitive object={gltf.scene} scale={1.05} rotation={[0.2, 0.4, 0]} position={[0, -0.6, 0]} />;
}

type SceneBoundaryState = {
  hasError: boolean;
};

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, SceneBoundaryState> {
  state: SceneBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export function ControllerScene() {
  const [ready, setReady] = useState(false);

  const fallback = (
    <div className='flex h-full flex-col items-center justify-center gap-3 rounded-[1.8rem] border border-white/10 bg-black/[0.45] p-6 text-center'>
      <div className='hud-label'>3D Deck</div>
      <div className='font-heading text-base uppercase tracking-[0.28em] text-white'>Controller Preview Offline</div>
      <div className='max-w-xs text-sm text-secondary'>Local model fallback is active. The rest of the dashboard remains fully usable.</div>
    </div>
  );

  return (
    <div className='glass panel-glow relative h-[280px] w-full overflow-hidden rounded-[1.8rem]' style={{ contain: 'strict' }}>
      {!ready && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
          <div className='rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-secondary'>Initializing local model...</div>
        </div>
      )}

      <SceneErrorBoundary fallback={fallback}>
        <Canvas
          camera={{ position: [0, 1.2, 4], fov: 45 }}
          dpr={[1, 1.5]}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight intensity={1.4} position={[3, 4, 2]} />
            <ControllerModel onReady={() => setReady(true)} />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              autoRotate
              autoRotateSpeed={3}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.8}
            />
            <Environment preset='city' />
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}

useGLTF.preload('/models/model.glb');
