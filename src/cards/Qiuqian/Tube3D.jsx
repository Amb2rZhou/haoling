import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';

// scratch 对象，避免每帧 new
const _scratchBaseQ = new THREE.Quaternion();
const _scratchOffsetQ = new THREE.Quaternion();
const _scratchFinalQ = new THREE.Quaternion();
const _scratchEuler = new THREE.Euler();
const _scratchUp = new THREE.Vector3();
const _scratchDir = new THREE.Vector3();
const _scratchVec1 = new THREE.Vector3();
const _scratchVec2 = new THREE.Vector3();
const _scratchMatrix = new THREE.Matrix4();
const _Y_AXIS = new THREE.Vector3(0, 1, 0);
const SCALE_OUTER = 0.7; // 外层 group 的 scale，反向除以它把世界坐标换算回 Tube local

const TUBE_MAX_R = 0.41; // 签上端中心最远到此（签外边贴筒内壁 0.49 留 margin）

// 签的 2D 轮廓：长方形主体 + 顶部楔形尖头（铅笔削尖样）
function makeStickShape(width, length) {
  const w = width / 2;
  const tipLen = length * 0.10; // 尖头占总长 10%
  const shape = new THREE.Shape();
  shape.moveTo(-w, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w, length - tipLen);
  shape.lineTo(0, length);
  shape.lineTo(-w, length - tipLen);
  shape.closePath();
  return shape;
}
const STICK_WIDTH = 0.12;     // 宽（X 方向）
const STICK_THICKNESS = 0.035; // 厚（Z 方向）
const STICK_LENGTH = 2.2;
const STICK_SHAPE = makeStickShape(STICK_WIDTH, STICK_LENGTH);
const STICK_EXTRUDE = { depth: STICK_THICKNESS, bevelEnabled: false };

