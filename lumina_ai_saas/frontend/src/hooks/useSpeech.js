import { useState, useRef, useCallback } from 'react';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * Hook for browser Web Speech API (speech-to-text).
 * Returns: { isListening, transcript, start, stop, supported }
 */
export function useSpeech(onTranscript) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const supported = Boolean(SpeechRecognition);

  const start = useCallback(() => {
    if (!supported || isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      const current = final || interim;
      setTranscript(current);
      if (onTranscript) onTranscript(current);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported, isListening, onTranscript]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return { isListening, transcript, start, stop, supported };
}
