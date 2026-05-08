import React, { useRef, useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import MessageBubble, { TypingBubble } from './MessageBubble';
import StudyModeToggle from './StudyModeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Camera, Monitor, Sparkles, ArrowUp } from 'lucide-react';

/* ── PDF text extractor ─────────────────────────────────── */
async function extractTextFromFile(file) {
  if (file.type === 'application/pdf') {
    try {
      const lib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      const buf = await file.arrayBuffer();
      const pdf = await lib.getDocument({ data: buf }).promise;
      let text = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page    = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(x => x.str).join(' ') + '\n';
      }
      return text.trim() || `[Could not read ${file.name}]`;
    } catch { return `[PDF: ${file.name}]`; }
  }
  if (file.type === 'text/plain') return await file.text();
  return `[File: ${file.name}]`;
}

/* ── Dynamic Greeting ────────────────────────────────────── */
const GREETINGS = [
  "Ready to dive in?",
  "What can I help you create today?",
  "Your AI assistant is ready.",
  "Ask anything. Build everything.",
  "Welcome back.",
  "Let’s create something amazing.",
  "Start your next idea here.",
  "How can I assist you today?"
];

function DynamicGreeting() {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(100);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = GREETINGS[index];
      setDisplayText(
        isDeleting
          ? fullText.substring(0, displayText.length - 1)
          : fullText.substring(0, displayText.length + 1)
      );

      if (!isDeleting && displayText === fullText) {
        setTimeout(() => setIsDeleting(true), 1500);
        setSpeed(50);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % GREETINGS.length);
        setSpeed(100);
      }
    };

    const timer = setTimeout(handleTyping, speed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, speed]);

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-16 h-16 rounded-[26px] flex items-center justify-center mb-8"
        style={{
          background: 'var(--chip-bg)',
          border: '1px solid var(--chip-border)',
          boxShadow: '0 0 40px var(--glow)',
        }}
      >
        <Sparkles size={30} style={{ color: 'var(--primary)' }} />
      </motion.div>

      <div className="h-24 flex items-center justify-center">
        <motion.h2
          className="text-[32px] sm:text-[42px] font-black tracking-tight leading-tight px-4"
          style={{ 
            fontFamily: 'Poppins,sans-serif', 
            color: 'var(--text)',
            textShadow: '0 0 30px rgba(var(--primary-rgb), 0.2)'
          }}
        >
          {displayText}
          <span className="blinking-cursor ml-1" style={{ height: '0.9em', width: '3px' }} />
        </motion.h2>
      </div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[15px] font-medium mt-6 opacity-40" 
        style={{ color: 'var(--text)' }}
      >
        Lumina AI • Adaptive Intelligence
      </motion.p>
    </div>
  );
}

/* ============================================================
   CHAT INTERFACE
   ============================================================ */
