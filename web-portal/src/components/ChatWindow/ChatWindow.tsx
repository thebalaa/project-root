import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types/chat';
import { sendMessageToDiscord } from '../../services/discordService';
import './ChatWindow.css';
import LinkPreview from '../LinkPreview/LinkPreview';

// Helper function to clean and validate URLs
const cleanUrl = (url: string): string => {
  // Remove multiple occurrences of "https://"
  const cleanedUrl = url.replace(/(https?:\/\/)+(.*)/i, 'https://$2');
  try {
    new URL(cleanedUrl);
    return cleanedUrl;
  } catch {
    return '';
  }
};

// Helper function to extract valid URLs from text
const extractUrls = (text: string | undefined): string[] => {
  if (!text) return [];
  const urlPattern = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  const matches = text.match(urlPattern) || [];
  return matches
    .map(cleanUrl)
    .filter(url => url !== '');
};

const formatMessageWithLinks = (text: string | undefined) => {
  if (!text) return '';
  
  const urls = extractUrls(text);
  let formattedText = text;

  // Replace malformed URLs with cleaned versions
  urls.forEach(cleanedUrl => {
    const urlPattern = new RegExp(`https?:\\/\\/[^\\s<]+${cleanedUrl.split('//')[1]}`, 'g');
    formattedText = formattedText.replace(urlPattern, cleanedUrl);
  });

  const parts = formattedText.split(/(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g);

  return (
    <>
      {parts.map((part, index) => {
        if (urls.includes(part)) {
          return (
            <React.Fragment key={index}>
              <a 
                href={part} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="chat-link"
              >
                {part}
              </a>
              <LinkPreview url={part} />
            </React.Fragment>
          );
        }
        return part;
      })}
    </>
  );
};

// Add these types at the top of the file
interface BotResponse {
  id: string;
  content: string;
}

interface DiscordResponse {
  success: boolean;
  messageId: string;
  responses: BotResponse[];
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessageToDiscord(inputMessage) as DiscordResponse;
      
      // Handle the bot responses
      if (response.responses && response.responses.length > 0) {
        response.responses.forEach((botResponse: BotResponse) => {
          const botMessage: ChatMessage = {
            id: botResponse.id || Date.now().toString() + '-bot',
            text: botResponse.content,
            sender: 'bot',
            timestamp: new Date(),
            discordMessageId: response.messageId,
          };
          setMessages(prev => [...prev, botMessage]);
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        text: 'Earthlink comms are still under development. Come join us on the Flagship Vessel of the Bulldog Federation. https://discord.gg/U2xMyz5K.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Chat with Bulldroid 🤖</h3>
      </div>
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              <p>{formatMessageWithLinks(message.text)}</p>
              <span className="timestamp">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <p className="typing-indicator">Interstellar comm link initiated...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
          disabled={isLoading}
        />
        <button type="submit" className="send-button" disabled={isLoading}>
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow; 