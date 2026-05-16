import styles from './StatusBar.module.css';

export default function StatusBar({ time = '00:23' }) {
  return (
    <div className={styles.statusBar}>
      <div className={styles.left}>
        <span className={styles.time}>{time}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white" className={styles.locArrow}>
          <path d="M21 3L3 10.53l8.27 1.2L13 21l8-18z" />
        </svg>
      </div>
      <div className={styles.right}>
        <svg width="18" height="11" viewBox="0 0 18 11" fill="white">
          <rect x="0" y="7" width="3" height="4" rx="0.5" />
          <rect x="5" y="5" width="3" height="6" rx="0.5" />
          <rect x="10" y="3" width="3" height="8" rx="0.5" />
          <rect x="15" y="0" width="3" height="11" rx="0.5" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
          <path d="M8.5 1.5C5.6 1.5 2.9 2.6 0.8 4.5L0 3.7C2.3 1.5 5.3 0.3 8.5 0.3s6.2 1.2 8.5 3.4l-0.8 0.8C14.1 2.6 11.4 1.5 8.5 1.5zM2.7 6.4l0.8 0.8c1.4-1.3 3.2-2 5-2s3.6 0.7 5 2l0.8-0.8C12.7 4.8 10.7 4 8.5 4S4.3 4.8 2.7 6.4zM5.4 9.1l0.8 0.8c0.6-0.6 1.4-0.9 2.3-0.9s1.7 0.3 2.3 0.9l0.8-0.8c-0.8-0.8-2-1.3-3.1-1.3S6.2 8.3 5.4 9.1zM8.5 11.5l1.2-1.2c-0.3-0.3-0.7-0.5-1.2-0.5s-0.9 0.2-1.2 0.5L8.5 11.5z" />
        </svg>
        <div className={styles.battery}>
          <div className={styles.batteryBody}>
            <div className={styles.batteryFill}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="black">
                <path d="M7 2v11h3v9l7-12h-4l4-8z" />
              </svg>
            </div>
          </div>
          <div className={styles.batteryTip} />
        </div>
      </div>
    </div>
  );
}
