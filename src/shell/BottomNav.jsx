import styles from './BottomNav.module.css';

const TABS = [
  { id: 'home', label: '首页', toggle: true },
  { id: 'friends', label: '朋友' },
  { id: 'post', plus: true },
  { id: 'inbox', label: '消息' },
  { id: 'me', label: '我' },
];

export default function BottomNav() {
  return (
    <div className={styles.bottomNav}>
      {TABS.map((t) => {
        if (t.plus) {
          return (
            <div key={t.id} className={styles.plusWrap}>
              <div className={styles.plusBtn}>
                <span className={styles.plusSign}>+</span>
              </div>
            </div>
          );
        }
        return (
          <div
            key={t.id}
            className={`${styles.tab} ${t.id === 'home' ? styles.active : ''}`}
          >
            <span>{t.label}</span>
            {t.toggle && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="white" className={styles.toggleIcon}>
                <path d="M7.5 21.5l-4-4 4-4v3h11v2h-11v3zm9-19v3h-11v2h11v3l4-4-4-4z" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
