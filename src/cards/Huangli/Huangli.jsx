import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TODAY, TIER_POOL, PERSONA_TO_HUANGLI } from '../../data/huangli';
import styles from './Huangli.module.css';

const STATES = {
  IDLE: 'idle',         // 老黄历完整悬挂，等待撕开
  TEARING: 'tearing',   // 撕开动画播放中
  REVEALED: 'revealed', // 内容卡呈现
};

// 8 片纸屑，向下侧散落（撕日历的物理直觉）
const SCRAPS = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 220,
  y: 240 + Math.random() * 180,
  rot: (Math.random() - 0.5) * 720,
  delay: Math.random() * 0.2,
  size: 12 + Math.random() * 18,
}));

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function Huangli({ personaId, active }) {
  const [phase, setPhase] = useState(STATES.IDLE);

  const data = PERSONA_TO_HUANGLI[personaId];
  const tier = useMemo(
    () => TIER_POOL[data.tierId],
    [data.tierId]
  );

  useEffect(() => {
    setPhase(STATES.IDLE);
  }, [personaId, active]);

  function startTear() {
    if (phase !== STATES.IDLE) return;
    setPhase(STATES.TEARING);
    const tearDuration = prefersReducedMotion() ? 400 : 1500;
    setTimeout(() => setPhase(STATES.REVEALED), tearDuration);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startTear();
    }
  }

  const reduced = prefersReducedMotion();

  return (
    <div className={styles.bg}>
      <div className={styles.starField} />
      <div className={styles.glow} />

      <AnimatePresence mode="wait">
        {phase !== STATES.REVEALED ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.calendarStage}
          >
            <div className={styles.calendarFrame}>
              {/* 老黄历正面 —— 撕开时整体撕落 */}
              <motion.button
                type="button"
                className={styles.paper}
                onClick={startTear}
                onKeyDown={handleKeyDown}
                aria-label={`撕开 ${TODAY.lunarYear} ${TODAY.lunarDate} 的黄历`}
                aria-pressed={phase !== STATES.IDLE}
                animate={
                  phase === STATES.TEARING
                    ? reduced
                      ? { opacity: 0, transition: { duration: 0.3 } }
                      : {
                          rotate: 22,
                          x: 30,
                          y: 320,
                          opacity: 0,
                          transition: { duration: 1.2, ease: [0.4, 0, 0.6, 1] },
                        }
                    : { rotate: 0, x: 0, y: 0, opacity: 1 }
                }
                style={{
                  clipPath:
                    phase === STATES.TEARING && !reduced
                      ? 'polygon(0 0, 100% 0, 100% 12%, 88% 18%, 96% 26%, 82% 34%, 92% 44%, 78% 52%, 90% 62%, 76% 72%, 88% 82%, 74% 92%, 100% 100%, 0 100%)'
                      : 'none',
                }}
              >
                <div className={styles.paperHeader}>
                  <span className={styles.headerYear}>丙 午 年</span>
                  <span className={styles.headerHole} />
                  <span className={styles.headerZodiac}>马 年</span>
                </div>

                <div className={styles.paperBody}>
                  <div className={styles.monthLabel}>{TODAY.monthLabel}</div>
                  <div className={styles.bigDay}>{TODAY.dayLabel}</div>
                  <div className={styles.weekday}>{TODAY.weekday}</div>
                </div>

                <div className={styles.paperFoot}>
                  <div className={styles.lunarLine}>
                    {TODAY.lunarYear} · {TODAY.lunarDate}
                  </div>
                  <div className={styles.solarTerm}>{TODAY.solarTerm}</div>
                </div>

                {/* 右上角撕口虚线 + 折角 */}
                <div className={styles.tearCorner} aria-hidden="true">
                  <svg viewBox="0 0 60 60" className={styles.tearSvg}>
                    <path
                      d="M 60 0 L 0 0 L 60 60 Z"
                      fill="rgba(180, 130, 80, 0.18)"
                      stroke="rgba(180, 80, 60, 0.6)"
                      strokeWidth="0.8"
                      strokeDasharray="3 2"
                    />
                  </svg>
                </div>

                <div className={styles.tearHint} aria-hidden="true">
                  轻 触 撕 开
                </div>
              </motion.button>

              {/* 撕开瞬间的纸屑（reduced motion 下跳过） */}
              {phase === STATES.TEARING && !reduced &&
                SCRAPS.map((s) => (
                  <motion.div
                    key={s.id}
                    className={styles.scrap}
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    animate={{
                      x: s.x,
                      y: s.y,
                      rotate: s.rot,
                      opacity: 0,
                      transition: { duration: 1.4, delay: s.delay, ease: 'easeIn' },
                    }}
                    style={{ width: s.size, height: s.size }}
                  />
                ))}
            </div>

            <div className={styles.hint} aria-live="polite">
              {phase === STATES.IDLE && '今 日 黄 历'}
              {phase === STATES.TEARING && '· 撕 · 撕 · 撕 ·'}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: reduced ? 0.3 : 0.8, ease: 'easeOut' }}
            className={styles.contentStage}
          >
            <div
              className={styles.contentCard}
              style={{ '--accent': tier.accent }}
            >
              <div className={styles.tierBadge}>{tier.label}</div>
              <h2 className={styles.theme}>{data.theme}</h2>

              <div className={styles.yiJiGrid}>
                <div className={styles.yiCol}>
                  <div className={styles.colLabel}>宜</div>
                  {data.yi.map((item, i) => (
                    <div key={i} className={styles.yiItem}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className={styles.divider} aria-hidden="true" />
                <div className={styles.jiCol}>
                  <div className={styles.colLabel}>忌</div>
                  {data.ji.map((item, i) => (
                    <div key={i} className={styles.jiItem}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.interpretation}>{data.interpretation}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
