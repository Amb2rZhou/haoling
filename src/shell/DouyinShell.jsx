import { useEffect, useRef, useState } from 'react';
import StatusBar from './StatusBar';
import TopTabs from './TopTabs';
import RightRail from './RightRail';
import BottomMeta from './BottomMeta';
import BottomNav from './BottomNav';
import MockVideo from './MockVideo';
import Qiuqian from '../cards/Qiuqian/Qiuqian';
import Zodiac from '../cards/Zodiac/Zodiac';
import styles from './DouyinShell.module.css';

const SLIDES = [
  {
    id: 'video-top',
    type: 'mock',
    variant: 'top',
    src: '/video/chenxi.mp4',
    author: '晨曦的旅途',
    avatar: '🌅',
    caption: '春节假期已结束 明天大家都要返回工作岗位，北京我们回来啦 #321极限返工',
    location: '郑州市',
    publishedAt: '2026-02-16',
  },
  {
    id: 'qiuqian',
    type: 'qiuqian',
  },
  {
    id: 'video-mid-1',
    type: 'mock',
    variant: 'mid',
    src: '/video/other.mp4',
    author: '深圳卫健委',
    avatar: '🏥',
    caption: '那些年，我们离过的flag #新年快乐 #新年flag',
    location: '',
    publishedAt: '2026-02-16',
  },
  {
    id: 'video-mid-2',
    type: 'mock',
    variant: 'mid',
    author: '',
    avatar: '👤',
    caption: '',
  },
  {
    id: 'zodiac',
    type: 'zodiac',
  },
  {
    id: 'video-bottom',
    type: 'mock',
    variant: 'bottom',
    author: '',
    avatar: '👤',
    caption: '',
  },
];

export default function DouyinShell({ personaId, initialCard }) {
  const feedRef = useRef(null);
  const initialIndex = (() => {
    const idx = SLIDES.findIndex((s) => s.type === initialCard);
    return idx >= 0 ? idx : 1;
  })();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // 首次用户交互后解除视频静音（浏览器自动播放策略限制）
  useEffect(() => {
    if (soundEnabled) return;
    const enable = () => setSoundEnabled(true);
    document.addEventListener('click', enable, { once: true });
    document.addEventListener('touchstart', enable, { once: true });
    return () => {
      document.removeEventListener('click', enable);
      document.removeEventListener('touchstart', enable);
    };
  }, [soundEnabled]);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTop = el.clientHeight * initialIndex;
  }, [initialIndex]);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const slideEls = el.querySelectorAll(`.${styles.slide}`);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Array.from(slideEls).indexOf(entry.target);
            if (idx >= 0) setActiveIndex(idx);
          }
        });
      },
      { root: el, threshold: [0.6, 0.9] }
    );
    slideEls.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const currentSlide = SLIDES[activeIndex];
  const isCard = currentSlide.type === 'qiuqian' || currentSlide.type === 'zodiac';

  return (
    <div className={styles.shell}>
      <div className={styles.feed} ref={feedRef}>
        {SLIDES.map((slide, idx) => (
          <div key={slide.id} className={styles.slide}>
            {slide.type === 'mock' && (
              <MockVideo
                variant={slide.variant}
                src={slide.src}
                active={activeIndex === idx}
                soundEnabled={soundEnabled}
              />
            )}
            {slide.type === 'qiuqian' && (
              <Qiuqian personaId={personaId} active={activeIndex === idx} />
            )}
            {slide.type === 'zodiac' && (
              <Zodiac personaId={personaId} active={activeIndex === idx} />
            )}
          </div>
        ))}
      </div>

      <StatusBar />
      <TopTabs />

      {/* 卡片屏不显示右侧栏和作者文案 —— 卡片是 first-class，不是视频 */}
      {!isCard && (
        <>
          <RightRail avatar={currentSlide.avatar} />
          {currentSlide.author && (
            <BottomMeta
              author={currentSlide.author}
              caption={currentSlide.caption}
              location={currentSlide.location}
              publishedAt={currentSlide.publishedAt}
            />
          )}
        </>
      )}

      <BottomNav />
    </div>
  );
}
