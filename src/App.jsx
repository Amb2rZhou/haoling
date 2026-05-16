import DouyinShell from './shell/DouyinShell';
import './App.css';

const VALID_PERSONAS = ['shuangyu', 'coder', 'shuangzi'];
const VALID_CARDS = ['qiuqian', 'huangli'];

function App() {
  // 开发者切换人设：URL 加 ?p=shuangyu / coder / shuangzi
  // 开发者切初始卡片：URL 加 ?card=qiuqian / huangli
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');
  const c = params.get('card');
  const personaId = VALID_PERSONAS.includes(p) ? p : 'shuangyu';
  const initialCard = VALID_CARDS.includes(c) ? c : 'qiuqian';

  return <DouyinShell personaId={personaId} initialCard={initialCard} />;
}

export default App;
