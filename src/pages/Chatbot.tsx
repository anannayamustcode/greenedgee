import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);

  // Predefined questions and answers
  const qaPairs = {
    "What's the status of my delivery?": "Your delivery is currently in transit and will arrive within 2 hours. You can track it in real-time on the map.",
    "How can I contact support?": "You can reach our support team 24/7 at support@example.com or call +1 (555) 123-4567."
  };

  const handleQuestionClick = (question: string) => {
    // Add user question
    setMessages(prev => [...prev, { text: question, isUser: true }]);
    
    // Add bot response after a short delay
    setTimeout(() => {
      setMessages(prev => [...prev, { text: qaPairs[question as keyof typeof qaPairs], isUser: false }]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chatbot toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${isOpen ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chatbot window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-t-xl rounded-bl-xl shadow-xl flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white p-4 rounded-t-xl">
            <h3 className="font-bold text-lg">Store Assistant</h3>
            <p className="text-sm opacity-80">How can I help you today?</p>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p>Ask me about your delivery!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg max-w-[80%] ${msg.isUser ? 'bg-blue-100 ml-auto rounded-br-none' : 'bg-yellow-50 mr-auto rounded-bl-none'}`}
                  >
                    <p className={msg.isUser ? 'text-blue-800' : 'text-gray-800'}>
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick questions */}
          <div className="p-3 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(qaPairs).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-1 rounded-full transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;