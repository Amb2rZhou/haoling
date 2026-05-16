import { useEffect, useRef } from 'react';

// 监听 devicemotion 加速度合力超过阈值时触发回调
// threshold ~15-20 适合明显的"摇一摇"动作，过低会误触发
export function useShake({ threshold = 18, cooldown = 1500, onShake, enabled = true }) {
  const lastShakeRef = useRef(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    if (!enabled) return;

    function handleMotion(e) {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const magnitude = Math.sqrt(
        (acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2
      );
      const now = Date.now();
      if (magnitude > threshold && now - lastShakeRef.current > cooldown) {
        lastShakeRef.current = now;
        onShakeRef.current?.();
      }
    }

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [threshold, cooldown, enabled]);
}

// iOS 13+ 必须用户手势触发权限请求
export async function requestMotionPermission() {
  const DM = window.DeviceMotionEvent;
  if (DM && typeof DM.requestPermission === 'function') {
    try {
      const state = await DM.requestPermission();
      return state === 'granted';
    } catch {
      return false;
    }
  }
  // 安卓 / 桌面：默认就有权限（但桌面没有传感器，要兜底）
  return true;
}

export function hasMotionSensor() {
  return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
}
