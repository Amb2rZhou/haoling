import styles from './MockVideo.module.css';

// 信息流上下垫底的"普通短视频" mock，内容暂留空（黑底）
export default function MockVideo({ variant }) {
  return <div className={styles.mockVideo} data-variant={variant} />;
}
