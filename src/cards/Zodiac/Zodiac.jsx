import { useState, useEffect } from 'react';
import ShareSheet from '../../shell/ShareSheet';
import styles from './Zodiac.module.css';

export default function Zodiac({ personaId, active }) {
  // 'cover' = 首页（新春快乐 + CTA），'keywords' = 详情页（年度关键词）
  const [page, setPage] = useState('cover');
  const [shareOpen, setShareOpen] = useState(false);

  // 滑出本张卡时（active 变 false）重置回首页
  useEffect(() => {
    if (!active) {
      setPage('cover');
      setShareOpen(false);
    }
  }, [active]);

  return (
    <div className={styles.bg}>
      {page === 'cover' ? (
        <>
          <div className={styles.poster} />
          <button
            type="button"
            className={styles.ctaBtn}
            onClick={() => setPage('keywords')}
            aria-label="查看属于你的年度关键词"
          >
            <span className={styles.ctaRing}>
              <svg viewBox="0 0 24 24" width="16" height="16" className={styles.ctaArrow}>
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="#B22222"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
          </button>
        </>
      ) : (
        <>
          <div className={styles.keywordsPoster} />
          {/* 遮盖右上"生肖运势"挂签 */}
          <div className={styles.keywordsMaskTop} />
          {/* 遮盖"给你的一句话"底部框 */}
          <div className={styles.keywordsMask} />
          {/* "蜕"字左下角"好灵"印章 */}
          <img src="/img/seal.png" alt="" className={styles.zodiacSeal} />
          {/* 转发按钮 */}
          <button
            type="button"
            className={styles.shareBtn}
            onClick={() => setShareOpen(true)}
            aria-label="转发"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#5C3D2E">
              <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
            </svg>
          </button>
        </>
      )}
      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
