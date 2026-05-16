import { useEffect, useRef, useState } from 'react';
import StatusBar from './StatusBar';
import TopTabs from './TopTabs';
import RightRail from './RightRail';
import BottomMeta from './BottomMeta';
import BottomNav from './BottomNav';
import MockVideo from './MockVideo';
import Qiuqian from '../cards/Qiuqian/Qiuqian';
import Huangli from '../cards/Huangli/Huangli';
import styles from './DouyinShell.module.css';

const SLIDES = [
  {
    id: 'video-top',
    type: 'mock',
    variant: 'top',
    author: '',
    avatar: '👤',
    caption: '',
  },
  {
    id: 'qiuqian',
    type: 'qiuqian',
  },
  {
    id: 'huangli',
    type: 'huangli',
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
  const isCard = currentSlide.type === 'qiuqian' || currentSlide.type === 'huangli';

  return (
    <div className={styles.shell}>
      <div className={styles.feed} ref={feedRef}>
        {SLIDES.map((slide, idx) => (
          <div key={slide.id} className={styles.slide}>
            {slide.type === 'mock' && <MockVideo variant={slide.variant} />}
            {slide.type === 'qiuqian' && (
              <Qiuqian personaId={personaId} active={activeIndex === idx} />
            )}
            {slide.type === 'huangli' && (
              <Huangli personaId={personaId} active={activeIndex === idx} />
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
            />
          )}
        </>
      )}

      <BottomNav />
    </div>
  );
}