export default function ChatInterface({ onChatUpdate, tab }) {
  const {
    messages, isLoading, isStreaming, studyMode, setStudyMode,
    sendMessage, regenerate, saveMessage, feedback, setFeedbackFor, triggerIntro
  } = useChat(onChatUpdate);

  // Note: Disabled triggerIntro on mount to prioritize the new Dynamic Greeting section.
  // useEffect(() => {
  //   if (messages.length === 0) triggerIntro();
  // }, []);

  const [input,              setInput]              = useState('');
  const [suggestions,        setSuggestions]        = useState([
    'Help me study Calculus',
    'Summarize my notes',
    'Predict exam topics',
  ]);
  const [showAttachMenu,     setShowAttachMenu]     = useState(false);
  const [fileUploading,      setFileUploading]      = useState(false);

  const fileInputRef   = useRef(null);
  const messagesEndRef = useRef(null);
  const attachRef      = useRef(null);
  const textareaRef    = useRef(null);

  /* ── new-chat event (theme-safe, no reload) ─────────────── */
  useEffect(() => {
    const h = () => { window.location.hash = '#chat-' + Date.now(); };
    window.addEventListener('reset-chat', h);
    return () => window.removeEventListener('reset-chat', h);
  }, []);

  /* ── sync mode with sidebar tab ─────────────────────────── */
  useEffect(() => {
    if      (tab === 'tutor') setStudyMode('Tutor');
    else if (tab === 'pyq')   setStudyMode('Deep Dive');
    else                      setStudyMode('Balanced');
  }, [tab, setStudyMode]);

  /* ── refresh suggestions after reply ────────────────────── */
  useEffect(() => {
    if (messages.length > 1 && !isLoading)
      setSuggestions(['Explain further', 'Give an example', 'Key points?']);
  }, [messages.length, isLoading]);

  /* ── scroll to bottom ────────────────────────────────────── */
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
    
    if (isAtBottom || (messages.length > 0 && messages[messages.length-1].role === 'user')) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isStreaming]);

  /* ── close attachment menu on outside click ─────────────── */
  useEffect(() => {
    const h = (e) => {
      if (attachRef.current && !attachRef.current.contains(e.target))
        setShowAttachMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ── auto-resize textarea ────────────────────────────────── */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  /* ── send ────────────────────────────────────────────────── */
  const handleSend = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || isLoading) return;
    if (!textOverride) setInput('');
    setSuggestions([]);
    await sendMessage(text);
  };

  /* ── file upload ─────────────────────────────────────────── */
  const handleFile = async (file) => {
    if (!file) return;
    setFileUploading(true);
    try {
      const content = file.type.startsWith('image/')
        ? `[Image: ${file.name}]`
        : await extractTextFromFile(file);
      await sendMessage(
        `Analyze this in ${studyMode} mode:\n\nFile: ${file.name}\n\n${content.slice(0, 4000)}`
      );
    } catch (e) { console.error(e); }
    finally { setFileUploading(false); setShowAttachMenu(false); }
  };

  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video  = Object.assign(document.createElement('video'), { srcObject: stream });
      await video.play();
      const canvas = Object.assign(document.createElement('canvas'), {
        width: video.videoWidth, height: video.videoHeight,
      });
      canvas.getContext('2d').drawImage(video, 0, 0);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      handleFile(new File([blob], 'screenshot.png', { type: 'image/png' }));
      stream.getTracks().forEach(t => t.stop());
    } catch (e) { console.error(e); }
  };

  const handlePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video  = Object.assign(document.createElement('video'), { srcObject: stream });
      await video.play();
      const canvas = Object.assign(document.createElement('canvas'), {
        width: video.videoWidth, height: video.videoHeight,
      });
      canvas.getContext('2d').drawImage(video, 0, 0);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      handleFile(new File([blob], 'photo.png', { type: 'image/png' }));
      stream.getTracks().forEach(t => t.stop());
    } catch (e) { console.error(e); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative"
      style={{ background: 'var(--bg)' }}>

      {/* ── Messages ─────────────────────────────────────── */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 pt-20 pb-56 no-scrollbar"
      >
        <div className="chat-container-max space-y-10">

          {/* Empty state / Dynamic Greeting */}
          {isEmpty && <DynamicGreeting />}

          {/* Messages list */}
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id || i}
              msg={msg}
              isLast={i === messages.length - 1}
              isStreaming={isStreaming && i === messages.length - 1}
              onRegenerate={regenerate}
              onSave={saveMessage}
              feedback={feedback?.[msg.id]}
              onFeedback={setFeedbackFor}
            />
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isLoading && <TypingBubble />}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* ── Composer ─────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
        <div className="chat-container-max space-y-4 pointer-events-auto">

          {/* Suggestion chips */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap justify-center gap-2"
              >
                {suggestions.map((s, i) => (
                  <SuggestionChip key={i} label={s} delay={i * 0.06} onSend={handleSend} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input box */}
          <div className="relative group">
            {/* Ambient glow on focus */}
            <div className="absolute -inset-1 rounded-[26px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
              style={{ background: 'radial-gradient(ellipse,var(--glow),transparent 70%)' }} />

            <div className="relative rounded-[22px] p-3.5 pb-3"
              style={{
                background: 'var(--sidebar)',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              }}>
              <div className="flex items-end gap-2.5">

                {/* Attachment trigger */}
                <div className="relative" ref={attachRef}>
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAttachMenu(v => !v)}
                    className="p-2.5 rounded-xl transition-all"
                    style={{
                      background: showAttachMenu ? 'var(--primary)' : 'var(--chip-bg)',
                      color:      showAttachMenu ? '#fff'            : 'var(--text-3)',
                    }}>
                    <Plus size={19} style={{
                      transform:  showAttachMenu ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }} />
                  </motion.button>

                  <AnimatePresence>
                    {showAttachMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.93, y: 10 }}
                        animate={{ opacity: 1, scale: 1,    y: -10 }}
                        exit={{   opacity: 0, scale: 0.93, y: 10  }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-3 w-58 rounded-[20px] z-50 overflow-hidden p-2 glass-dropdown"
                        style={{ minWidth: '220px' }}
                      >
                        {[
                          { icon: <FileText size={16}/>, label: 'Upload File',  sub: 'PDF, TXT',   onClick: () => fileInputRef.current?.click(), color: '#60a5fa' },
                          { icon: <Monitor size={16}/>,  label: 'Screen Clip',  sub: 'Capture',    onClick: handleScreenshot,                    color: 'var(--primary-h)' },
                          { icon: <Camera size={16}/>,   label: 'Take Photo',   sub: 'Camera',     onClick: handlePhoto,                         color: '#34d399' },
                        ].map((item, i) => (
                          <AttachItem key={i} {...item} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask Lumina AI anything…"
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-[15px] font-medium py-2.5 px-1 max-h-44 outline-none"
                  style={{
                    color:       'var(--text)',
                    caretColor:  'var(--primary)',
                    lineHeight:  '1.65',
                    minHeight:   '42px',
                  }}
                />

                {/* Send button */}
                <motion.button
                  whileHover={{ scale: input.trim() ? 1.07 : 1 }}
                  whileTap={{   scale: input.trim() ? 0.92 : 1 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl flex-shrink-0 transition-all"
                  style={{
                    background: input.trim()
                      ? 'linear-gradient(135deg,var(--primary),var(--secondary))'
                      : 'var(--chip-bg)',
                    boxShadow: input.trim() ? '0 4px 14px var(--glow)' : 'none',
                    color:     input.trim() ? '#fff' : 'var(--text-3)',
                  }}
                >
                  {isLoading
                    ? <div className="w-5 h-5 rounded-full border-2 animate-spin"
                        style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
                    : <ArrowUp size={19} />
                  }
                </motion.button>
              </div>

              {/* Study mode row */}
              <div className="flex items-center mt-2 pt-2 px-1"
                style={{ borderTop: '1px solid var(--border)' }}>
                <StudyModeToggle mode={studyMode} onChange={setStudyMode} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} className="hidden"
        onChange={e => handleFile(e.target.files[0])} />

      {/* File analysis overlay */}
      <AnimatePresence>
        {fileUploading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-[100]"
            style={{ background: 'var(--overlay)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center gap-5 p-10 rounded-[36px]"
              style={{
                background: 'var(--sidebar)',
                border:     '1px solid var(--chip-border)',
                boxShadow:  'var(--shadow)',
              }}>
              <div className="w-12 h-12 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--chip-bg)', borderTopColor: 'var(--primary)' }} />
              <span className="text-[12px] font-black uppercase tracking-[0.18em]"
                style={{ color: 'var(--text-3)' }}>
                Analyzing file…
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Suggestion Chip ─────────────────────────────────────── */
function SuggestionChip({ label, delay, onSend }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
      onClick={() => onSend(label)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap"
      style={{
        background:   hov ? 'var(--chip-bg)' : 'var(--chip-bg)',
        border:       `1px solid ${hov ? 'var(--primary)' : 'var(--chip-border)'}`,
        color:        hov ? 'var(--primary-h)' : 'var(--text-2)',
      }}>
      {label}
    </motion.button>
  );
}

/* ── Attachment Menu Item ─────────────────────────────────── */
function AttachItem({ icon, label, sub, onClick, color }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all"
      style={{ background: hov ? 'var(--chip-bg)' : 'transparent' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--chip-bg)', color }}>
        {icon}
      </div>
      <div>
        <p className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{label}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{sub}</p>
      </div>
    </button>
  );
}
