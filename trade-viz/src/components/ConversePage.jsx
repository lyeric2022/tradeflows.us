import React, { useState, useEffect, useRef, useCallback } from 'react';

// Profile Info Modal Component
const ProfileInfoModal = ({ isOpen, onClose, profileType }) => {
    if (!isOpen) return null;

    const isTrump = profileType === 'trump';

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                maxWidth: '450px',
                width: '90%',
                position: 'relative',
            }} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        border: 'none',
                        background: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '5px',
                    }}
                >
                    ✕
                </button>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        marginBottom: '15px',
                        border: isTrump ? '2px solid #e41e3f' : '2px solid #1E88E5',
                    }}>
                        <img
                            src={isTrump ? "/trump.png" : "/public.png"}
                            alt={isTrump ? "Donald Trump" : "Public User"}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    <h3 style={{ margin: '0 0 10px 0', color: isTrump ? '#e41e3f' : '#1E88E5' }}>
                        {isTrump ? 'Donald Trump' : 'Public User'}
                    </h3>
                </div>

                <div style={{ lineHeight: '1.5', color: theme.text }}>
                    {isTrump ? (
                        <>
                            <p>This is an AI simulation of Donald Trump, the 45th and 47th President of the United States. The AI is trained on his speeches, interviews, and public statements.</p>
                            
                            <h4 style={{ marginTop: '15px', marginBottom: '8px', color: '#e41e3f' }}>Bio</h4>
                            <p><strong>Born:</strong> June 14, 1946 in Queens, New York</p>
                            <p><strong>Career:</strong> Real estate developer, TV personality ("The Apprentice"), and politician</p>
                            <p><strong>Presidency:</strong> Served as the 45th President from 2017-2021 and as the 47th President from 2025</p>
                            <p><strong>Notable:</strong> Known for his direct communication style, "America First" policies, tax cuts, border security focus, and active use of social media.</p>
                            
                            <p style={{ marginTop: '12px', fontSize: '0.9em', fontStyle: 'italic', color: theme.textSecondary }}>The responses are generated based on Trump's speech patterns and known positions but may not perfectly reflect his actual views.</p>
                        </>
                    ) : (
                        <>
                            <p>This represents public users like you who can ask questions and interact with the Trump AI.</p>
                            
                            <h4 style={{ marginTop: '15px', marginBottom: '8px', color: '#1E88E5' }}>Public User Info</h4>
                            <p><strong>Role:</strong> Ask questions, engage in dialogue, and explore policy perspectives</p>
                            <p><strong>Topics:</strong> Politics, economics, international relations, social issues, or personal questions</p>
                            <p><strong>Purpose:</strong> Educational dialogue to understand different political viewpoints</p>
                            
                            <p style={{ marginTop: '12px', fontSize: '0.9em', fontStyle: 'italic', color: theme.textSecondary }}>All messages in this chat are public, viewable by anyone, and subject to the platform's content policies.</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Trump avatar component
const TrumpAvatar = ({ size = 48, onClick }) => (
    <div
        onClick={onClick}
        style={{
            width: size,
            height: size,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#e41e3f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'transform 0.2s',
        }}
    >
        <img
            src="/trump.png"
            alt="Trump"
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
            }}
        />
    </div>
);

// User avatar component
const UserAvatar = ({ size = 48, onClick }) => (
    <div
        onClick={onClick}
        style={{
            width: size,
            height: size,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#E8F0FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'transform 0.2s',
        }}
    >
        <img
            src="/public.png"
            alt="Public User"
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
            }}
        />
    </div>
);

// Fact Check Icon using SVG instead of an image
const FactCheckIcon = ({ size = 16 }) => (
    <div style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '6px',
        flexShrink: 0,
    }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#34a853" />
        </svg>
    </div>
);

