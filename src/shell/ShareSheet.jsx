import { motion, AnimatePresence } from 'framer-motion';
import styles from './ShareSheet.module.css';

const FRIENDS = [
  { id: 'recent', name: '最近分享', sub: '3个会话', isRecent: true },
  { id: 'xuanzi', name: '璇子', avatar: '🌸', status: '今天在线', bg: '#ffd6e2' },
  { id: 'jiejie', name: '姐姐', avatar: '👩', bg: '#e8d6ff' },
  { id: 'zhouzhou', name: '粥粥', avatar: '🍚', status: '5分钟前', bg: '#fde4c2' },
  { id: 'mia', name: 'Mia', avatar: '🐱', status: '1个朋友在线', bg: '#d6f0ff' },
  { id: 'laohe', name: '老何', avatar: '🧑', status: '30分前在线', bg: '#d6ffe2' },
];

const ACTIONS = [
  {
    id: 'reshare',
    label: '转发到日常',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3a9eff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    id: 'recommend',
    label: '推荐',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#33c259">
        <path d="M2 21h4V9H2v12zm20-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 1 7.59 6.59C7.22 6.95 7 7.45 7 8v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1z" />
      </svg>
    ),
  },
  {
    id: 'dm',
    label: '私信',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#3a3f4a">
        <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
      </svg>
    ),
  },
  {
    id: 'group',
    label: '我的群聊',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#1c1c1c">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
      </svg>
    ),
  },
  {
    id: 'douplus',
    label: '帮上热门',
    icon: (
      <span className={styles.douplus}>DOU+</span>
    ),
  },
];

export default function ShareSheet({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.sheet}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.22, 0.8, 0.36, 1] }}
          >
            <div className={styles.header}>
              <span className={styles.title}>分享给</span>
              <button className={styles.closeBtn} onClick={onClose} aria-label="关闭">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#888" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 第一行：最近分享 + 5 个常用联系人 */}
            <div className={styles.row}>
              {FRIENDS.map((f) => (
                <div key={f.id} className={styles.item}>
                  {f.isRecent ? (
                    <div className={styles.recentAvatar}>
                      <div className={styles.recentCell} style={{ background: '#ffd6e2' }}>🌸</div>
                      <div className={styles.recentCell} style={{ background: '#d6f0ff' }}>🐱</div>
                      <div className={styles.recentCell} style={{ background: '#fde4c2' }}>🍚</div>
                      <div className={styles.recentCell} style={{ background: '#d6ffe2' }}>🧑</div>
                    </div>
                  ) : (
                    <div className={styles.friendAvatar} style={{ background: f.bg }}>
                      {f.avatar}
                    </div>
                  )}
                  <span className={styles.label}>{f.name}</span>
                  {(f.sub || f.status) && (
                    <span className={styles.subLabel}>{f.sub || f.status}</span>
                  )}
                </div>
              ))}
            </div>

            {/* 第二行：分享方式 */}
            <div className={styles.row}>
              {ACTIONS.map((a) => (
                <div key={a.id} className={styles.item}>
                  <div className={styles.actionIcon}>{a.icon}</div>
                  <span className={styles.label}>{a.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
