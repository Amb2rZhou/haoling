import DouyinShell from './shell/DouyinShell';
import './App.css';

const VALID_PERSONAS = ['shuangyu', 'coder', 'shuangzi'];
const VALID_CARDS = ['qiuqian', 'zodiac'];

function App() {
  // 开发者切换人设：URL 加 ?p=shuangyu / coder / shuangzi
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');
  const c = params.get('card');
  const personaId = VALID_PERSONAS.includes(p) ? p : 'shuangyu';
  const initialCard = VALID_CARDS.includes(c) ? c : 'qiuqian';

  return <DouyinShell personaId={personaId} initialCard={initialCard} />;
}

export default App;
