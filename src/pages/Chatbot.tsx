import React, { useState } from 'react';
import { MessageSquare, ArrowRight, X } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string, isUser: boolean }>>([]);
  const [input, setInput] = useState('');

  const qaPairs = {
    "What's the status of my delivery?": "Your delivery is currently in transit and will arrive within 2 hours. You can track it in real-time on the map.",
    "How can I contact support?": "You can reach our support team 24/7 at support@example.com or call +1 (555) 123-4567."
  };

  const keywordResponses: { [key: string]: string } = {
    "check.*warehouses.*baby diapers": "🚨 Warehouse 3 in Pune has only 120 units left, which is below the threshold of 200 units. (Agent: InventoryMonitor)",
    "restock.*mumbai.*warehouse": "✅ Restock scheduled. 500 units of baby diapers will be dispatched from Mumbai Central to Warehouse 3 tomorrow at 9:00 AM. (Agent: ReplenishmentScheduler)",
    "fuel-efficient.*mumbai.*bangalore": "🗺 Optimal route calculated using traffic & elevation data.\nEstimated fuel savings: 14%\nDelivery order: Store 22 → Store 15 → Store 31 → Store 08 → Store 19\nETA: 7 hours 45 minutes (Agent: RouteOptimizer)",
    "send alerts.*stores": "📢 Alert sent to all 5 stores with ETA and delivery details. (Agent: NotificationDispatcher)",
    "sustainability report.*reverse logistics": "📄 Generated!\n\n12,000 kg CO₂ offset via consolidated return pickups\n\n28% improvement in return reuse vs landfill rate\n\nPDF report emailed to ops@greenlogistics.com (Agent: ReportGenerator)"
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

    setInput('');

    const response = getCustomResponse(userMessage);

    setTimeout(() => {
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 500);
  };

  const getCustomResponse = (userMessage: string): string => {
    if (qaPairs[userMessage]) return qaPairs[userMessage];

    for (const pattern in keywordResponses) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(userMessage)) {
        return keywordResponses[pattern];
      }
    }

    return "🤖 Sorry, I didn't understand that. Please try a different question.";
  };

  const handleQuestionClick = (question: string) => {
    setMessages(prev => [...prev, { text: question, isUser: true }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { text: qaPairs[question as keyof typeof qaPairs], isUser: false }]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105 ${
          isOpen
            ? 'bg-gradient-to-br from-white to-white hover:from-white hover:to-white'
            : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-0.5 right-0 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 relative">
            {/* Inner gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-red-400 z-10"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative">
              <h3 className="font-bold text-xl mb-1">Store Assistant</h3>
              <p className="text-sm opacity-90">How can I help you today?</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-lg font-medium">Ask me about your delivery!</p>
                <p className="text-sm mt-2">I'm here to help with all your questions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                        msg.isUser
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      <p className={`text-sm leading-relaxed ${msg.isUser ? 'text-white' : 'text-gray-800'} whitespace-pre-line`}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center bg-white rounded-xl border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <input
                type="text"
                placeholder="Type your question..."
                className="flex-1 px-4 py-3 bg-transparent text-sm focus:outline-none placeholder-gray-500"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                className="p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-r-xl transition-colors"
              >
                {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg> */}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="p-4 pt-0 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(qaPairs).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="text-xs bg-white hover:bg-blue-50 text-blue-700 px-3 py-2 rounded-full border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-sm"
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
