// src/components/ai/Chatbot.js
import React, { useState, useContext, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AuthContext } from '../../context/AuthContext';
import aiService from '../../services/aiService';
import './Chatbot.css';

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
  </svg>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: '¡Hola! Soy tu asistente de investigación. ¿En qué puedo ayudarte hoy?', sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;

    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Mapea el historial al formato que espera el backend:
      // [{ role:'user'|'model', content:'...' }, ...]
      const mappedHistory = messages
        .filter(m => m.sender === 'user' || m.sender === 'ai')
        .map(m => ({
          role: m.sender === 'ai' ? 'model' : 'user',
          content: m.text
        }));

      // Llama al servicio correcto y usa la clave correcta del response
      const { text } = await aiService.aiChat({
        message: userMessage.text,
        history: mappedHistory
      });

      const aiMessage = {
        text: (typeof text === 'string' && text.trim()) ? text : 'Lo siento, no pude procesar tu solicitud.',
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const msg = error?.response?.data?.message
        ? `Lo siento, no pude procesar tu solicitud. ${error.response.data.message}`
        : 'Lo siento, no pude procesar tu solicitud.';
      setMessages(prev => [...prev, { text: msg, sender: 'ai', isError: true }]);
      console.error('Chatbot error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <h3>Asistente de IA</h3>
          <button onClick={() => setIsOpen(false)}><CloseIcon /></button>
        </div>

        <div className="chatbot-messages" ref={chatMessagesRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          ))}
          {isLoading && <div className="message ai typing-indicator"><span>.</span><span>.</span><span>.</span></div>}
        </div>

        <form className="chatbot-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu pregunta..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>Enviar</button>
        </form>
      </div>

      <button className="chatbot-toggle-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
};

export default Chatbot;
