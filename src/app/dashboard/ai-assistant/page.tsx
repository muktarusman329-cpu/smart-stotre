'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Send, Sparkles, TrendingUp, AlertTriangle, DollarSign, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Business Assistant powered by DeepSeek on NVIDIA. Ask me anything about your supermarket performance, inventory, sales, or business insights.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickQuestions = [
    'How is my business doing this month?',
    'What products should I restock?',
    'Which products are selling the best?',
    'How can I improve my profit margins?',
    'What are my low stock items?',
  ];

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: message }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Show detailed error message
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${data.error}${data.details ? `\n\nDetails: ${data.details}` : ''}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setError(data.error);
      }
    } catch (_error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Network error: Unable to connect to AI service. Please check your internet connection and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  const handleRetry = () => {
    // Retry the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove the last error message if exists
      setMessages(prev => prev.filter(m => m !== prev[prev.length - 1] || m.role !== 'assistant' || !m.content.startsWith('Error')));
      handleSend(lastUserMessage.content);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="AI Business Assistant" userRole="admin" />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Quick Questions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Questions</h3>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                  placeholder="Ask about your business..."
                  className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white font-semibold outline-none placeholder:text-slate-400"
                  disabled={loading}
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={loading || !input.trim()}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span className="font-bold">Send</span>
                </button>
                {error && (
                  <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="px-6 py-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                    title="Retry last message"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span className="font-bold">Retry</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Sales Analysis</p>
                  <p className="text-xs text-gray-500">Track performance trends</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Alerts</p>
                  <p className="text-xs text-gray-500">Low stock & expiry warnings</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Profit Insights</p>
                  <p className="text-xs text-gray-500">Revenue & expense analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
