import { useEffect, useRef } from 'react';
import styles from './MockVideo.module.css';

// "普通短视频" mock：传 src 则播放 mp4，不传则黑底占位
export default function MockVideo({ variant, src, active, soundEnabled }) {
  const videoRef = useRef(null);

  // active 切换时自动播放/暂停
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active]);

  // soundEnabled 切换时解除静音
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !soundEnabled;
    if (active && soundEnabled) {
      v.play().catch(() => {});
    }
  }, [soundEnabled, active]);

  if (!src) {
    return <div className={styles.mockVideo} data-variant={variant} />;
  }

  return (
    <video
      ref={videoRef}
      className={styles.video}
      src={src}
      loop
      muted={!soundEnabled}
      playsInline
      preload="metadata"
    />
  );
}
