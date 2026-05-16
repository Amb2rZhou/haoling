import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SIGN_POOL, PERSONA_TO_SIGN } from '../../data/qiuqianSigns';
import { useShake, requestMotionPermission, hasMotionSensor } from './useShake';
import Tube3D from './Tube3D';
import styles from './Qiuqian.module.css';

const STATES = {
  IDLE: 'idle',
  SHAKING: 'shaking',
  REVEALING: 'revealing', // chosen 签已突出，停留让用户看清，再切签文
  DRAWN: 'drawn',
};

export default function Qiuqian({ personaId, active }) {
  const [phase, setPhase] = useState(STATES.IDLE);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [needsPerm, setNeedsPerm] = useState(
    hasMotionSensor() &&
      typeof window.DeviceMotionEvent?.requestPermission === 'function'
  );

  const mapping = PERSONA_TO_SIGN[personaId];
  const sign = useMemo(
    () => SIGN_POOL.find((s) => s.id === mapping.signId),
    [mapping.signId]
  );

  useEffect(() => {
    setPhase(STATES.IDLE);
  }, [personaId, active]);

  // 每次抽签前重选 chosenStick（让"摇出的是哪根"看起来真的随机）
  const [chosenIndex, setChosenIndex] = useState(0);

  function startDraw() {
    if (phase !== STATES.IDLE) return;
    setChosenIndex(Math.floor(Math.random() * 9));
    setPhase(STATES.SHAKING);
    // 时序：shaking 2.2s → revealing（chosen 签飞到屏幕前，等用户点击）
    setTimeout(() => setPhase(STATES.REVEALING), 2200);
  }

  function handleTubeClick() {
    if (phase === STATES.IDLE) startDraw();
    else if (phase === STATES.REVEALING) setPhase(STATES.DRAWN);
  }

  const [manifested, setManifested] = useState(false);
  function handleManifest() {
    if (phase !== STATES.DRAWN) return;
    setManifested(true);
  }

  // 显化粒子配置（component 生命周期内只算一次，stable）
  const particles = useMemo(
    () =>
      Array.from({ length: 44 }).map((_, i) => {
        const angle = (i / 44) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
        const distance = 180 + Math.random() * 220;
        return {
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          size: 4 + Math.random() * 7,
          duration: 1.1 + Math.random() * 0.9,
          delay: Math.random() * 0.15,
        };
      }),
    []
  );

  useShake({
    onShake: startDraw,
    enabled: motionEnabled && active && phase === STATES.IDLE,
  });

  async function handleEnableMotion(e) {
    e.stopPropagation();
    const ok = await requestMotionPermission();
    setMotionEnabled(ok);
    setNeedsPerm(false);
  }

  return (
    <div className={styles.bg}>
      <div className={styles.glow} />

      {needsPerm && phase === STATES.IDLE && (
        <button className={styles.permBtn} onClick={handleEnableMotion}>
          点此开启摇一摇感应
        </button>
      )}

      <AnimatePresence mode="wait">
        {phase !== STATES.DRAWN ? (
          <motion.div
            key="tube"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className={styles.tubeStage}
          >
            <div className={styles.tubeWrap}>
              <Tube3D
                phase={phase === STATES.REVEALING ? STATES.DRAWN : phase}
                chosenIndex={chosenIndex}
                chosenLabel={sign.tier}
                onTubeClick={handleTubeClick}
              />
            </div>
            <div className={styles.hint}>
              {phase === STATES.IDLE && '摇 一 摇 抽 签'}
              {phase === STATES.SHAKING && '· 摇 · 摇 · 摇 ·'}
              {phase === STATES.REVEALING && '点 击 查 看 解 签'}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sign"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={styles.signStage}
          >
            <div
              className={`${styles.signCard} ${manifested ? styles.manifested : ''}`}
              style={{ '--accent': sign.accent }}
              onDoubleClick={handleManifest}
            >
              <div className={styles.signWatermark}>占</div>
              <div className={styles.signHeader}>今日灵签</div>
              <div className={styles.signBody}>
                {/* row-reverse 让 DOM 顺序对应"从右往左"的视觉 */}
                <div className={`${styles.col} ${styles.colHeading}`}>
                  {sign.order}{sign.tier}
                </div>
                {sign.poem
                  .replace(/\n/g, '')
                  .split(/(?<=。)/)
                  .filter(Boolean)
                  .map((line, i) => (
                    <div key={i} className={`${styles.col} ${styles.colPoem}`}>
                      {line}
                    </div>
                  ))}
                {(() => {
                  const parts = sign.xie.split(/\s+/).filter(Boolean);
                  const half = Math.ceil(parts.length / 2);
                  return (
                    <div className={styles.colGroup}>
                      <div className={styles.col}>
                        <span className={styles.colLabel}>解</span>
                        {parts.slice(0, half).join('　')}
                      </div>
                      <div className={styles.col}>
                        {parts.slice(half).join('　')}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            {!manifested && (
              <div className={styles.manifestHint}>双 击 显 化</div>
            )}
            {manifested && (
              <div className={styles.manifestFx}>
                {/* B · 粒子爆发：从签条中心爆出金色粒子 */}
                {particles.map((p, i) => (
                  <motion.div
                    key={i}
                    className={styles.particle}
                    style={{ width: p.size, height: p.size }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.2 }}
                    transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
