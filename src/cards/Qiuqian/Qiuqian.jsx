import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SIGN_POOL, PERSONA_TO_SIGN } from '../../data/qiuqianSigns';
import { useShake, requestMotionPermission, hasMotionSensor } from './useShake';
import Tube3D from './Tube3D';
import ShareSheet from '../../shell/ShareSheet';
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
    setManifested(false);
    setShareOpen(false);
  }, [personaId, active]);

  // 每次抽签前重选 chosenStick（让"摇出的是哪根"看起来真的随机）
  const [chosenIndex, setChosenIndex] = useState(0);

  function startDraw() {
    if (phase !== STATES.IDLE) return;
    setManifested(false);
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
  const [shareOpen, setShareOpen] = useState(false);
  function handleManifest() {
    if (phase !== STATES.DRAWN) return;
    setManifested(true);
    // 双击显化时手机振动（Android 支持，iOS 静默忽略）
    if (navigator.vibrate) {
      navigator.vibrate([60, 30, 90, 30, 180]);
    }
  }

  // 签卡 3D tilt
  const cardWrapRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  function handleCardMouseMove(e) {
    const rect = cardWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    // ±10° 倾斜：rotateX 用 -py（光标在上方时卡片往后倾），rotateY 用 px
    setTilt({ rx: -py * 14, ry: px * 14 });
  }
  function handleCardMouseLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  // 手机 DeviceOrientation tilt（基于陀螺仪）
  useEffect(() => {
    if (phase !== STATES.DRAWN) return;
    function onOrient(e) {
      const beta = e.beta || 0;   // 前后倾斜
      const gamma = e.gamma || 0; // 左右倾斜
      // 手机正常拿在手里 beta ≈ 60°，以此为中心
      const dx = Math.max(-12, Math.min(12, (beta - 60) * 0.4));
      const dy = Math.max(-12, Math.min(12, gamma * 0.4));
      setTilt({ rx: -dx, ry: dy });
    }
    window.addEventListener('deviceorientation', onOrient);
    return () => window.removeEventListener('deviceorientation', onOrient);
  }, [phase]);

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
              ref={cardWrapRef}
              className={styles.cardWrap}
              onDoubleClick={handleManifest}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              }}
            >
              <div className={styles.cardBorder} />
              <div className={styles.signCard}>
                {/* 签等级 */}
                <div className={styles.grade}>
                  <span
                    className={`${styles.gradeText} ${manifested ? styles.gradeShimmer : ''}`}
                  >
                    {sign.order} · {sign.tier}
                  </span>
                  <div className={styles.gradeRule} />
                </div>

                {/* 诗 4 列竖排（按"，"和"。"拆，每个标点一列）*/}
                <div className={styles.poemWrap}>
                  {sign.poem
                    .replace(/\n/g, '')
                    .split(/(?<=[，。])/)
                    .filter(Boolean)
                    .map((line, i) => (
                      <span key={i} className={styles.poemLine}>
                        {line}
                      </span>
                    ))}
                  {/* 右下角"好灵"印章 */}
                  <img src="/img/seal.png" alt="" className={styles.poemSeal} />
                </div>

                {/* 吉祥分隔线：钻石 + 四瓣花家纹 */}
                <div className={styles.auspicious}>
                  <div className={styles.auspLine} />
                  <div className={styles.auspCenter}>
                    <div className={`${styles.auspDiamond} ${styles.diaSm}`} />
                    <div className={styles.auspDiamond} />
                    <div className={styles.auspMedallion}>
                      <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
                        <path d="M20 18 C17.5 13 14 9.5 20 6.5 C26 9.5 22.5 13 20 18Z" fill="#5C3D2E"/>
                        <path d="M20 22 C22.5 27 26 30.5 20 33.5 C14 30.5 17.5 27 20 22Z" fill="#5C3D2E"/>
                        <path d="M18 20 C13 22.5 9.5 26 6.5 20 C9.5 14 13 17.5 18 20Z" fill="#5C3D2E"/>
                        <path d="M22 20 C27 17.5 30.5 14 33.5 20 C30.5 26 27 22.5 22 20Z" fill="#5C3D2E"/>
                        <g transform="rotate(45 20 20)">
                          <path d="M20 18 C17.5 13 14 9.5 20 6.5 C26 9.5 22.5 13 20 18Z" fill="#5C3D2E" opacity="0.45" transform="scale(0.72) translate(5.6 5.6)"/>
                          <path d="M20 22 C22.5 27 26 30.5 20 33.5 C14 30.5 17.5 27 20 22Z" fill="#5C3D2E" opacity="0.45" transform="scale(0.72) translate(5.6 5.6)"/>
                          <path d="M18 20 C13 22.5 9.5 26 6.5 20 C9.5 14 13 17.5 18 20Z" fill="#5C3D2E" opacity="0.45" transform="scale(0.72) translate(5.6 5.6)"/>
                          <path d="M22 20 C27 17.5 30.5 14 33.5 20 C30.5 26 27 22.5 22 20Z" fill="#5C3D2E" opacity="0.45" transform="scale(0.72) translate(5.6 5.6)"/>
                        </g>
                        <circle cx="20" cy="20" r="3.2" fill="#5C3D2E"/>
                        <circle cx="20" cy="20" r="1.5" fill="#FAF4E8"/>
                      </svg>
                    </div>
                    <div className={styles.auspDiamond} />
                    <div className={`${styles.auspDiamond} ${styles.diaSm}`} />
                  </div>
                  <div className={styles.auspLine} />
                </div>

                {/* 解读框 */}
                <div className={styles.interp}>
                  <p className={styles.interpP}>{sign.interpText}</p>
                </div>

                {/* 出处 */}
                <div className={styles.foot}>
                  <div className={styles.footLbl}>{sign.footerLabel}</div>
                  <div className={styles.footTxt}>{sign.footerContent}</div>
                </div>
              </div>
            </div>
            {!manifested && (
              <div className={styles.manifestHint}>双 击 显 化</div>
            )}
            {/* 转发按钮 */}
            <button
              type="button"
              className={styles.shareBtnSign}
              onClick={() => setShareOpen(true)}
              aria-label="转发"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#5C3D2E">
                <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
              </svg>
            </button>
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
      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
