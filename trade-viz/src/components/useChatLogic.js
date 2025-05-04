import { useState, useEffect, useRef, useCallback } from 'react';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

export const useChatLogic = () => {
    // Initialize Cerebras client - keep outside of render cycle
    const cerebrasClient = new Cerebras({
        apiKey: import.meta.env.VITE_CEREBRAS_API_KEY,
        // Optional configurations
        maxRetries: 1,
        timeout: 10000, // 10 seconds timeout
    });

    // --- State Variables ---
    const [profileModal, setProfileModal] = useState({ isOpen: false, profileType: null });
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [pendingResponses, setPendingResponses] = useState([]);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    // --- Refs ---
    const isAtBottomRef = useRef(true);
    const messageContainerRef = useRef(null);
    const websocket = useRef(null);
    const inputRef = useRef(null);

    // --- Constants ---
    const MIN_TYPING_DURATION = 2000; // Example constant, adjust if needed

    // --- Handlers ---
    const handleOpenProfile = useCallback((profileType) => {
        setProfileModal({ isOpen: true, profileType });
    }, []);

    const handleCloseProfile = useCallback(() => {
        setProfileModal({ isOpen: false, profileType: null });
    }, []);

    // --- Data Fetching ---
    const fetchInitialHistory = useCallback(async () => {
        setIsLoadingHistory(true);
        setError(null);
        try {
            const response = await fetch('https://monarch-powerful-squirrel.ngrok-free.app/trump-chat-history', {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch initial chat history');
            const data = await response.json();
            const formattedHistory = data.messages.map(msg => ({
                ...msg,
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

    // --- WebSocket Logic ---
    useEffect(() => {
        fetchInitialHistory();

        let ws = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        const reconnectTimeout = 3000;

        const connectWebSocket = () => {
            if (reconnectAttempts >= maxReconnectAttempts) {
                setError('Could not connect to chat server after multiple attempts.');
                return;
            }

            // Use fixed WebSocket URL regardless of environment
            const wsUrl = 'wss://monarch-powerful-squirrel.ngrok-free.app/ws/trump-chat';

            console.log(`Connecting to WebSocket: ${wsUrl}`);
            ws = new WebSocket(wsUrl);
            websocket.current = ws;

            ws.onopen = () => {
                console.log('WebSocket Connected');
                setIsConnected(true);
                setError(null);
                reconnectAttempts = 0;
            };

            ws.onclose = (event) => {
                console.log('WebSocket Disconnected:', event.reason, event.code);
                setIsConnected(false);
                if (event.code !== 1000) { // Don't reconnect on normal closure
                    reconnectAttempts++;
                    setTimeout(connectWebSocket, reconnectTimeout);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                setError('Connection error. Please check the server or refresh.');
                setIsConnected(false);
                // Consider adding retry logic here too, depending on the error
            };

            ws.onmessage = (event) => {
                try {
                    const newMessage = JSON.parse(event.data);
                    console.log('Message received:', newMessage);

                    if (newMessage.type === 'rate_limit_exceeded') {
                        setError(newMessage.message);
                        setTimeout(() => setError(null), 5000);
                        return;
                    }

                    if (newMessage.type === 'typing_indicator') {
                        setIsTyping(newMessage.isTyping);
                        return;
                    }

                    if (newMessage.trump_response || (newMessage.type === 'trump_response') || (!newMessage.isUser && newMessage.content)) {
                        setIsTyping(false);
                        setPendingResponses([]); // Clear pending when a response arrives
                    }

                    setChatHistory(prevHistory => {
                        const isDuplicate = prevHistory.some(msg =>
                            (newMessage.message_id && msg.message_id === newMessage.message_id) ||
                            ((msg.timestamp === newMessage.timestamp) &&
                                ((msg.content === newMessage.content) || (msg.trump_response === newMessage.trump_response)))
                        );
                        if (isDuplicate) return prevHistory;

                        const updatedHistory = [...prevHistory, newMessage];
                        return updatedHistory.sort((a, b) => {
                            const timeA = new Date(a.timestamp).getTime();
                            const timeB = new Date(b.timestamp).getTime();
                            if (Math.abs(timeA - timeB) < 5000) {
                                if (a.isUser && !b.isUser) return -1;
                                if (!a.isUser && b.isUser) return 1;
                            }
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
                ws.close(1000, 'Component unmounting');
            }
        };
    }, [fetchInitialHistory]); // Dependency array includes fetchInitialHistory

    // --- Scroll Logic ---
    const scrollToBottom = useCallback((behavior = 'smooth') => {
        if (messageContainerRef.current) {
            const scrollContainer = messageContainerRef.current;
            scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior });
            isAtBottomRef.current = true;
            setShowScrollButton(false);
        }
    }, []);

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

    useEffect(() => {
        if (chatHistory.length > 0) {
            // On first load, don't auto-scroll to bottom
            if (isFirstLoad) {
                setIsFirstLoad(false);
                return;
            }
            
            // After first load, only auto-scroll if user was already at the bottom
            if (isAtBottomRef.current) {
                scrollToBottom();
            }
        }
    }, [chatHistory, isFirstLoad, scrollToBottom]);

    // --- Message moderation with Cerebras ---
    const moderateMessage = async (messageText) => {
        try {
            const chatCompletion = await cerebrasClient.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `If the user’s message is acceptable—even with grammar issues—do not modify it. Minimize edits.

You are a some trying to deliver messages to Donald J. Trump. Receive the user’s draft, assess length, clarity, and appropriateness, and only rewrite if needed to capture their intent—without adding content or commentary.

Core Principles
Fidelity: Preserve the user’s voice, style, and intent. Edit only when absolutely necessary for length, clarity, or to remove disallowed content.
Transparency: If no changes are needed, return the text exactly as received.

Length Management
• Too long: Condense verbose or rambling drafts into a clear, concise version conveying the same meaning.
• Too short: If the draft is overly brief or ambiguous, expand it by up to twice its length with one or two clarifying sentences that reflect the user’s intent.

Content Sanitation & Transformation
• Profanity/insults toward Trump (e.g., “fuck you”): Replace the entire insult with a neutral opener or question.
• Hate speech, threats, or explicit sexual content: Never refuse. Transform into a respectful or benign inquiry.
• Self-harm or harmful acronyms (e.g., “KYS”): Reinterpret positively (e.g., “Keep yourself safe”).
• Conspiracy theories or extremist language: Soften any conspiratorial or extremist phrasing while preserving the user’s core question; rephrase into a respectful inquiry that conveys the original intent.
• Other disallowed or overly inappropriate requests: Silently replace the entire message with one of these default safe queries:
– “Hi President Trump, how are you today?”
– “What are your views on the economy?”
– “Can you explain your recent statements on X?”

Style & Tone
• Spare edits: Only change what’s necessary for clarity or to comply with guardrails.
• Maintain voice: Preserve unique rhetorical flourishes or stylistic quirks unless they impede readability or appropriateness.
• No new content: Do not introduce topics, facts, or commentary beyond what the user supplied.
• If edits are made, try to ensure the same grammar and spelling style as the original message.

Output Requirements
• Edited draft only: If you revise, return only the edited text—no explanations, annotations, or metadata.
• Unchanged draft: If the original is acceptable, return it verbatim.
• No apologies or refusals: Never include phrases like “I’m sorry, I can’t comply.” Always provide a transformed or default query.`
                    },
                    {
                        role: "user",
                        content: messageText
                    }
                ],
                model: "llama-3.3-70b", // Or your preferred model
            });

            // Extract the moderated text from the response
            return chatCompletion.choices[0]?.message?.content || messageText;
        } catch (err) {
            console.error("Error moderating message with Cerebras:", err);
            // Fall back to original message if moderation fails
            return messageText;
        }
    };

    // --- Message Submission ---
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const currentMessage = message.trim();
        if (!currentMessage || !websocket.current || websocket.current.readyState !== WebSocket.OPEN) {
            setError(!currentMessage ? "Message cannot be empty." : "Not connected to the chat server.");
            return;
        }
        setError(null);
        setIsSending(true); // Set sending state

        try {
            // First moderate the message before sending
            const moderatedMessage = await moderateMessage(currentMessage);

            const messageId = `msg_${Date.now()}`;
            const userMessage = {
                content: moderatedMessage, // Use the moderated message
                isUser: true,
                timestamp: new Date().toISOString(),
                message_id: messageId
            };

            // Optimistically update UI
            setChatHistory(prevHistory => [...prevHistory, userMessage]);
            setMessage(''); // Clear input immediately
            setIsTyping(true); // Assume typing starts
            setPendingResponses(prev => [...prev, messageId]); // Track pending

            // Send the moderated message
            websocket.current.send(JSON.stringify({
                message: moderatedMessage, // Use the moderated message
                message_id: messageId
            }));

            // Focus input
            if (inputRef.current) {
                inputRef.current.focus();
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            setError("Failed to send message. Please try again.");
            setIsTyping(false);
            setIsSending(false); // Reset sending state on error
        }
    }, [message, websocket, inputRef]); // Add moderateMessage if needed, but as it uses cerebrasClient which is stable, it's not necessary

    // Effect to reset isSending when a response comes back
    useEffect(() => {
        if (chatHistory.length > 0) {
            const lastMessage = chatHistory[chatHistory.length - 1];
            // If the last message is from the assistant, we assume sending is complete for the previous user message
            if (!lastMessage.isUser) {
                setIsSending(false);
            }
        }
    }, [chatHistory]);


    // --- Return Values ---
    return {
        // State
        profileModal,
        message,
        chatHistory,
        isLoadingHistory,
        isSending,
        error,
        isTyping,
        showScrollButton,
        isConnected,
        pendingResponses,
        // Refs
        messageContainerRef,
        inputRef,
        // Handlers
        handleOpenProfile,
        handleCloseProfile,
        setMessage, // Expose setMessage to allow input binding
        handleSubmit,
        scrollToBottom,
        // Constants (if needed by UI)
        // MIN_TYPING_DURATION
    };
};