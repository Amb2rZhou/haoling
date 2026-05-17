import { useState } from 'react';
import ShareSheet from './ShareSheet';
import styles from './IframeCard.module.css';

// 嵌入队友的 HTML 卡片 + 浮动转发按钮（复用我的 ShareSheet）
export default function IframeCard({ src, active }) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className={styles.iframeCard}>
      <iframe
        src={src}
        className={styles.iframe}
        title="card"
        loading={active ? 'eager' : 'lazy'}
      />
      <button
        type="button"
        className={styles.shareBtn}
        onClick={() => setShareOpen(true)}
        aria-label="转发"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="#1A1A1A">
          <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
        </svg>
      </button>
      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
