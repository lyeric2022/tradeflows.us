import React, { useState, useEffect, useRef, useCallback } from 'react';

// Trump avatar component
const TrumpAvatar = ({ size = 36 }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: '#e41e3f', // Trump red
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: size * 0.4,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexShrink: 0
  }}>
    DT
  </div>
);

// User avatar component
const UserAvatar = ({ size = 36 }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: '#E8F0FE', // Lighter blue
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1E88E5', // Primary blue
    fontWeight: 'bold',
    fontSize: size * 0.4,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexShrink: 0
  }}>
    P
  </div>
);

// Fact Check Icon Component
const FactCheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px', flexShrink: 0 }}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#34a853"/> {/* Green check */}
  </svg>
);


const ConversePage = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false); // New typing indicator state
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isAtBottomRef = useRef(true);
  const messageContainerRef = useRef(null);
  const websocket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const inputRef = useRef(null);

  // Fetch initial history
  const fetchInitialHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      // Ensure the backend endpoint is correct
      const response = await fetch('http://127.0.0.1:8000/trump-chat-history');
      if (!response.ok) throw new Error('Failed to fetch initial chat history');
      const data = await response.json();
      // Map incoming history to ensure consistent structure
      const formattedHistory = data.messages.map(msg => ({
        ...msg,
        // Ensure backward compatibility if old format messages exist
        content: msg.content || msg.trump_response,
      }));
      setChatHistory(formattedHistory);
    } catch (err) {
      console.error('Error fetching initial history:', err);
      setError('Failed to load conversation history. Please try refreshing.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // WebSocket connection management
  useEffect(() => {
    fetchInitialHistory();

    let ws = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectTimeout = 3000; // 3 seconds
    
    const connectWebSocket = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        setError('Could not connect to chat server after multiple attempts.');
        return;
      }
      
      const wsUrl = 'ws://127.0.0.1:8000/ws/trump-chat';
      ws = new WebSocket(wsUrl);
      websocket.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts = 0; // Reset attempts on successful connection
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket Disconnected:', event.reason, event.code);
        setIsConnected(false);
        
        // Try to reconnect unless this was a normal closure
        if (event.code !== 1000) {
          reconnectAttempts++;
          setTimeout(connectWebSocket, reconnectTimeout);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setError('Connection error. Please check the server or refresh.');
        setIsConnected(false);
      };
      
      ws.onmessage = (event) => {
        try {
          const newMessage = JSON.parse(event.data);
          console.log('Message received:', newMessage);

          // Handle typing indicator messages
          if (newMessage.type === 'typing_indicator') {
            setIsTyping(newMessage.isTyping);
            return; // Don't add this to chat history
          }

          // Add regular messages to chat history
          setChatHistory(prevHistory => {
            // Check if message already exists to prevent duplicates
            const isDuplicate = prevHistory.some(msg => 
              (msg.timestamp === newMessage.timestamp) && 
              ((msg.content === newMessage.content) || 
               (msg.trump_response === newMessage.trump_response))
            );
            
            if (isDuplicate) return prevHistory;
            
            // Add and sort messages
            const updatedHistory = [...prevHistory, newMessage];
            return updatedHistory.sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
          });
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (ws) {
        console.log('Closing WebSocket connection');
        // Use a custom code to indicate normal closure
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [fetchInitialHistory]);

  // Improved scroll handling
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messageContainerRef.current) {
      const scrollContainer = messageContainerRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior
      });
      isAtBottomRef.current = true;
      setShowScrollButton(false);
    }
  }, []);

  // Track scroll position to show/hide scroll button
  const handleScroll = useCallback(() => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      const scrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

      setShowScrollButton(!scrolledToBottom);
      isAtBottomRef.current = scrolledToBottom;
    }
  }, []);

  useEffect(() => {
    const scrollContainer = messageContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Auto-scroll to bottom with new messages
  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [chatHistory, isTyping, scrollToBottom]);

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const currentMessage = message.trim();
    if (!currentMessage || !websocket.current || websocket.current.readyState !== WebSocket.OPEN) {
      setError(!currentMessage ? "Message cannot be empty." : "Not connected to the chat server.");
      return;
    }
    setError(null);
    setIsSending(true);

    try {
      // Send message in the format expected by the backend
      websocket.current.send(JSON.stringify({ message: currentMessage }));
      setMessage('');
      // Simulate typing indicator on submit
      setIsTyping(true);

      // Focus back on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error("Failed to send message via WebSocket:", err);
      setError("Failed to send message. Please try again.");
      setIsTyping(false);
    } finally {
      // Keep isSending true until a response is received or timeout
      // setIsSending(false); // Removed timeout, let onmessage handle it
    }
  };

   // Update isSending state when a response is received
   useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      // If the last message is from the assistant, we assume sending is complete
      if (!lastMessage.isUser) {
        setIsSending(false);
      }
    }
  }, [chatHistory]);


  // --- Styles ---
  const theme = {
    primary: '#1E88E5', // Blue
    secondary: '#e41e3f', // Red
    background: '#f7f9fc',
    cardBg: '#ffffff',
    text: '#2a2a2a',
    textSecondary: '#606770',
    border: '#e8eaed',
    success: '#34a853', // Green for fact check
    error: '#ea4335',
    messageUser: '#E3F2FD',
    messageTrump: '#ffebee',
    factCheckBg: '#f1f8e9', // Light green background for fact check
    factCheckBorder: '#dcedc8', // Lighter green border
  };

  const styles = {
    pageContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh', // Use viewport height
      backgroundColor: theme.background,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      // overflow: 'hidden', // Remove overflow from page container
      padding: '20px 0', // Optional: Add some vertical padding
      boxSizing: 'border-box',
    },
    contentContainer: {
      maxWidth: '800px',
      width: '100%',
      margin: '0 auto',
      height: '100%', // Fill the available height from pageContainer
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
      // position: 'relative', // Not needed for flex layout
      overflow: 'hidden', // Keep overflow hidden here to contain children
      borderRadius: '8px',
      backgroundColor: theme.cardBg, // Move background color here
    },
    header: {
      padding: '1.25rem 1.5rem',
      backgroundColor: theme.cardBg,
      color: theme.text,
      borderBottom: `1px solid ${theme.border}`,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0, // Prevent header from shrinking
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    headerTitle: {
      margin: 0,
      fontSize: '1.35rem',
      fontWeight: 700,
      background: `linear-gradient(135deg, ${theme.secondary} 0%, #f44336 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    headerSubtitle: {
      margin: '0.2rem 0 0',
      color: theme.textSecondary,
      fontSize: '0.9rem'
    },
    connectionStatus: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.35rem 0.75rem',
      fontSize: '0.8rem',
      color: isConnected ? theme.success : theme.error,
      fontWeight: 500,
      backgroundColor: isConnected ? 'rgba(52, 168, 83, 0.1)' : 'rgba(234, 67, 53, 0.1)',
      borderRadius: '16px',
      transition: 'all 0.3s ease',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: isConnected ? theme.success : theme.error,
      marginRight: '6px',
      animation: isConnected ? 'none' : 'pulse 1.5s infinite ease-in-out',
    },
    chatArea: {
      flex: 1, // Allow chat area to grow and fill available space
      display: 'flex', // Use flexbox for internal layout
      flexDirection: 'column',
      width: '100%',
      // margin: '0 auto', // Not needed if contentContainer handles max-width
      // padding: '0', // Remove padding
      boxSizing: 'border-box',
      overflow: 'hidden', // Hide overflow, scrolling handled by messageList
      position: 'relative', // Needed for positioning scroll-to-bottom button
      // backgroundColor: theme.cardBg, // Background is now on contentContainer
    },
    errorBox: {
      padding: '0.85rem 1rem',
      margin: '1rem 1.5rem 0',
      backgroundColor: 'rgba(234, 67, 53, 0.1)',
      color: theme.error,
      borderRadius: '8px',
      border: `1px solid ${theme.error}20`,
      textAlign: 'center',
      fontSize: '0.9rem',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    messageList: {
      flex: 1, // Allow message list to grow
      overflowY: 'auto', // Enable vertical scrolling ONLY for this element
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      // scrollBehavior: 'smooth', // Apply scroll behavior in JS function
      // paddingBottom: '6rem', // Remove large padding, input is separate
    },
    messageGroup: (isUser) => ({
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start', // Align avatar to the top of the bubble
      gap: '12px',
      maxWidth: '90%',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
    }),
    messageContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      width: '100%', // Allow content to take full width within the group limit
    },
    messageHeader: (isUser) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '3px',
      gap: '6px',
    }),
    messageAuthor: (isUser) => ({
      fontWeight: 600,
      fontSize: '0.85rem',
      color: isUser ? theme.primary : theme.secondary,
    }),
    messageTime: {
      fontSize: '0.75rem',
      color: theme.textSecondary,
      marginLeft: '4px',
    },
    messageBubble: (isUser) => ({
      padding: '0.8rem 1rem',
      borderRadius: '1rem',
      backgroundColor: isUser ? theme.messageUser : theme.messageTrump,
      color: theme.text,
      boxShadow: '0 1px 1px rgba(0, 0, 0, 0.04)', // Softer shadow
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      position: 'relative',
      // maxWidth: '100%', // Let the content define width up to the group max
      borderBottomLeftRadius: isUser ? '1rem' : '0.25rem',
      borderBottomRightRadius: isUser ? '0.25rem' : '1rem',
      transform: 'translateY(0)',
      animation: 'fadeIn 0.3s ease-out',
    }),
    // Style for the fact check section within the assistant bubble
    factCheckSection: {
      marginTop: '1rem',
      paddingTop: '0.75rem',
      borderTop: `1px dashed ${theme.secondary}40`, // Dashed separator using Trump red with alpha
      fontSize: '0.9rem',
      color: theme.textSecondary, // Use secondary text color for fact check
    },
    factCheckHeader: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 600,
      fontSize: '0.8rem',
      color: theme.success, // Green color for the header
      marginBottom: '4px',
    },
    factCheckContent: {
      lineHeight: '1.4',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    typingIndicator: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: '12px',
      maxWidth: '90%',
      alignSelf: 'flex-start',
      opacity: isTyping ? 1 : 0,
      height: isTyping ? 'auto' : 0,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      paddingLeft: '1.5rem', // Match messageList padding if needed
      paddingRight: '1.5rem',
      marginTop: '1.5rem', // Add gap if needed
    },
    typingBubble: {
      padding: '1rem',
      borderRadius: '1rem',
      backgroundColor: theme.messageTrump,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      borderBottomLeftRadius: '0.25rem',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: theme.secondary,
      opacity: 0.6,
      animation: 'bounce 1.2s infinite',
    },
    dot1: {
      animationDelay: '0s',
    },
    dot2: {
      animationDelay: '0.2s',
    },
    dot3: {
      animationDelay: '0.4s',
    },
    inputArea: {
      padding: '1rem 1.5rem 1.25rem',
      borderTop: `1px solid ${theme.border}`,
      backgroundColor: theme.cardBg,
      // position: 'absolute', // Remove absolute positioning
      // bottom: 0,
      // left: 0,
      // right: 0,
      width: '100%',
      boxSizing: 'border-box',
      // zIndex: 10, // Not needed
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.06)', // Softer shadow
      borderBottomLeftRadius: '8px', // Match container rounding
      borderBottomRightRadius: '8px', // Match container rounding
      flexShrink: 0, // Prevent input area from shrinking
    },
    inputForm: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    textInput: {
      flex: 1,
      padding: '0.75rem 1rem',
      borderRadius: '20px',
      border: `1px solid ${theme.border}`,
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)', // Softer shadow
      backgroundColor: '#fff',
      color: theme.text,
    },
    sendButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: `1px solid ${theme.border}`, // Add a subtle border
      backgroundColor: theme.cardBg, // Change background to white (or a light color)
      cursor: 'pointer',
      transition: 'background-color 0.2s, transform 0.1s, box-shadow 0.1s',
      flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)', // Slightly softer shadow
      padding: 0,
      '&:hover': { // Optional: Add hover effect
        backgroundColor: '#f1f3f4',
      }
    },
    sendButtonDisabled: {
      backgroundColor: '#f1f1f1', // Lighter grey for disabled state
      borderColor: '#e0e0e0',
      cursor: 'not-allowed',
      opacity: 0.8,
    },
    sendIconImage: {
      width: '20px',
      height: '20px',
      display: 'block',
    },
    scrollToBottomButton: {
      position: 'absolute', // Position relative to chatArea
      bottom: '15px', // Position above the bottom edge of the chatArea
      right: '20px',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: theme.primary,
      color: 'white', // This should make the arrow icon white
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', // Softer shadow
      zIndex: 5, // Ensure it's above messageList content
      border: 'none',
      opacity: showScrollButton ? 1 : 0,
      transform: showScrollButton ? 'scale(1)' : 'scale(0.8)',
      transition: 'opacity 0.3s, transform 0.3s',
      pointerEvents: showScrollButton ? 'auto' : 'none',
    },
    rateLimitNote: {
      textAlign: 'center',
      marginTop: '0.75rem',
      fontSize: '0.75rem',
      color: theme.textSecondary,
    },
    emptyChat: {
      textAlign: 'center',
      color: theme.textSecondary,
      margin: 'auto',
      padding: '3rem 2rem',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '12px',
      backdropFilter: 'blur(5px)',
      maxWidth: '400px',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.05)',
    },
    emptyChatIcon: {
      fontSize: '3.5rem',
      marginBottom: '1rem',
      textShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
    },
    emptyChatTitle: {
      margin: '0 0 0.75rem',
      color: theme.text,
      fontWeight: 700,
      fontSize: '1.3rem'
    },
  };

  // --- JSX Structure ---
  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <TrumpAvatar size={42} />
            <div>
              <h1 style={styles.headerTitle}>TRUMP CHAT</h1>
              <p style={styles.headerSubtitle}>Public conversation with the Trump AI & Fact Checker</p> {/* Updated subtitle */}
            </div>
          </div>
          <div style={styles.connectionStatus}>
            <span style={styles.statusDot}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {error && (
            <div style={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill={theme.error}/>
              </svg>
              {error}
            </div>
          )}

          {/* Message List */}
          <div
            ref={messageContainerRef}
            style={styles.messageList}
            className="messageList" // Add class for CSS scrollbar styling
          >
            {/* Loading/Empty States */}
            {isLoadingHistory && chatHistory.length === 0 && (
              <div style={styles.emptyChat}>
                <div style={{display: 'flex', justifyContent: 'center', gap: '8px'}}>
                  <div style={{...styles.dot, ...styles.dot1}}></div>
                  <div style={{...styles.dot, ...styles.dot2}}></div>
                  <div style={{...styles.dot, ...styles.dot3}}></div>
                </div>
                <p style={{marginTop: '1rem'}}>Loading conversation history...</p>
              </div>
            )}

            {!isLoadingHistory && chatHistory.length === 0 && !error && (
              <div style={styles.emptyChat}>
                <div style={styles.emptyChatIcon}>🇺🇸</div>
                <h3 style={styles.emptyChatTitle}>Start the Conversation</h3>
                <p>Ask President Trump a question to begin chatting.</p>
              </div>
            )}

            {/* Render Messages */}
            {chatHistory.map((item, index) => (
              <div key={`${item.timestamp}-${index}`} style={styles.messageGroup(item.isUser)}>
                {item.isUser ? <UserAvatar /> : <TrumpAvatar />}

                <div style={styles.messageContent}>
                  <div style={styles.messageHeader(item.isUser)}>
                    <span style={styles.messageAuthor(item.isUser)}>
                      {item.isUser ? 'Public' : 'Donald Trump'}
                    </span>
                    <span style={styles.messageTime} title={new Date(item.timestamp).toLocaleString()}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={styles.messageBubble(item.isUser)}>
                    {/* Render user message content OR Trump response */}
                    {item.isUser ? item.content : item.trump_response}

                    {/* Conditionally render Fact Check section for assistant messages */}
                    {!item.isUser && item.fact_check && (
                      <div style={styles.factCheckSection}>
                        <div style={styles.factCheckHeader}>
                          <FactCheckIcon size={14} />
                          Fact Check
                        </div>
                        <div style={styles.factCheckContent}>
                          {item.fact_check}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && ( // Conditionally render the typing indicator container
              <div style={styles.typingIndicator}>
                <TrumpAvatar />
                <div style={styles.typingBubble}>
                  <div style={{...styles.dot, ...styles.dot1, animation: 'bounce 1.2s infinite 0s'}}></div>
                  <div style={{...styles.dot, ...styles.dot2, animation: 'bounce 1.2s infinite 0.2s'}}></div>
                  <div style={{...styles.dot, ...styles.dot3, animation: 'bounce 1.2s infinite 0.4s'}}></div>
                </div>
              </div>
            )}
          </div>

          {/* Scroll to bottom button (Positioned within chatArea) */}
          <button
            style={styles.scrollToBottomButton}
            onClick={() => scrollToBottom('smooth')} // Add smooth behavior here
            aria-label="Scroll to bottom"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"
                    transform="rotate(180 12 12)"/>
            </svg>
          </button>
        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>
          <form onSubmit={handleSubmit} style={styles.inputForm}>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isConnected ? "Ask President Trump something..." : "Connecting..."}
              disabled={!isConnected || isSending} // Disable input while sending/waiting
              style={{
                ...styles.textInput,
              }}
            />
            <button
              type="submit"
              disabled={!isConnected || !message.trim() || isSending} // Disable button while sending/waiting
              style={{
                ...styles.sendButton,
                ...((!isConnected || !message.trim() || isSending) ? styles.sendButtonDisabled : {})
              }}
              title="Send Message"
            >
              <img
                src="/send-msg.png"
                alt="Send"
                style={styles.sendIconImage}
              />
            </button>
          </form>
          <div style={styles.rateLimitNote}>
            Rate limit: 6 messages/minute globally. All messages are public.
          </div>
        </div>
      </div>
      {/* Add Keyframes via CSS */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        /* Optional: Improve scrollbar appearance */
        /* For Webkit browsers */
        .messageList::-webkit-scrollbar {
          width: 6px;
        }
        .messageList::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .messageList::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
        .messageList::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
        /* For Firefox */
        .messageList {
          scrollbar-width: thin;
          scrollbar-color: #ccc #f1f1f1;
        }
      `}</style>
    </div>
  );
};

export default ConversePage;