const ConversePage = () => {
    // Add state for profile modal
    const [profileModal, setProfileModal] = useState({ isOpen: false, profileType: null });
    
    // Handle profile modal functions
    const handleOpenProfile = (profileType) => {
        setProfileModal({ isOpen: true, profileType });
    };

    const handleCloseProfile = () => {
        setProfileModal({ isOpen: false, profileType: null });
    };

    // Existing state
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

    // Add these state variables near your other state declarations
    const [typingStartTime, setTypingStartTime] = useState(null);
    const [typingTimer, setTypingTimer] = useState(null);
    const MIN_TYPING_DURATION = 2000; // 2 seconds minimum typing duration

    // Add a state variable to track pending responses
    const [pendingResponses, setPendingResponses] = useState([]);

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

            // Check if we're running locally or on a deployed version
            const isLocal = window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1";

            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

            // Replace the existing ngrok URL with direct local connection
            const wsUrl = isLocal
                ? 'wss://7b0c-2603-8000-6840-100-216-3eff-fe50-f533.ngrok-free.app/ws/trump-chat'
                : `${wsProtocol}//${window.location.host}/ws/trump-chat`;

            console.log(`Connecting to WebSocket: ${wsUrl}`);
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

                    // Handle rate limit exceeded messages
                    if (newMessage.type === 'rate_limit_exceeded') {
                        setError(newMessage.message);
                        // Clear error after 5 seconds
                        setTimeout(() => setError(null), 5000);
                        return;
                    }

                    // Handle typing indicator messages
                    if (newMessage.type === 'typing_indicator') {
                        console.log('Typing indicator state:', newMessage.isTyping);
                        setIsTyping(newMessage.isTyping);
                        return;
                    }

                    // For any non-typing message that appears to be a response, turn off typing
                    if (newMessage.trump_response ||
                        (newMessage.type === 'trump_response') ||
                        (!newMessage.isUser && newMessage.content)) {
                        // Turn off typing indicator when ANY response is received
                        setIsTyping(false);

                        // Also clear all pending responses - a response has arrived
                        setPendingResponses([]);
                    }

                    // Add regular messages to chat history
                    setChatHistory(prevHistory => {
                        // Improved duplicate detection with message_id
                        const isDuplicate = prevHistory.some(msg =>
                            // Check message_id if available
                            (newMessage.message_id && msg.message_id === newMessage.message_id) ||
                            // Otherwise check by content and timestamp
                            ((msg.timestamp === newMessage.timestamp) &&
                                ((msg.content === newMessage.content) ||
                                    (msg.trump_response === newMessage.trump_response)))
                        );

                        if (isDuplicate) return prevHistory;

                        // Add and sort messages
                        const updatedHistory = [...prevHistory, newMessage];
                        console.log("Message being added:", newMessage);
                        console.warn('SORTING MESSAGES:', updatedHistory.map(msg => ({
                            isUser: msg.isUser,
                            content: msg.isUser ? msg.content : msg.trump_response,
                            time: new Date(msg.timestamp).toLocaleTimeString()
                        })));

                        return updatedHistory.sort((a, b) => {
                            // First attempt: force a specific user-then-response order regardless of timestamps
                            // For messages that seem to be question/answer pairs (close in time)
                            const timeA = new Date(a.timestamp).getTime();
                            const timeB = new Date(b.timestamp).getTime();

                            // If messages are within 5 seconds of each other, sort by user/AI role
                            if (Math.abs(timeA - timeB) < 5000) {
                                if (a.isUser && !b.isUser) return -1; // User message first
                                if (!a.isUser && b.isUser) return 1;  // AI response second
                            }

                            // Otherwise, use standard timestamp comparison for messages further apart in time
                            return timeA - timeB;
                        });
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
            // Generate message ID to track this message
            const messageId = `msg_${Date.now()}`;

            // Add user message to chat history immediately
            const userMessage = {
                content: currentMessage,
                isUser: true,
                timestamp: new Date().toISOString(),
                message_id: messageId
            };

            // Update chat history with the user message
            setChatHistory(prevHistory => [...prevHistory, userMessage]);

            // Send message with message_id for tracking
            websocket.current.send(JSON.stringify({
                message: currentMessage,
                message_id: messageId
            }));

            // Track pending response for this message
            setPendingResponses(prev => [...prev, messageId]);

            setMessage('');
            setIsTyping(true);

            // Focus back on input after sending
            if (inputRef.current) {
                inputRef.current.focus();
            }
        } catch (err) {
            console.error("Failed to send message via WebSocket:", err);
            setError("Failed to send message. Please try again.");
            setIsTyping(false);
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
            margin: '1rem 1.5rem',
            alignSelf: 'flex-start'
        },
        typingBubble: {
            padding: '1rem',
            borderRadius: '1rem',
            backgroundColor: theme.messageTrump,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            borderBottomLeftRadius: '0.25rem',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        },
        dot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: theme.secondary,
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
                        <TrumpAvatar
                            size={56}
                            onClick={() => handleOpenProfile('trump')}
                        />
                        <div>
                            <h1 style={styles.headerTitle}>TRUMP CHAT</h1>
                            <p style={styles.headerSubtitle}>Public conversation with the Trump AI & Fact Checker</p>
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
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill={theme.error} />
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
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    <div style={{ ...styles.dot, ...styles.dot1 }}></div>
                                    <div style={{ ...styles.dot, ...styles.dot2 }}></div>
                                    <div style={{ ...styles.dot, ...styles.dot3 }}></div>
                                </div>
                                <p style={{ marginTop: '1rem' }}>Loading conversation history...</p>
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
                                {item.isUser ?
                                    <UserAvatar onClick={() => handleOpenProfile('public')} /> :
                                    <TrumpAvatar onClick={() => handleOpenProfile('trump')} />
                                }

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
                        {(isTyping || pendingResponses.length > 0) && (
                            <div style={styles.typingIndicator}>
                                <TrumpAvatar onClick={() => handleOpenProfile('trump')} />
                                <div style={styles.typingBubble}>
                                    <div style={{ ...styles.dot, ...styles.dot1 }}></div>
                                    <div style={{ ...styles.dot, ...styles.dot2 }}></div>
                                    <div style={{ ...styles.dot, ...styles.dot3 }}></div>
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
                                transform="rotate(180 12 12)" />
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
                        Rate limit: 3 messages/minute globally. All messages are public. Your message may be auto-modified if vague, offensive, or too lengthy.
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            <ProfileInfoModal
                isOpen={profileModal.isOpen}
                onClose={handleCloseProfile}
                profileType={profileModal.profileType}
            />

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