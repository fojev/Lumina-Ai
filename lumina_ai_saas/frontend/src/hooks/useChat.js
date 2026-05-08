import { useState, useCallback, useRef } from 'react';
import { chatService } from '../services/api';

/**
 * Central chat state hook.
 * Handles messages, saved chats, study mode, loading, and regeneration.
 */
export function useChat(onChatUpdate) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [studyMode, setStudyMode] = useState('normal');
  const [savedMessages, setSavedMessages] = useState([]);
  const [feedback, setFeedback] = useState({}); // { messageId: 'like'|'dislike' }
  const collegeRef = useRef(localStorage.getItem('user_college') || '');

  // Build history array from current messages (last 10 for context window)
  const buildHistory = useCallback((msgs) => {
    return msgs
      .filter(m => m.id !== 'init')
      .slice(-10)
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));
  }, []);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', content: content.trim() };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    try {
      let currentChatId = chatId;
      if (!currentChatId) {
        const newChat = await chatService.createChat();
        currentChatId = newChat.id;
        setChatId(currentChatId);
      }

      const history = buildHistory([...messages, userMsg]);
      
      // Initialize empty AI message for streaming
      const aiMsgId = Date.now() + 1;
      let fullContent = "";
      
      setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: "" }]);

      await chatService.streamMessage(
        currentChatId,
        content.trim(),
        history,
        studyMode,
        collegeRef.current,
        (data) => {
          if (data.content) {
            setIsLoading(false);
            fullContent += data.content;
            setMessages(prev => prev.map(m => 
              m.id === aiMsgId ? { ...m, content: fullContent } : m
            ));
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
    // Find the user message before this AI message
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx <= 0) return;
    const userMsg = messages[idx - 1];

    // Remove the existing AI message and resend
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

      // Special hidden prompt for the opening experience
      const introPrompt = "Introduce yourself as Lumina AI in a short, conversational, and human-like way. Mention that you are here to help with studies and academic excellence. Be modern and premium in tone. Do not use robotic language.";
      
      const aiMsgId = Date.now();
      let fullContent = "";
      setMessages([{ id: aiMsgId, role: 'ai', content: "" }]);

      await chatService.streamMessage(
        currentChatId,
        introPrompt,
        [],
        studyMode,
        collegeRef.current,
        (data) => {
          if (data.content) {
            setIsLoading(false);
            fullContent += data.content;
            setMessages(prev => prev.map(m => 
              m.id === aiMsgId ? { ...m, content: fullContent } : m
            ));
          }
          if (data.id && data.done) {
            setMessages(prev => prev.map(m => 
              m.id === aiMsgId ? { ...m, id: data.id } : m
            ));
          }
        }
      );
    } catch (e) {
      console.error("Intro failed", e);
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
    triggerIntro,
  };
}
