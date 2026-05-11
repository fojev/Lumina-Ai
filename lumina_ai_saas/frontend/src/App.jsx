import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import SearchBar from './components/SearchBar';
import { chatService } from './services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, LogOut, UserCircle, ChevronRight, HelpCircle,
  MessageSquare, LayoutDashboard, BrainCircuit, GraduationCap,
  MoreVertical, Edit2, Trash2, Check, Plus, Sun, Moon, Monitor,
} from 'lucide-react';

/* ============================================================
   THEME HOOK
   Manages: 'light' | 'dark' | 'system'
   Applies: data-theme on <html> instantly
   Saves:   localStorage key 'lumina-theme'
   ============================================================ */
function useTheme() {
  const [theme, setThemeState] = useState(() =>
    localStorage.getItem('lumina-theme') || 'system'
  );

  const applyTheme = useCallback((pref) => {
    let resolved = pref;
    if (pref === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('lumina-theme', theme);
  }, [theme, applyTheme]);

  // Watch system changes when in 'system' mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  const setTheme = (t) => setThemeState(t);
  return { theme, setTheme };
}

/* ============================================================
   APP ROOT
   ============================================================ */
export default function App() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [recentChats, setRecentChats] = useState([]);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [activeTab,         setActiveTab]         = useState('notes');
  const [showProfileModal,  setShowProfileModal]  = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [chatKey,           setChatKey]           = useState(0); // increment to reset ChatInterface
  const [activeChatId,      setActiveChatId]      = useState(null);
  const [userData, setUserData] = useState({
    name: 'Aryan Lamba', gender: 'Male', dob: '2005-01-01',
  });

  // Load chats from API on mount for persistent history
  useEffect(() => {
    chatService.getChats()
      .then(data => {
        const chats = Array.isArray(data) ? data : (data.results || []);
        setRecentChats(chats.map(c => ({ id: String(c.id), title: c.title || 'New Chat' })));
      })
      .catch(() => {
        // Fallback to empty — user hasn't started a chat yet
        setRecentChats([]);
      });
  }, []);

  const handleChatUpdate = (title) => {
    setRecentChats(prev => {
      const exists = prev.find(c => c.title === title);
      if (exists) return prev;
      return [{ id: Date.now().toString(), title }, ...prev];
    });
  };

  const handleRenameChat = (id, t) =>
    setRecentChats(prev => prev.map(c => c.id === id ? { ...c, title: t } : c));

  const handleDeleteChat = (id) =>
    setRecentChats(prev => prev.filter(c => c.id !== id));

  // New Chat: simply increment chatKey → ChatInterface remounts cleanly
  const handleNewChat = () => {
    setChatKey(k => k + 1);
    setActiveChatId(null);
  };

  const filteredChats = recentChats.filter(c =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'notes', icon: <LayoutDashboard size={17} />, label: 'Notes Generator' },
    { id: 'pyq',   icon: <BrainCircuit size={17} />,    label: 'PYQ Predictor'   },
    { id: 'tutor', icon: <GraduationCap size={17} />,   label: 'AI Tutor'        },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-[268px] flex-shrink-0 h-full flex flex-col z-50"
        style={{ background: 'var(--sidebar)' }}>

        {/* Brand */}
        <div className="flex items-center gap-3 px-5 pt-7 pb-6">
          <img
            src="/logo.png"
            alt="Lumina AI"
            className="w-11 h-11 object-contain flex-shrink-0"
            style={{ borderRadius: '14px' }}
          />
          <div>
            <h1 className="text-[15px] font-black tracking-tight leading-none"
              style={{ fontFamily: 'Poppins,sans-serif', color: 'var(--primary-h)' }}>
              LUMINA AI
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mt-1.5" style={{ color: 'var(--text-3)' }}>
              Adaptive Study Intelligence
            </p>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-4 mb-6">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 font-bold text-[13.5px] text-white"
            style={{ background: 'linear-gradient(135deg,var(--primary),var(--secondary))', boxShadow: '0 4px 18px var(--glow)' }}>
            <Plus size={16} strokeWidth={2.5} />
            New Chat
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="px-3 flex flex-col gap-0.5 mb-6">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="h-px mx-5 mb-6" style={{ background: 'var(--border-2)' }} />

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
          <div className="flex items-center justify-between px-3 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
              Recent
            </span>
            <div className="w-28">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            {filteredChats.map(chat => (
              <ChatListItem key={chat.id} chat={chat}
                onRename={handleRenameChat} onDelete={handleDeleteChat} />
            ))}
            {filteredChats.length === 0 && (
              <p className="text-[12px] text-center py-6" style={{ color: 'var(--text-3)' }}>
                No chats yet
              </p>
            )}
          </div>
        </div>

        {/* Account */}
        <AccountSection
          userData={userData}
          navigate={navigate}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="flex-1 relative flex flex-col min-w-0" style={{ background: 'var(--bg)' }}>
        <header className="absolute top-0 right-0 z-40 h-14 flex items-center gap-3 px-6 pointer-events-none">
          <motion.div whileHover={{ scale: 1.06 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] text-white pointer-events-auto cursor-pointer"
            style={{ background: 'linear-gradient(135deg,var(--primary),var(--secondary))', boxShadow: '0 2px 10px var(--glow)' }}
            onClick={() => setShowProfileModal(true)}>
            {userData.name.charAt(0)}
          </motion.div>
        </header>
        <ChatInterface key={chatKey} onChatUpdate={handleChatUpdate} tab={activeTab} chatKey={chatKey} />
      </main>

      {/* ── Profile Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showProfileModal && (
          <ModalWrapper onClose={() => setShowProfileModal(false)} title="My Profile" subtitle="Update your academic identity">
            <div className="space-y-4">
              <InputGroup label="Full Name" value={userData.name}
                onChange={v => setUserData({ ...userData, name: v })} />
              <div className="grid grid-cols-2 gap-3">
                <SelectGroup label="Gender" value={userData.gender}
                  options={['Male', 'Female', 'Other']}
                  onChange={v => setUserData({ ...userData, gender: v })} />
                <InputGroup label="Date of Birth" type="date" value={userData.dob}
                  onChange={v => setUserData({ ...userData, dob: v })} />
              </div>
            </div>
            <PrimaryButton onClick={() => setShowProfileModal(false)} className="mt-8">
              Save Profile
            </PrimaryButton>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ── Settings Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showSettingsModal && (
          <ModalWrapper onClose={() => setShowSettingsModal(false)} title="Settings" subtitle="Customize your Lumina AI experience">

            {/* Theme Section */}
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
                Appearance
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 'light',  icon: <Sun size={18} />,     label: 'Light'   },
                  { value: 'dark',   icon: <Moon size={18} />,    label: 'Dark'    },
                  { value: 'system', icon: <Monitor size={18} />, label: 'System'  },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className="theme-option flex-col gap-2 py-4 text-center"
                    style={{
                      borderColor: theme === opt.value ? 'var(--primary)' : 'var(--border)',
                      background: theme === opt.value ? 'var(--chip-bg)' : 'var(--input-bg)',
                      color: theme === opt.value ? 'var(--primary)' : 'var(--text-2)',
                    }}
                  >
                    <span style={{ color: theme === opt.value ? 'var(--primary)' : 'var(--text-3)' }}>{opt.icon}</span>
                    <span className="text-[12px] font-bold">{opt.label}</span>
                    {theme === opt.value && (
                      <span className="w-1.5 h-1.5 rounded-full mx-auto"
                        style={{ background: 'var(--primary)', display: 'block' }} />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[11px] mt-2.5 leading-relaxed" style={{ color: 'var(--text-3)' }}>
                {theme === 'system'
                  ? "Follows your device's system preference and switches automatically."
                  : `${theme.charAt(0).toUpperCase() + theme.slice(1)} mode is active.`}
              </p>
            </div>

            <div className="h-px mb-5" style={{ background: 'var(--border)' }} />

            {/* Profile quick-edit */}
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
                Profile
              </p>
              <InputGroup label="Display Name" value={userData.name}
                onChange={v => setUserData({ ...userData, name: v })} />
            </div>

            <PrimaryButton onClick={() => setShowSettingsModal(false)}>
              Done
            </PrimaryButton>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   CHAT LIST ITEM
   ============================================================ */
function ChatListItem({ chat, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title,     setTitle]     = useState(chat.title);
  const [showMenu,  setShowMenu]  = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSave = () => { onRename(chat.id, title); setIsEditing(false); };

  return (
    <div className="group relative">
      <div className={`nav-item !py-2.5 ${isEditing ? 'ring-1 ring-inset ring-primary/30' : ''}`}
        style={isEditing ? { background: 'var(--chip-bg)' } : {}}>
        <MessageSquare size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        {isEditing ? (
          <input autoFocus
            className="flex-1 bg-transparent outline-none text-[13.5px] font-medium"
            style={{ color: 'var(--text)' }}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()} />
        ) : (
          <span className="truncate flex-1 text-[13.5px]">{chat.title || 'New Chat'}</span>
        )}
        {!isEditing && (
          <button onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-opacity"
            style={{ color: 'var(--text-3)' }}>
            <MoreVertical size={13} />
          </button>
        )}
        {isEditing && (
          <button onClick={handleSave} className="p-1 rounded-lg" style={{ color: 'var(--primary)' }}>
            <Check size={13} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.div ref={menuRef}
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.94, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full mt-1.5 w-36 rounded-2xl z-50 p-1.5 glass-dropdown">
            <MenuBtn icon={<Edit2 size={12} />} label="Rename"
              onClick={() => { setIsEditing(true); setShowMenu(false); }} />
            <MenuBtn icon={<Trash2 size={12} />} label="Delete" danger
              onClick={() => { onDelete(chat.id); setShowMenu(false); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   ACCOUNT SECTION
   ============================================================ */
function AccountSection({ userData, navigate, onOpenProfile, onOpenSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const items = [
    { icon: <UserCircle size={14} />, label: 'Profile',  onClick: onOpenProfile },
    { icon: <Settings size={14} />,   label: 'Settings', onClick: onOpenSettings },
    { icon: <HelpCircle size={14} />, label: 'Help',     onClick: () => {} },
    { icon: <LogOut size={14} />,     label: 'Sign out', onClick: () => { localStorage.clear(); navigate('/login'); }, danger: true },
  ];

  return (
    <div className="relative p-3 mt-auto border-t" style={{ borderColor: 'var(--border)' }} ref={ref}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{   opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl z-50 p-1.5 glass-dropdown">
            {items.map((item, i) => (
              <button key={i}
                onClick={() => { item.onClick(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] rounded-xl transition-all text-left font-medium"
                style={{ color: item.danger ? '#f87171' : 'var(--text-2)', fontWeight: item.danger ? 700 : 500 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--chip-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ opacity: 0.6 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left"
        onMouseEnter={e => e.currentTarget.style.background = 'var(--chip-bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0"
          style={{ background: 'var(--chip-bg)', border: '1px solid var(--chip-border)', color: 'var(--primary-h)' }}>
          {userData.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>{userData.name}</p>
          <p className="text-[9.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Student</p>
        </div>
        <ChevronRight size={14} style={{
          color: 'var(--text-3)',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }} />
      </button>
    </div>
  );
}

/* ============================================================
   SHARED UI PRIMITIVES
   ============================================================ */
function ModalWrapper({ children, onClose, title, subtitle }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0"
        style={{ background: 'var(--overlay)', backdropFilter: 'blur(8px)' }} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{   scale: 0.95, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative z-10 w-full max-w-[420px] rounded-[28px] overflow-hidden"
        style={{ background: 'var(--sidebar)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div className="p-7">
          <h2 className="text-[19px] font-black mb-1"
            style={{ fontFamily: 'Poppins,sans-serif', color: 'var(--text)' }}>
            {title}
          </h2>
          <p className="text-[13px] mb-6" style={{ color: 'var(--text-3)' }}>{subtitle}</p>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function PrimaryButton({ children, onClick, className = '' }) {
  return (
    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full py-3.5 rounded-2xl font-bold text-[14px] text-white ${className}`}
      style={{
        background: 'linear-gradient(135deg,var(--primary),var(--secondary))',
        boxShadow: '0 4px 18px var(--glow)',
      }}>
      {children}
    </motion.button>
  );
}

function MenuBtn({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12.5px] font-semibold rounded-xl transition-all"
      style={{ color: danger ? '#f87171' : 'var(--text-2)', fontWeight: danger ? 700 : 500 }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--chip-bg)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {icon} {label}
    </button>
  );
}

function InputGroup({ label, value, onChange, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest ml-0.5"
        style={{ color: 'var(--text-3)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-[14px] font-medium outline-none"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
        onFocus={e  => e.currentTarget.style.borderColor = 'var(--primary)'}
        onBlur={e   => e.currentTarget.style.borderColor = 'var(--border)'} />
    </div>
  );
}

function SelectGroup({ label, value, options, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest ml-0.5"
        style={{ color: 'var(--text-3)' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-[14px] font-medium outline-none"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
