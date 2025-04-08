import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { cn } from '../../utils/utils';
import { processQuery } from "../../lib/text2sql";
import { generateResponse } from '../../lib/openai';
import { supabase } from '../../lib/supabase';
import { Transaction, ContextDocument } from '../../types';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export type VATChatbotProps = {
  transactions: Transaction[];
  documents: ContextDocument[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ transactions }: VATChatbotProps){
  const [isExpanded, setIsExpanded] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [loading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkOnlineStatus();
  }, []);

  const checkOnlineStatus = async () => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('OpenAI API key not found');
        setIsOnline(false);
        return;
      }
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (response.ok) {
        setIsOnline(true);
      } else {
        const error = await response.json();
        console.error('OpenAI API error:', error);
        setIsOnline(false);
      }
    } catch (error) {
      console.error('Error checking OpenAI status:', error);
      setIsOnline(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userMessage: Message = { 
      id: crypto.randomUUID(), // Unique ID
      text: input, 
      sender: "user", 
      timestamp: new Date() 
    };
  
    setMessages(prev=>[...prev, userMessage]);
    setInput('');
    setIsLoading(true);
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if the query looks like a VAT calculation request
      const isVATQuery = input.toLowerCase().includes('vat') || 
                        input.toLowerCase().includes('tax') ||
                        input.toLowerCase().includes('transactions')||
                        input.toLowerCase().includes('Compliance')||
                        input.toLowerCase().includes('input') ||
                        input.toLowerCase().includes('output');
      
      let response=" ";

      if (isVATQuery) {
        response = await processQuery(input,chatHistory);
      }
     else {
    // Use OpenAI for general queries
    response = await generateResponse(input, '', documents);
  }

  setChatHistory([...chatHistory, input]);

      const botMessage: Message = { 
        id: crypto.randomUUID(), 
        text: response|| "I couldn't find any relevant information.", 
        sender: "bot", 
        timestamp: new Date() 
      };
  
      setMessages(prev=>[...prev, botMessage]);
    } catch (error) {
      console.error("Error processing message:", error);

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text:  "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: "bot",
        timestamp: new Date()
      };
  
      setMessages(prev=>[...prev, errorMessage]);
      console.error("Error fetching VAT data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className={cn(
      'border-l border-gray-200 bg-white transition-all duration-300',
      isExpanded ? 'w-96' : 'w-16'
    )}>
      <div className="h-full flex flex-col">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-4 border-b border-gray-200 flex items-center gap-2"
        >
          <MessageSquare className="h-5 w-5 text-blue-600" />
          {isExpanded && <span className="font-medium">AI Assistant</span>}
        </button>
        
        {isExpanded && messages.length === 0 && (
    <div className="space-y-4">
    <div className="bg-gray-100 rounded-lg p-3">
      <p className="text-sm">Hello! How can I help you today?</p>
      <ul>
        <p>you can ask me about project metrics</p>
      </ul>
    </div>
  </div>
  )}

        {isExpanded && (
          <>
            <div className="flex-1 p-4 overflow-auto">
              {messages.map((msg) => (
    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`p-3 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
        <p>{msg.text}</p>
        <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isOnline ? "Ask me about your VAT..." : "Assistant is offline"}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isOnline || loading}
                />
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}