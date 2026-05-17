import { useEffect, useRef, useState } from 'react';
import StatusBar from './StatusBar';
import TopTabs from './TopTabs';
import RightRail from './RightRail';
import BottomMeta from './BottomMeta';
import BottomNav from './BottomNav';
import MockVideo from './MockVideo';
import IframeCard from './IframeCard';
import Qiuqian from '../cards/Qiuqian/Qiuqian';
import Zodiac from '../cards/Zodiac/Zodiac';
import styles from './DouyinShell.module.css';

const DEFAULT_SLIDES = [
  {
    id: 'video-raison',
    type: 'mock',
    variant: 'top',
    src: '/video/raison.mp4',
    letterbox: true, // 横向视频，上下黑边
    author: 'Raison',
    avatar: '🎬',
    caption: '不必太苛求自己的完美，你已经很棒了 #拍出电影感 #氛围感',
    location: '',
    publishedAt: '',
  },
  {
    id: 'video-xiaoying',
    type: 'mock',
    variant: 'mid',
    src: '/video/xiaoying.mp4',
    author: '小莹会赢',
    avatar: '💼',
    caption: '5招职场小技巧，让人一眼就觉得你工作能力很强！ #职场',
    location: '',
    publishedAt: '',
  },
  {
    id: 'qiuqian',
    type: 'qiuqian',
  },
];

export default function DouyinShell({ personaId, initialCard, slides, bare }) {
  const SLIDES = slides || DEFAULT_SLIDES;
  const feedRef = useRef(null);
  const initialIndex = (() => {
    if (!initialCard) return 0; // 没指定 → 第一张
    const idx = SLIDES.findIndex((s) => s.type === initialCard);
    return idx >= 0 ? idx : 0;
  })();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // 首次用户交互后解除视频静音（浏览器自动播放策略限制）
  useEffect(() => {
    if (soundEnabled) return;
    const enable = () => {
      setSoundEnabled(true);
      // 只对当前 active 视频（正在播放的）同步 unmute + 重新 play
      // 非 active 视频保持 paused，等用户滑过去时 MockVideo 自己处理
      document.querySelectorAll('video').forEach((v) => {
        if (!v.paused) {
          v.muted = false;
          v.play().catch(() => {});
        }
      });
    };
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
  const isCard = currentSlide.type === 'qiuqian' || currentSlide.type === 'zodiac' || currentSlide.type === 'iframe-card';

  return (
    <div className={`${styles.shell} ${bare ? styles.bare : ''}`}>
      <div className={styles.feed} ref={feedRef}>
        {SLIDES.map((slide, idx) => (
          <div key={slide.id} className={styles.slide}>
            {slide.type === 'mock' && (
              <MockVideo
                variant={slide.variant}
                src={slide.src}
                active={activeIndex === idx}
                soundEnabled={soundEnabled}
                letterbox={slide.letterbox}
              />
            )}
            {slide.type === 'qiuqian' && (
              <Qiuqian personaId={personaId} active={activeIndex === idx} />
            )}
            {slide.type === 'zodiac' && (
              <Zodiac personaId={personaId} active={activeIndex === idx} />
            )}
            {slide.type === 'iframe-card' && (
              <IframeCard src={slide.src} active={activeIndex === idx} />
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
