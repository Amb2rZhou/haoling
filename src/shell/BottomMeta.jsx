import styles from './BottomMeta.module.css';

export default function BottomMeta({ author, caption }) {
  return (
    <div className={styles.bottomMeta}>
      <div className={styles.author}>@{author}</div>
      <div className={styles.captionLine}>
        <span className={styles.caption}>{caption}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className={styles.chevron}>
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </div>
    </div>
  );
}