// 生成中文标签贴图：竖排"上上签"等，小篆字体
function makeLabelTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#3a2208';
  ctx.font = '92px "SanjiXiaoZhuan", "Songti SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const chars = [...text];
  const lineHeight = canvas.height / (chars.length + 1);
  chars.forEach((c, i) => {
    ctx.fillText(c, canvas.width / 2, lineHeight * (i + 1));
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

// hook：等小篆字体加载完成
function useXiaoZhuanLoaded() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (document.fonts && document.fonts.load) {
      document.fonts.load('92px "SanjiXiaoZhuan"').then(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  }, []);
  return loaded;
}

// 让摄像机略微向上看（瞄准筒口附近），保证签顶进画面
function CameraTarget() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0.4, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

// 简单 LCG 伪随机，固定种子保证每次刷新签的位置一致
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// 生成 N 根自然倾斜、下端落筒底、向上斜出筒口的签
function generateSticks(count, seed = 42) {
  const rng = makeRng(seed);
  const TUBE_INNER_R = 0.42;
  const STICK_LEN = 2.2;
  const FLOOR_Y = -0.66; // 贴筒底盖顶面（底盖 center=-0.68 厚 0.04）
  const sticks = [];

  for (let i = 0; i < count; i++) {
    // 上端：在筒口沿圆周均匀分布 + 随机偏移，外边贴筒壁
    const a2 = (i / count) * Math.PI * 2 + (rng() - 0.5) * 0.5;
    const r2 = TUBE_INNER_R * (0.94 + rng() * 0.02); // r2 ≈ 0.395-0.403
    const upY = 0.62 + rng() * 0.13;
    const P2 = new THREE.Vector3(
      Math.cos(a2) * r2,
      upY,
      Math.sin(a2) * r2
    );

    // 下端：筒底中心附近（多根签底部聚拢），方位与 P2 相近
    const a1 = a2 + (rng() - 0.5) * 0.6;
    const r1 = TUBE_INNER_R * (rng() * 0.22);
    const P1 = new THREE.Vector3(
      Math.cos(a1) * r1,
      FLOOR_Y + rng() * 0.05,
      Math.sin(a1) * r1
    );

    const dir = P2.clone().sub(P1).normalize();
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    // 让签的宽面对齐筒壁切线方向（宽面贴壁，窄边朝筒中心，符合物理）
    const tangent = new THREE.Vector3(-Math.sin(a2), 0, Math.cos(a2));
    const quatInv = quat.clone().invert();
    const tLocal = tangent.clone().applyQuaternion(quatInv);
    const spin = Math.atan2(tLocal.z, tLocal.x) + (rng() - 0.5) * 0.35; // 加点抖动

    sticks.push({
      P1: P1.toArray(),
      baseQuat: [quat.x, quat.y, quat.z, quat.w],
      spin,
      len: STICK_LEN,
      seed: rng(),
    });
  }
  return sticks;
}

// 八角柱签筒
function Tube({ phase, chosenIndex, chosenLabel }) {
  const fontReady = useXiaoZhuanLoaded();
  const labelTexture = useMemo(
    () => (fontReady ? makeLabelTexture(chosenLabel || '上签') : null),
    [chosenLabel, fontReady]
  );
  const groupRef = useRef();
  const shakeStartRef = useRef(0);
  const sticks = useMemo(() => generateSticks(9), []);
  const stickRefs = useRef([]);
  // 每根签的物理状态：theta (倾角 X/Z) + omega (角速度) + protrude (沿签轴突出量)
  const stickStatesRef = useRef(null);
  if (!stickStatesRef.current || stickStatesRef.current.length !== sticks.length) {
    stickStatesRef.current = sticks.map(() => ({
      thetaX: 0, thetaZ: 0, omegaX: 0, omegaZ: 0, protrude: 0,
    }));
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.033); // cap dt 防爆

    // 1. 整个桶摇晃（shaking 后半程逐渐减弱，给"突出"让位）
    if (phase === 'shaking') {
      if (shakeStartRef.current === 0) shakeStartRef.current = state.clock.elapsedTime;
      const t = state.clock.elapsedTime - shakeStartRef.current;
      // 摇晃强度：前 0.9s 全力，0.9s 后线性衰减到 0
      const shakeIntensity = t < 0.9 ? 1 : Math.max(0, 1 - (t - 0.9) / 0.9);
      groupRef.current.rotation.z = Math.sin(t * 18) * 0.25 * shakeIntensity;
      groupRef.current.rotation.x = Math.sin(t * 22) * 0.15 * shakeIntensity;
      groupRef.current.position.y = Math.abs(Math.sin(t * 24)) * 0.08 * shakeIntensity;
    } else {
      shakeStartRef.current = 0;
      groupRef.current.rotation.z *= 0.85;
      groupRef.current.rotation.x *= 0.85;
      groupRef.current.position.y *= 0.85;
    }

    // 2. 签：velocity-based 倒立摆物理 + 碰壁反弹 + chosen 签爬升
    const K_SPRING = 30;
    const DAMP = 2.5;
    const DRIVE_AMP = 22;
    const BOUNCE = 0.55;
    const CHOSEN_PROTRUDE_MAX = 0.85; // chosen 签最终爬升的距离
    const shakeT = phase === 'shaking' && shakeStartRef.current
      ? state.clock.elapsedTime - shakeStartRef.current
      : 0;

    sticks.forEach((s, i) => {
      const g = stickRefs.current[i];
      const st = stickStatesRef.current[i];
      if (!g) return;
      const baseQ = _scratchBaseQ.fromArray(s.baseQuat);
      const isChosen = i === chosenIndex;

      // 力：driving + spring + damp（chosen 签后半程驱动减弱，让它稳定爬升）
      let accX = -K_SPRING * st.thetaX - DAMP * st.omegaX;
      let accZ = -K_SPRING * st.thetaZ - DAMP * st.omegaZ;
      if (phase === 'shaking') {
        const t = state.clock.elapsedTime + s.seed * 13;
        const driveScale = isChosen && shakeT > 0.9
          ? Math.max(0.15, 1 - (shakeT - 0.9) / 0.6)
          : (shakeT > 0.9 ? Math.max(0.3, 1 - (shakeT - 0.9) / 1.2) : 1);
        accX += Math.sin(t * 8 + s.seed * 3) * DRIVE_AMP * driveScale;
        accZ += Math.cos(t * 9 + s.seed * 7) * DRIVE_AMP * driveScale;
      }
      st.omegaX += accX * dt;
      st.omegaZ += accZ * dt;
      st.thetaX += st.omegaX * dt;
      st.thetaZ += st.omegaZ * dt;

      // 应用：base quat × Euler(thetaX, 0, thetaZ)
      _scratchEuler.set(st.thetaX, 0, st.thetaZ);
      _scratchOffsetQ.setFromEuler(_scratchEuler);
      _scratchFinalQ.copy(baseQ).multiply(_scratchOffsetQ);

      // 碰壁检测
      _scratchUp.copy(_Y_AXIS).applyQuaternion(_scratchFinalQ);
      const upX = s.P1[0] + _scratchUp.x * s.len;
      const upZ = s.P1[2] + _scratchUp.z * s.len;
      const upR = Math.sqrt(upX * upX + upZ * upZ);

      if (upR > TUBE_MAX_R) {
        const nX = upX / upR;
        const nZ = upZ / upR;
        const ratio = TUBE_MAX_R / upR;
        st.thetaX *= ratio;
        st.thetaZ *= ratio;
        const omegaRadial = st.omegaX * nX + st.omegaZ * nZ;
        if (omegaRadial > 0) {
          const corr = -(1 + BOUNCE) * omegaRadial;
          st.omegaX += corr * nX;
          st.omegaZ += corr * nZ;
        }
        _scratchEuler.set(st.thetaX, 0, st.thetaZ);
        _scratchOffsetQ.setFromEuler(_scratchEuler);
        _scratchFinalQ.copy(baseQ).multiply(_scratchOffsetQ);
      }

      // chosen 签：从 0.9s 开始沿轴向爬升，stay protruded in 'drawn'
      let protrudeTarget = 0;
      if (isChosen) {
        if (phase === 'shaking' && shakeT > 0.9) {
          protrudeTarget = Math.min(1, (shakeT - 0.9) / 0.9) * CHOSEN_PROTRUDE_MAX;
        } else if (phase === 'drawn' || phase === 'revealing') {
          protrudeTarget = CHOSEN_PROTRUDE_MAX;
        }
      }
      st.protrude += (protrudeTarget - st.protrude) * Math.min(1, dt * 6);

      // chosen 签在 revealing/drawn：飞到摄像机前并翻转，宽面（有字）正对摄像机
      if (isChosen && (phase === 'revealing' || phase === 'drawn')) {
        const cam = state.camera;
        _scratchDir.set(0, 0, 0);
        cam.getWorldDirection(_scratchDir); // forward (cam 看向的方向)
        const camUp = _scratchUp.set(0, 1, 0).applyQuaternion(cam.quaternion);
        const camRight = _scratchVec2.set(1, 0, 0).applyQuaternion(cam.quaternion);

        // 屏幕中央世界位置：摄像机前 2.8 单位
        const FLY_DISTANCE = 2.8;
        const centerWorld = _scratchVec1.copy(cam.position).add(
          _scratchDir.clone().multiplyScalar(FLY_DISTANCE)
        );
        const halfLenWorld = (s.len * SCALE_OUTER) / 2;
        centerWorld.sub(camUp.clone().multiplyScalar(halfLenWorld));
        const targetPos = centerWorld.divideScalar(SCALE_OUTER);

        // 目标 quaternion：签 +Y 朝 camUp，宽面 +Z 朝摄像机（即 -forward）
        // makeBasis 第三参数取反 forward，让 mesh local +Z 指向摄像机
        const backDir = _scratchDir.clone().negate();
        // 为了保持右手系，X 也取反（X × Y = Z）
        const flippedRight = camRight.clone().negate();
        _scratchMatrix.makeBasis(flippedRight, camUp, backDir);
        const targetQ = _scratchOffsetQ.setFromRotationMatrix(_scratchMatrix);

        const lerpSpeed = Math.min(1, dt * 3);
        g.position.lerp(targetPos, lerpSpeed);
        g.quaternion.slerp(targetQ, lerpSpeed);
      } else {
        // 沿签的 final 方向偏移 P1（pivot 跟着抬高）
        _scratchUp.copy(_Y_AXIS).applyQuaternion(_scratchFinalQ);
        g.position.set(
          s.P1[0] + _scratchUp.x * st.protrude,
          s.P1[1] + _scratchUp.y * st.protrude,
          s.P1[2] + _scratchUp.z * st.protrude
        );
        g.quaternion.copy(_scratchFinalQ);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* 外壁 */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 1.4, 8, 1, true]} />
        <meshStandardMaterial
          color="#c8c8cc"
          roughness={0.55}
          metalness={0.08}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* 内壁 */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.49, 0.49, 1.38, 8, 1, true]} />
        <meshStandardMaterial
          color="#9a9a9e"
          roughness={0.85}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 筒口顶环 */}
      <mesh position={[0, 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.49, 0.55, 8]} />
        <meshStandardMaterial
          color="#b8b8bc"
          roughness={0.55}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 筒底封盖 */}
      <mesh position={[0, -0.68, 0]} receiveShadow>
        <cylinderGeometry args={[0.49, 0.49, 0.04, 8]} />
        <meshStandardMaterial
          color="#7e7e82"
          roughness={0.9}
        />
      </mesh>

      {/* 签：带斜切顶面的扁条 + 旋转随机让斜面朝不同方向 */}
      {sticks.map((s, i) => {
        const isChosen = i === chosenIndex;
        // 只在 reveal/drawn 阶段才让 chosen 签和其他签颜色区分（摇晃时不剧透）
        const showChosenStyle = isChosen && (phase === 'revealing' || phase === 'drawn');
        return (
          <group
            key={i}
            ref={(el) => (stickRefs.current[i] = el)}
            position={s.P1}
            quaternion={s.baseQuat}
          >
            <group rotation={[0, showChosenStyle ? 0 : s.spin, 0]}>
              <mesh position={[0, 0, -STICK_THICKNESS / 2]} castShadow>
                <extrudeGeometry args={[STICK_SHAPE, STICK_EXTRUDE]} />
                <meshStandardMaterial
                  color={showChosenStyle ? '#f4d77a' : '#f0e1a0'}
                  roughness={0.65}
                  metalness={showChosenStyle ? 0.15 : 0.03}
                  emissive={showChosenStyle ? '#d4af37' : '#000'}
                  emissiveIntensity={showChosenStyle ? (phase === 'drawn' ? 0.35 : 0.18) : 0}
                />
              </mesh>
              {/* chosen 签下半部分：竖排"上上签"等文字贴图（等小篆字体加载完）*/}
              {showChosenStyle && labelTexture && (
                <mesh position={[0, s.len * 0.22, STICK_THICKNESS / 2 + 0.001]}>
                  <planeGeometry args={[STICK_WIDTH * 0.85, s.len * 0.35]} />
                  <meshBasicMaterial map={labelTexture} transparent />
                </mesh>
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
}

export default function Tube3D({ phase, chosenIndex = 0, chosenLabel = '上签', onTubeClick, allowOrbit = true }) {
  return (
    <Canvas
      shadows
      camera={{ position: [2.6, 2.0, 3.6], fov: 32 }}
      style={{ width: '100%', height: '100%' }}
      onClick={onTubeClick}
    >
      <CameraTarget />
      {/* 灯光 */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[3, 5, 3]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight position={[-2, 2, -1]} intensity={0.3} color="#fff5e0" />

      {/* 半透明地面：接住阴影但融入暗背景 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.72, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.35} />
      </mesh>

      <group scale={0.7}>
        <Tube phase={phase} chosenIndex={chosenIndex} chosenLabel={chosenLabel} />
      </group>

      {allowOrbit && (
        <OrbitControls
          enabled={phase === 'idle' || phase === 'shaking'}
          enablePan={false}
          enableZoom={false}
          target={[0, 0.4, 0]}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={phase === 'idle'}
          autoRotateSpeed={0.6}
        />
      )}

      {/* revealing/drawn 阶段：真 DOF，chosen 签清晰，后方筒+其他签虚化 */}
      {(phase === 'revealing' || phase === 'drawn') && (
        <EffectComposer>
          <DepthOfField
            worldFocusDistance={2.8}  // 直接给世界距离：chosen 签飞到的位置
            worldFocusRange={1.0}     // 对焦清晰范围 ±0.5 单位
            bokehScale={6}            // 模糊圈大小（越大背景越糊）
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
