
import React, { useState, useContext, useRef, useEffect } from "react";
import { Context } from "../store/Context";
import ProductCard from './AISuggestionCard';
import AISuggestionCardSpecific from './AISuggestionCardSpecific';


function AISuggestion() {
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user,backend } = useContext(Context);
  const userId = user ? user._id : 'guest';
  const headers = { 'Content-Type': 'application/json', 'user-id': userId };
  const userID = user?._id; 

  const chatContainerRef = useRef(null);
  
  const [userProfile, setUserProfile] = useState(null);

  const getUserProfile = async () => {
    try {
      if (!userID || userID === 'guest') {
        return { error: "User not logged in" };
      }
  
      const res = await fetch(`${backend}/api/products/profile/${userID}`); 
      const data = await res.json();
      if (data.success) return data.user;
      else return { error: data.message };
    } catch (err) {
      console.error("Fetch error:", err);
      return { error: "Failed to fetch user profile" };
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId || userId === 'guest') return;
      const profile = await getUserProfile();
      if (!profile.error) setUserProfile(profile);
    };
    fetchProfile();
  }, [userId]); 


    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            const scrollThreshold = 50; 
            const isScrolledNearBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + scrollThreshold;

            if (isScrolledNearBottom) {
                container.scrollTop = container.scrollHeight;
            }
        }
    },  [messages, isLoading, products, selectedProduct]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    setSelectedProduct(null);
    setProducts([]); 

    const userMessage = { sender: "user", text: input };
    
    const chatHistory = messages.map(msg => ({
      sender: msg.sender,
      text: msg.text
    }));

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    setMessages(prev => [...prev, { sender: 'ai', text: '' }]);
    let accumulatedText = "";

    try {
      const res = await fetch(`${backend}/api/ai/chat`, { 
        method: 'POST',
        headers: headers, 
        body: JSON.stringify({
          message: input,
          history: chatHistory,
          userProfile: userProfile 
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let partialLine = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsLoading(false); 
          break; 
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split('\n');
        partialLine = lines.pop() || ""; 

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const chunkData = JSON.parse(line);

            
            switch (chunkData.type) {
              case 'text':

                const typingParts = chunkData.content.split(/(\s+)/);
                for (const part of typingParts) {
                  accumulatedText += part;
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].text = accumulatedText;
                    return updated;
                  });
                  await new Promise(res => setTimeout(res, 25)); 
                }
                break;

              case 'products':
                setProducts(chunkData.data);
                setSelectedProduct(null);
                break;
              
              case 'productDetail':
                setSelectedProduct(chunkData.data);
                setProducts([]);
                break;

              case 'error':
                // Error message display karein
                accumulatedText += `\n\n**Error:** ${chunkData.message}`;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].text = accumulatedText;
                  return updated;
                });
                break;
              
              case 'end':
                // Stream khatm ho gaya
                setIsLoading(false);
                break;
            }
          } catch (jsonErr) {
            console.error("Failed to parse stream line:", line, jsonErr);
          }
        }
      }

    } catch (err) {
      console.error(err);
        setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].text = 'Connection error. 😅 Please try again.';
            return updated;
        });
      setIsLoading(false);
    } 
  };


  return (
    <div className="d-flex flex-column" style={{ minHeight: '85vh' }}>
      <div className="text-center mb-4">
        <h3 className="text-primary fw-bold">AI Shopping Assistant</h3>
        <p className="text-muted">Ask me anything about products!</p>
      </div>
      
      <div className="flex-grow-1 d-flex flex-column">
        <div className="card border-0 shadow-sm mb-3 flex-grow-1 d-flex flex-column">
          <div className="card-header bg-transparent border-bottom">
            <h6 className="mb-0 text-dark">💬 Conversation</h6>
          </div>
          <div className="card-body overflow-y-auto p-3" ref={chatContainerRef} >
            {messages.length === 0 ? (
              <div className="text-center text-muted my-5">
                <div className="mb-3">
                  <i className="fas fa-robot fa-3x text-primary opacity-50"></i>
                </div>
                <p>Start a conversation to get product suggestions!</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div className={`d-flex align-items-start ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`} style={{ maxWidth: '85%' }}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${msg.sender === 'user' ? 'bg-primary ms-2' : 'bg-success me-2'}`} 
                         style={{ width: '35px', height: '35px', flexShrink: 0 }}>
                      {msg.sender === 'user' ? (
                        <i className="fas fa-user text-white small"></i>
                      ) : (
                        <i className="fas fa-robot text-white small"></i>
                      )}
                    </div>
                    
                    <div className={`px-3 py-2 rounded-3 shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white border-0' 
                        : 'bg-light text-dark border'
                    }`}>
                      {msg.sender === 'ai' ? (
                        <div className="ai-message">
                          {msg.text
                            .replace(/\* /g, '')
                            .split('\n')
                            .map((line, idx) => (
                              <div key={idx} className={line.trim() === '' ? 'mb-1' : ''}>
                                {line.trim() === '' ? <br /> : line}
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <div className="user-message">
                          {msg.text.split('\n\n[Products Shown to User:')[0]}
                        </div>
                      )}
                      
                    
                      {msg.sender === 'ai' && i === messages.length - 1 && isLoading && (
                        <span className="blinking-cursor ms-1">|</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            
            
          </div>
        </div>

        {!isLoading && !selectedProduct && products.length > 0 && (
          <div className="row g-3">
            {products.map((product) => (
              <div key={product._id} className="col-12 col-md-6 col-lg-4 d-flex justify-content-center">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      
        {!isLoading && selectedProduct && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 text-dark">📋 Product Details</h6>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedProduct(null)}
              >
                <i className="fas fa-arrow-left me-1"></i> Back to List
              </button>
            </div>
            <div className="flex-grow-1 overflow-auto">
              <AISuggestionCardSpecific key={selectedProduct._id} product={selectedProduct} />
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="mt-3">
        <div className="input-group input-group-lg shadow-sm rounded-pill">
          <input 
            type="text" 
            className="form-control border-0 rounded-pill ps-4" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask about products, features, or anything else..." 
            disabled={isLoading} 
            style={{ backgroundColor: '#f8f9fa' }}
          />
          <button 
            type="submit" 
            disabled={isLoading || input.trim() === ''}
            className="btn btn-primary rounded-pill px-4 ms-2 position-relative"
            style={{ minWidth: '120px' }}
          >
            {isLoading ? (
              <div className="d-flex align-items-center justify-content-center">
                {/* --- YEH THA ERROR --- */}
                <div className="ai-chat-spinner me-2"></div>
                Thinking...
                {/* --- END ERROR --- */}
              </div>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                {/* --- YEH THA ERROR --- */}
                Send
                {/* --- END ERROR --- */}
              </>
            )}
          </button>
        </div>
        <div className="text-center mt-2">
          <small className="text-muted">
            Try: "Show me laptops under ₹50,000" or "Best smartphones"
          </small>
        </div>
      </form>

      {/* CSS (style jsx) */}
      <style jsx>{`
        /* AI Chat Custom Spinner */
        .ai-chat-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: ai-spin 0.8s linear infinite;
        }

        @keyframes ai-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Blinking cursor for typing effect */
        .blinking-cursor {
          animation: blink 1s infinite;
          color: #6c757d;
          font-weight: bold;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* AI Message Styling */
        .ai-message {
          line-height: 1.5;
        }

        .user-message {
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

export default AISuggestion;