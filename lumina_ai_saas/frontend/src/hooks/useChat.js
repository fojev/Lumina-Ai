import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '../services/api';

/**
 * Central chat state hook.
 * Handles messages, saved chats, study mode, loading, streaming, memory, and reset.
 */
export function useChat(onChatUpdate) {
  const [messages, setMessages]       = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [isStreaming, setIsStreaming]  = useState(false);
  const [chatId, setChatId]           = useState(null);
  const [studyMode, setStudyMode]     = useState('normal');
  const [savedMessages, setSavedMessages] = useState([]);
  const [feedback, setFeedback]       = useState({});
  const collegeRef = useRef(localStorage.getItem('user_college') || '');

  // ── Build history for context window (last 20 messages for smart memory)
  const buildHistory = useCallback((msgs) => {
    return msgs
      .filter(m => m.id !== 'init')
      .slice(-20)
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        // Strip internal blocks from history to keep context clean
        content: (m.content || '')
          .replace(/---SUGGESTIONS---[\s\S]*/g, '')
          .replace(/---SOURCES---[\s\S]*/g, '')
          .trim(),
      }))
      .filter(m => m.content); // skip empty
  }, []);

  // ── Reset to blank state (for New Chat)
  const resetChat = useCallback(() => {
    setMessages([]);
    setChatId(null);
    setIsLoading(false);
    setIsStreaming(false);
    setFeedback({});
  }, []);

  // ── Send message with streaming + onFirstToken callback
  const sendMessage = useCallback(async (content, onFirstToken) => {
    if (!content.trim() || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', content: content.trim() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let currentChatId = chatId;
      if (!currentChatId) {
        const newChat = await chatService.createChat();
        currentChatId = newChat.id;
        setChatId(currentChatId);
      }

      const history = buildHistory([...messages, userMsg]);
      
      // Start streaming - we don't add the AI message until the first token arrives
      // to avoid "duplicate" empty bubbles alongside the thinking indicator.
      const aiMsgId = Date.now() + 1;
      let fullContent = '';
      let firstTokenReceived = false;

      setIsStreaming(true);

      await chatService.streamMessage(
        currentChatId,
        content.trim(),
        history,
        studyMode,
        collegeRef.current,
        (data) => {
          if (data.content) {
            if (!firstTokenReceived) {
              firstTokenReceived = true;
              
              // 1. Stop thinking state
              setIsLoading(false);
              if (onFirstToken) onFirstToken();
              
              // 2. Add the AI message to list for the first time
              fullContent = data.content;
              setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: fullContent }]);
            } else {
              // 3. Update existing message
              fullContent += data.content;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: fullContent } : m
              ));
            }
          }
          if (data.id && data.done) {
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, id: data.id } : m
            ));
          }
          if (data.error) {
            throw new Error(data.error);
          }
        }
      );


      if (onChatUpdate) {
        onChatUpdate(content.trim().substring(0, 32) + (content.length > 32 ? '…' : ''));
      }
    } catch (err) {
      const errorMsg = err.message || "I'm having trouble reaching the server. Please check your connection.";
      if (onFirstToken) onFirstToken(); // Stop thinking state even on error
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', content: `Error: ${errorMsg}` },
      ]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [chatId, isLoading, messages, studyMode, buildHistory, onChatUpdate]);

  const regenerate = useCallback(async (messageId) => {
    if (isLoading) return;
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx <= 0) return;
    const userMsg = messages[idx - 1];

    setMessages(prev => prev.filter(m => m.id !== messageId));
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const history = buildHistory(messages.slice(0, idx - 1));
      const response = await chatService.sendMessage(
        chatId, userMsg.content, history, studyMode, collegeRef.current
      );
      setMessages(prev => [
        ...prev,
        { id: response.id || Date.now(), role: 'ai', content: response.content },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'ai', content: 'Failed to regenerate. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [chatId, isLoading, messages, studyMode, buildHistory]);

  const saveMessage = useCallback((msg) => {
    setSavedMessages(prev => {
      if (prev.find(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const setFeedbackFor = useCallback((messageId, type) => {
    setFeedback(prev => ({ ...prev, [messageId]: prev[messageId] === type ? null : type }));
  }, []);

  // ── Load a past chat by ID (persistent memory)
  const loadChat = useCallback(async (id, pastMessages) => {
    setChatId(id);
    // Convert DB messages to UI format
    const uiMessages = (pastMessages || []).map(m => ({
      id: m.id,
      role: m.role === 'assistant' ? 'ai' : m.role,
      content: m.content || '',
    }));
    setMessages(uiMessages);
    setFeedback({});
  }, []);

  const triggerIntro = useCallback(async () => {
    if (messages.length > 0 || isLoading) return;
    setIsLoading(true);
    setIsStreaming(true);
    
    try {
      let currentChatId = chatId;
      if (!currentChatId) {
        const newChat = await chatService.createChat();
        currentChatId = newChat.id;
        setChatId(currentChatId);
      }

      const introPrompt = "Introduce yourself as Lumina AI in a short, conversational, and human-like way. Mention that you are here to help with studies and academic excellence. Be modern and premium in tone. Do not use robotic language.";
      
      const aiMsgId = Date.now();
      let fullContent = '';
      let firstTokenReceived = false;

      await chatService.streamMessage(
        currentChatId,
        introPrompt,
        [],
        studyMode,
        collegeRef.current,
        (data) => {
          if (data.content) {
            if (!firstTokenReceived) {
              firstTokenReceived = true;
              setIsLoading(false);
              fullContent = data.content;
              setMessages([{ id: aiMsgId, role: 'ai', content: fullContent }]);
            } else {
              fullContent += data.content;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: fullContent } : m
              ));
            }
          }
          if (data.id && data.done) {

            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, id: data.id } : m
            ));
          }
        }
      );
    } catch (e) {
      console.error('Intro failed', e);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [chatId, isLoading, messages, studyMode]);

  return {
    messages,
    setMessages,
    isLoading,
    isStreaming,
    studyMode,
    setStudyMode,
    savedMessages,
    saveMessage,
    feedback,
    setFeedbackFor,
    sendMessage,
    regenerate,
    resetChat,
    loadChat,
    triggerIntro,
  };
}
