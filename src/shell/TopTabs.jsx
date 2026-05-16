import styles from './TopTabs.module.css';

const TABS = ['直播', '团购', '上海', '关注', '商城', '推荐'];
const ACTIVE = '推荐';

export default function TopTabs() {
  return (
    <div className={styles.topTabs}>
      <div className={styles.menuIcon}>
        <span></span>
        <span></span>
        <span></span>
        <div className={styles.menuBadge}>1</div>
      </div>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <div
            key={t}
            className={`${styles.tab} ${t === ACTIVE ? styles.active : ''}`}
          >
            {t}
            {t === ACTIVE && <div className={styles.underline} />}
          </div>
        ))}
      </div>
      <div className={styles.searchIcon}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
          <circle cx="11" cy="11" r="7.5" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
    </div>
  );
}
