import styles from './BottomMeta.module.css';

export default function BottomMeta({ author, caption, location, publishedAt }) {
  return (
    <div className={styles.bottomMeta}>
      <div className={styles.author}>@{author}</div>
      <div className={styles.captionLine}>
        <span className={styles.caption}>{caption}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className={styles.chevron}>
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </div>
      {(location || publishedAt) && (
        <div className={styles.metaLine}>
          {location && (
            <span className={styles.metaItem}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="white" className={styles.pin}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {location}
            </span>
          )}
          {location && publishedAt && <span className={styles.dot}>·</span>}
          {publishedAt && <span className={styles.metaItem}>{publishedAt}</span>}
        </div>
      )}
    </div>
  );
}
