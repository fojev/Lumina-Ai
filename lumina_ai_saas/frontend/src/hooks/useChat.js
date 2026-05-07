import { useState, useCallback, useRef } from 'react';
import { chatService } from '../services/api';

/**
 * Central chat state hook.
 * Handles messages, saved chats, study mode, loading, and regeneration.
 */
export function useChat(onChatUpdate) {
  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'ai',
      content: "Hello! I'm Lumina AI — your intelligent study companion. Ask me anything about your exams, notes, or topics you're struggling with.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    try {
      // Ensure a chat session exists
      let currentChatId = chatId;
      if (!currentChatId) {
        const newChat = await chatService.createChat();
        currentChatId = newChat.id;
        setChatId(currentChatId);
      }

      // Build history before adding the new user message
      const history = buildHistory([...messages, userMsg]);

      const response = await chatService.sendMessage(
        currentChatId,
        content.trim(),
        history,
        studyMode,
        collegeRef.current
      );

      const aiMsg = {
        id: response.id || Date.now() + 1,
        role: 'ai',
        content: response.content,
      };
      setMessages(prev => [...prev, aiMsg]);

      // Notify sidebar of new chat title
      if (onChatUpdate) {
        onChatUpdate(content.trim().substring(0, 32) + (content.length > 32 ? '…' : ''));
      }
    } catch (err) {
      // Fallback when backend is down or auth fails
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || 
                       "I'm having trouble reaching the server right now. Please make sure the backend is running and you're logged in.";
      
      if (onChatUpdate) {
        onChatUpdate(content.trim().substring(0, 32) + (content.length > 32 ? '…' : ''));
      }
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          content: errorMsg,
        },
      ]);
    } finally {
      setIsLoading(false);
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

  return {
    messages,
    setMessages,
    isLoading,
    studyMode,
    setStudyMode,
    savedMessages,
    saveMessage,
    feedback,
    setFeedbackFor,
    sendMessage,
    regenerate,
  };
}
