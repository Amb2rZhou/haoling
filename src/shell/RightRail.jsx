import { useState } from 'react';
import styles from './RightRail.module.css';

export default function RightRail({ avatar = '👤' }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className={styles.rightRail}>
      <div className={styles.avatarWrap}>
        <div className={styles.avatar}>
          <span>{avatar}</span>
        </div>
        <div className={styles.followBadge}>+</div>
      </div>

      <button
        className={styles.actionBtn}
        onClick={() => setLiked((v) => !v)}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill={liked ? '#FE2C55' : 'white'}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className={styles.count}>37.6w</span>
      </button>

      <button className={styles.actionBtn}>
        <svg width="42" height="42" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
        <span className={styles.count}>1211</span>
      </button>

      <button className={styles.actionBtn}>
        <svg width="42" height="42" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="none" />
        </svg>
        <span className={styles.count}>9043</span>
      </button>

      <button className={styles.actionBtn}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
        <span className={styles.count}>1.5w</span>
      </button>

      <div className={styles.similarCard}>
        <div className={styles.similarImgs}>
          <div className={styles.similarImg} style={{ background: '#a55' }}>👤</div>
          <div className={styles.similarImg} style={{ background: '#5a8' }}>👤</div>
        </div>
        <div className={styles.similarLabel}>玩同款</div>
      </div>
    </div>
  );
}
