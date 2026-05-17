import DouyinShell from './shell/DouyinShell';
import './App.css';

const VALID_PERSONAS = ['shuangyu', 'coder', 'shuangzi'];
const VALID_CARDS = ['qiuqian', 'zodiac'];

// /demo 路径：两视频 + 生肖
const DEMO_SLIDES = [
  {
    id: 'demo-chenxi',
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
    id: 'demo-shenzhen',
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
    id: 'demo-zodiac',
    type: 'zodiac',
  },
];

// /xiaoyue 路径：队友的运势卡 + 前后视频
const XIAOYUE_SLIDES = [
  {
    id: 'xiaoyue-dim-grape',
    type: 'mock',
    variant: 'top',
    src: '/video/dim-grape.mp4',
    author: 'dim葡萄柚',
    avatar: '🍇',
    caption: '让我们一起撞破这堵墙！ #音乐剧破墙 #强东玥 #王凌毅 #李星葆 #zgyyj',
    location: '',
    publishedAt: '',
  },
  {
    id: 'xiaoyue-card',
    type: 'iframe-card',
    src: '/xiaoyue.html',
  },
  {
    id: 'xiaoyue-yangpeipei',
    type: 'mock',
    variant: 'mid',
    src: '/video/yangpeipei.mp4',
    author: '杨培培977',
    avatar: '💄',
    caption: '5分钟彩妆！！！ #早八妆容 #美妆分享 #裸妆 #淡妆 #美妆教程',
    location: '',
    publishedAt: '',
  },
];

// /tarot 路径：AI 疗愈塔罗卡 + 前后视频（@瑶书 / @Lan7_）
const TAROT_SLIDES = [
  {
    id: 'tarot-yaoshu',
    type: 'mock',
    variant: 'top',
    src: '/tarot/feed-video-1.mp4',
    author: '瑶书',
    avatar: '📖',
    caption: '如果没有谁比谁更辛苦，也没有谁应该永远先低头，好好爱自己才是生活的开端 #香港 #电影感 #情绪短片 #inmyfeeling',
    location: '',
    publishedAt: '',
  },
  {
    id: 'tarot-card',
    type: 'iframe-card',
    src: '/tarot-card.html',
  },
  {
    id: 'tarot-lan7',
    type: 'mock',
    variant: 'mid',
    src: '/tarot/feed-video-3.mp4',
    author: 'Lan7_',
    avatar: '🌙',
    caption: '这个世界有很多人，你以为明天一定可以再见到面的，但是有些人在你一转身的时候，就已经走进了再也来不及好好告别的那一边…',
    location: '',
    publishedAt: '',
  },
];

// /alan 路径：阿岚的运势卡 + 前后视频
const ALAN_SLIDES = [
  {
    id: 'alan-commute',
    type: 'mock',
    variant: 'top',
    src: '/video/alan-top.mp4',
    author: '冲浪公主小燕子',
    avatar: '🌊',
    caption: '原来大家上班都有通勤搭子啊 #通勤搭子 #上班 #娱乐评论大赏',
    location: '',
    publishedAt: '',
  },
  {
    id: 'alan-card',
    type: 'iframe-card',
    src: '/alan.html',
  },
  {
    id: 'alan-back-to-work',
    type: 'mock',
    variant: 'mid',
    src: '/video/alan-mid.mp4',
    author: '致路沥青',
    avatar: '🛣️',
    caption: '初九返工人 #春节后遗症 #打工人精神状态 #上班第一天',
    location: '',
    publishedAt: '',
  },
];

function App() {
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');
  const c = params.get('card');
  const personaId = VALID_PERSONAS.includes(p) ? p : 'shuangyu';
  const initialCard = VALID_CARDS.includes(c) ? c : undefined;

  // 根据 URL pathname 选择 slides 集
  const path = window.location.pathname;
  let slides;
  let bare = false;
  if (path.startsWith('/xiaoyue')) {
    slides = XIAOYUE_SLIDES;
    bare = true; // 队友 HTML 自带手机框，桌面不再叠一层外壳
  } else if (path.startsWith('/alan')) {
    slides = ALAN_SLIDES;
    bare = true;
  } else if (path.startsWith('/tarot')) {
    slides = TAROT_SLIDES;
    bare = true;
  } else if (path.startsWith('/demo')) {
    slides = DEMO_SLIDES;
  }

  return (
    <DouyinShell
      personaId={personaId}
      initialCard={initialCard}
      slides={slides}
      bare={bare}
    />
  );
}

export default App;
