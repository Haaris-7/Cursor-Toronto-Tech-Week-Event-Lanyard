'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RigidBodyProps,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import clsx from 'clsx';

import bandTextureSrc from './lanyard.png';

const CARD_MODEL_PATH = '/card.glb';
const BAND_TWIST_STRENGTH = 0.15;

extend({ MeshLineGeometry, MeshLineMaterial });

export interface TextFields {
  name: string;
  track: string;
  tagline: string;
}

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  containerClassName?: string;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  textFields?: TextFields;
  resetKey?: number;
  videoSpin?: boolean;
  recording?: boolean;
  captureBack?: boolean;
}

export default function Lanyard({
  position = [0, 0, 11],
  gravity = [0, -30, 0],
  fov = 25,
  transparent = true,
  containerClassName,
  canvasRef,
  textFields,
  resetKey = 0,
  videoSpin = false,
  recording = false,
  captureBack = false,
}: LanyardProps) {
  const [physicsReady, setPhysicsReady] = useState(false);

  useEffect(() => {
    if ((window as any).__loaderComplete) {
      setPhysicsReady(true);
      return;
    }
    const handleLoaderComplete = () => setPhysicsReady(true);
    window.addEventListener("loader-complete", handleLoaderComplete);
    return () => window.removeEventListener("loader-complete", handleLoaderComplete);
  }, []);

  return (
    <div
      className={clsx(
        containerClassName ||
          'relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center'
      )}
    >
      <Canvas
        ref={canvasRef}
        camera={{ position, fov }}
        dpr={[1, 2]}
        gl={{ alpha: transparent, preserveDrawingBuffer: true }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics
          key={resetKey}
          gravity={gravity}
          timeStep={1 / 60}
          paused={!physicsReady}
        >
          <Band
            textFields={textFields}
            resetKey={resetKey}
            videoSpin={videoSpin}
            recording={recording}
            captureBack={captureBack}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  textFields?: TextFields;
  resetKey?: number;
  videoSpin?: boolean;
  recording?: boolean;
  captureBack?: boolean;
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  textFields,
  resetKey = 0,
  videoSpin = false,
  recording = false,
  captureBack = false,
}: BandProps) {
  const bandMesh = useRef<any>(null);
  const fixedBody = useRef<any>(null);
  const ropeSegment1 = useRef<any>(null);
  const ropeSegment2 = useRef<any>(null);
  const ropeSegment3 = useRef<any>(null);
  const cardBody = useRef<any>(null);
  const bandVisible = useRef(false);
  const spawnTime = useRef(Date.now());
  const previousTextureRef = useRef<THREE.Texture | null>(null);

  const targetPos = new THREE.Vector3();
  const angularVelocity = new THREE.Vector3();
  const cardRotation = new THREE.Vector3();
  const rayDirection = new THREE.Vector3();

  const physicsBodyProps: any = {
    type: 'dynamic' as RigidBodyProps['type'],
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(CARD_MODEL_PATH) as any;
  const bandTexture = useTexture(
    typeof bandTextureSrc === 'string' ? bandTextureSrc : bandTextureSrc.src
  ) as THREE.Texture;

  useEffect(() => {
    spawnTime.current = Date.now();
    bandVisible.current = false;
    if (bandMesh.current) bandMesh.current.visible = false;
  }, [resetKey]);

  const [cardTexture, setCardTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const baseMap = materials?.base?.map;
    if (!baseMap?.image) return;

    const name = textFields?.name || '';
    const track = textFields?.track || '';
    const tagline = textFields?.tagline || '';

    if (!name && !track && !tagline) {
      if (previousTextureRef.current) {
        previousTextureRef.current.dispose();
        previousTextureRef.current = null;
      }
      setCardTexture(null);
      return;
    }

    const draw = () => {
      const img = baseMap.image as HTMLImageElement | ImageBitmap;
      const w = (img as any).width || (img as any).naturalWidth || 1024;
      const h = (img as any).height || (img as any).naturalHeight || 1024;
      if (!w || !h) return;

      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img as CanvasImageSource, 0, 0, w, h);

      const halfW = w / 2;
      const margin = Math.round(halfW * 0.08);
      const rightX = halfW - margin;
      const leftX = margin;
      const scale = w / 1204;
      const nameY = Math.round(h * 0.68);
      const fontFamily = '"JetBrains Mono", monospace';
      const centerX = Math.round(halfW / 2);
      const nameBoundaryX = Math.round(halfW * 0.40);
      const nameMaxWidth = rightX - nameBoundaryX;
      const taglineMaxWidth = centerX - leftX;

      try { (ctx as any).wordSpacing = `${Math.round(-3 * scale)}px`; } catch {}

      const drawWrappedText = (
        text: string,
        baseY: number,
        maxW: number,
        baseFontSize: number,
        weight: string,
        color: string,
        align: CanvasTextAlign,
        anchorX: number,
      ) => {
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        let fontSize = Math.round(baseFontSize * scale);
        ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
        const lineGap = Math.round(fontSize * 0.85);

        if (ctx.measureText(text).width <= maxW) {
          ctx.fillText(text, anchorX, baseY);
          return;
        }

        const spaceIdx = text.indexOf(' ');
        if (spaceIdx !== -1) {
          let bestSplit = -1;
          for (let i = text.length - 1; i >= 0; i--) {
            if (text[i] === ' ') {
              const line1 = text.substring(0, i);
              if (ctx.measureText(line1).width <= maxW) {
                bestSplit = i;
                break;
              }
            }
          }
          if (bestSplit === -1) {
            bestSplit = spaceIdx;
          }
          const line1 = text.substring(0, bestSplit);
          const line2 = text.substring(bestSplit + 1);

          const line1W = ctx.measureText(line1).width;
          const line2W = ctx.measureText(line2).width;
          const maxLineW = Math.max(line1W, line2W);

          if (maxLineW <= maxW) {
            ctx.fillText(line1, anchorX, baseY - lineGap);
            ctx.fillText(line2, anchorX, baseY);
            return;
          }

          while (maxW > 0 && fontSize > 14) {
            fontSize -= 1;
            ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
            const l1 = ctx.measureText(line1).width;
            const l2 = ctx.measureText(line2).width;
            if (l1 <= maxW && l2 <= maxW) {
              const shrunkGap = Math.round(fontSize * 0.85);
              ctx.fillText(line1, anchorX, baseY - shrunkGap);
              ctx.fillText(line2, anchorX, baseY);
              return;
            }
          }
          const fallbackGap = Math.round(fontSize * 0.85);
          ctx.fillText(line1, anchorX, baseY - fallbackGap);
          ctx.fillText(line2, anchorX, baseY);
          return;
        }

        while (ctx.measureText(text).width > maxW && fontSize > 14) {
          fontSize -= 1;
          ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
        }
        ctx.fillText(text, anchorX, baseY);
      };

      if (name) {
        drawWrappedText(
          name.toUpperCase(),
          nameY,
          nameMaxWidth,
          52,
          '600',
          '#ffffff',
          'right',
          rightX,
        );
      }

      if (track) {
        const isProductManager = track.toLowerCase() === 'product manager';
        const baseFontSize = isProductManager ? 25 : 30;
        ctx.fillStyle = '#cccccc';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const fontSize = Math.round(baseFontSize * scale);
        ctx.font = `400 ${fontSize}px ${fontFamily}`;
        ctx.fillText(track.toUpperCase(), rightX, nameY + Math.round(48 * scale));
      }

      if (tagline) {
        drawWrappedText(
          tagline,
          nameY + Math.round(48 * scale),
          taglineMaxWidth,
          30,
          '400',
          '#ffffff',
          'left',
          leftX,
        );
      }

      const tex = new THREE.CanvasTexture(offscreen);
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;

      if (previousTextureRef.current) {
        previousTextureRef.current.dispose();
      }
      previousTextureRef.current = tex;
      setCardTexture(tex);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(draw);
    } else {
      draw();
    }
  }, [
    materials,
    textFields?.name,
    textFields?.track,
    textFields?.tagline,
  ]);

  useEffect(() => {
    return () => {
      if (previousTextureRef.current) {
        previousTextureRef.current.dispose();
        previousTextureRef.current = null;
      }
    };
  }, []);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.1, 0, 0),
        new THREE.Vector3(0.2, 0, 0),
        new THREE.Vector3(0.3, 0, 0),
      ])
  );
  const [dragged, setDragged] = useState<false | THREE.Vector3>(false);
  const [hovered, setHovered] = useState(false);

  useRopeJoint(fixedBody, ropeSegment1, [[0, 0, 0], [0, 0, 0], 1.0]);
  useRopeJoint(ropeSegment1, ropeSegment2, [[0, 0, 0], [0, 0, 0], 1.0]);
  useRopeJoint(ropeSegment2, ropeSegment3, [[0, 0, 0], [0, 0, 0], 1.0]);
  useSphericalJoint(ropeSegment3, cardBody, [
    [0, 0, 0],
    [0, 2.1, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      targetPos
        .set(state.pointer.x, state.pointer.y, 0.5)
        .unproject(state.camera);
      rayDirection.copy(targetPos).sub(state.camera.position).normalize();
      targetPos.add(rayDirection.multiplyScalar(state.camera.position.length()));
      [cardBody, ropeSegment1, ropeSegment2, ropeSegment3, fixedBody].forEach((ref) => ref.current?.wakeUp());
      cardBody.current?.setNextKinematicTranslation({
        x: targetPos.x - dragged.x,
        y: targetPos.y - dragged.y,
        z: targetPos.z - dragged.z,
      });
    }

    if (fixedBody.current) {
      if (!ropeSegment1.current || !ropeSegment2.current || !ropeSegment3.current || !cardBody.current || !bandMesh.current) return;
      const fixedPos = fixedBody.current.translation();
      const seg1Pos = ropeSegment1.current.translation();
      const seg2Pos = ropeSegment2.current.translation();
      const seg3Pos = ropeSegment3.current.translation();
      if (isNaN(fixedPos.x) || isNaN(seg1Pos.x) || isNaN(seg2Pos.x) || isNaN(seg3Pos.x)) return;

      [ropeSegment1, ropeSegment2].forEach((ref) => {
        const t = ref.current.translation();
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(t);
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(t))
        );
        ref.current.lerped.lerp(
          t,
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });

      curve.points[0].copy(seg3Pos);
      curve.points[1].copy(ropeSegment2.current.lerped);
      curve.points[2].copy(ropeSegment1.current.lerped);
      curve.points[3].copy(fixedPos);

      angularVelocity.copy(cardBody.current.angvel());
      cardRotation.copy(cardBody.current.rotation());

      const twistOffset = Math.sin(cardRotation.y) * BAND_TWIST_STRENGTH;
      curve.points[0].z += twistOffset;
      curve.points[1].z += twistOffset * 0.5;

      bandMesh.current.geometry.setPoints(curve.getPoints(32));

      if (!bandVisible.current) {
        bandMesh.current.visible = true;
        bandVisible.current = true;
      }

      const elapsed = (Date.now() - spawnTime.current) / 1000;

      if (captureBack) {
        const backQuat = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0), Math.PI
        );
        cardBody.current.setNextKinematicTranslation(cardBody.current.translation());
        cardBody.current.setNextKinematicRotation({
          x: backQuat.x, y: backQuat.y, z: backQuat.z, w: backQuat.w,
        });
      } else if (videoSpin && !dragged && elapsed > 3.0) {
        const spinElapsed = elapsed - 3.0;
        const spinDuration = 5.0;
        if (spinElapsed < spinDuration) {
          const t = spinElapsed / spinDuration;
          const peakRate = (Math.PI * Math.PI) / spinDuration;
          cardBody.current.setAngvel({
            x: 0,
            y: Math.sin(t * Math.PI) * peakRate,
            z: 0,
          });
        } else {
          cardBody.current.setAngvel({
            x: angularVelocity.x,
            y: angularVelocity.y - cardRotation.y * 0.25,
            z: angularVelocity.z,
          });
        }
      } else if (!dragged) {
        cardBody.current.setAngvel({
          x: angularVelocity.x,
          y: angularVelocity.y - cardRotation.y * 0.25,
          z: angularVelocity.z,
        });
      }
    }
  });

  curve.curveType = 'chordal';
  bandTexture.wrapS = bandTexture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 5, 0]}>
        <RigidBody
          ref={fixedBody}
          {...physicsBodyProps}
          type={'fixed' as RigidBodyProps['type']}
        />
        <RigidBody
          position={[0.5, 0, 0]}
          ref={ropeSegment1}
          {...physicsBodyProps}
          type={'dynamic' as RigidBodyProps['type']}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1, 0, 0]}
          ref={ropeSegment2}
          {...physicsBodyProps}
          type={'dynamic' as RigidBodyProps['type']}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1.5, 0, 0]}
          ref={ropeSegment3}
          {...physicsBodyProps}
          type={'dynamic' as RigidBodyProps['type']}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={cardBody}
          {...physicsBodyProps}
          type={
            (dragged || captureBack)
              ? ('kinematicPosition' as RigidBodyProps['type'])
              : ('dynamic' as RigidBodyProps['type'])
          }
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.75}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => { if (!recording) setHovered(true); }}
            onPointerOut={() => setHovered(false)}
            onPointerUp={(e: any) => {
              if (recording) return;
              e.target.releasePointerCapture(e.pointerId);
              setDragged(false);
            }}
            onPointerDown={(e: any) => {
              if (recording) return;
              e.target.setPointerCapture(e.pointerId);
              setDragged(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(targetPos.copy(cardBody.current.translation()))
              );
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardTexture || materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh
              geometry={nodes.clamp.geometry}
              material={materials.metal}
            />
          </group>
        </RigidBody>
      </group>
      <mesh
        ref={(el: any) => {
          bandMesh.current = el;
          if (el && !bandVisible.current) el.visible = false;
        }}
        frustumCulled={false}
      >
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[1000, 1000]}
          useMap
          map={bandTexture}
          repeat={[-2, 1]}
          lineWidth={0.7}
        />
      </mesh>
    </>
  );
}
