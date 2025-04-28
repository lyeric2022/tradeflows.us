import React from 'react';
import { theme } from './theme';
import {
    ProfileInfoModal,
    TrumpAvatar,
    UserAvatar,
    FactCheckIcon
} from './ChatComponents';
import { useChatLogic } from './useChatLogic'; // Import the custom hook

// --- Styles (Keep styles here or move to a separate file/CSS Modules) ---
const styles = {
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '94.3vh',
        backgroundColor: theme.background,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: '20px 0',
        boxSizing: 'border-box',
    },
    contentContainer: {
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        borderRadius: '8px',
        backgroundColor: theme.cardBg,
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
        flexShrink: 0,
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
        fontSize: '1.2rem', // Reduced from 1.35rem
        fontWeight: 700,
        background: `linear-gradient(135deg, ${theme.secondary} 0%, #f44336 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    headerSubtitle: {
        margin: '0.2rem 0 0',
        color: theme.textSecondary,
        fontSize: '0.8rem' // Reduced from 0.9rem
    },
    connectionStatus: (isConnected) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '0.35rem 0.75rem',
        fontSize: '0.7rem', // Reduced from 0.8rem
        color: isConnected ? theme.success : theme.error,
        fontWeight: 500,
        backgroundColor: isConnected ? 'rgba(52, 168, 83, 0.1)' : 'rgba(234, 67, 53, 0.1)',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
    }),
    statusDot: (isConnected) => ({ // Make style dependent on isConnected prop
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: isConnected ? theme.success : theme.error,
        marginRight: '6px',
        animation: isConnected ? 'none' : 'pulse 1.5s infinite ease-in-out',
    }),
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
    },
    errorBox: {
        padding: '0.85rem 1rem',
        margin: '1rem 1.5rem 0',
        backgroundColor: 'rgba(234, 67, 53, 0.1)',
        color: theme.error,
        borderRadius: '8px',
        border: `1px solid ${theme.error}20`,
        textAlign: 'center',
        fontSize: '0.8rem', // Reduced from 0.9rem
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    messageList: {
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    messageGroup: (isUser) => ({
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '12px',
        maxWidth: '90%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
    }),
    messageContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
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
        fontSize: '0.75rem', // Reduced from 0.85rem
        color: isUser ? theme.primary : theme.secondary,
    }),
    messageTime: {
        fontSize: '0.7rem', // Reduced from 0.75rem
        color: theme.textSecondary,
        marginLeft: '4px',
    },
    messageBubble: (isUser) => ({
        padding: '0.5rem 1rem',
        borderRadius: '0.4rem',
        backgroundColor: isUser ? theme.messageUser : theme.messageTrump,
        color: theme.text,
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.04)',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        position: 'relative',
        borderBottomLeftRadius: isUser ? '1rem' : '0.25rem',
        borderBottomRightRadius: isUser ? '0.25rem' : '1rem',
        transform: 'translateY(0)',
        animation: 'fadeIn 0.3s ease-out',
        fontSize: '0.9rem', // Reduced from 1rem
    }),
    factCheckSection: {
        marginTop: '1rem',
        paddingTop: '0.75rem',
        borderTop: `1px dashed ${theme.secondary}40`,
        fontSize: '0.7rem', // Reduced from 0.9rem
        color: theme.textSecondary,
    },
    factCheckHeader: {
        display: 'flex',
        alignItems: 'center',
        fontWeight: 600,
        fontSize: '0.7rem', // Reduced from 0.8rem
        color: theme.success,
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
    dot1: { animationDelay: '0s' },
    dot2: { animationDelay: '0.2s' },
    dot3: { animationDelay: '0.4s' },
    inputArea: {
        padding: '1rem 1.5rem 1.25rem',
        borderTop: `1px solid ${theme.border}`,
        backgroundColor: theme.cardBg,
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.06)',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        flexShrink: 0,
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
        fontSize: '0.9rem', // Reduced from 1rem
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
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
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.cardBg,
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s, box-shadow 0.1s',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        padding: 0,
    },
    sendButtonDisabled: {
        backgroundColor: '#f1f1f1',
        borderColor: '#e0e0e0',
        cursor: 'not-allowed',
        opacity: 0.8,
    },
    sendIconImage: {
        width: '20px',
        height: '20px',
        display: 'block',
    },
    scrollToBottomButton: (showScrollButton) => ({ // Make style dependent on showScrollButton prop
        position: 'absolute',
        bottom: '15px',
        right: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: theme.primary,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 5,
        border: 'none',
        opacity: showScrollButton ? 1 : 0,
        transform: showScrollButton ? 'scale(1)' : 'scale(0.8)',
        transition: 'opacity 0.3s, transform 0.3s',
        pointerEvents: showScrollButton ? 'auto' : 'none',
    }),
    rateLimitNote: {
        textAlign: 'center',
        marginTop: '0.75rem',
        fontSize: '0.7rem', // Reduced from 0.75rem
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
        fontSize: '1.15rem' // Reduced from 1.3rem
    },
};


const ConversePage = () => {
    // Use the custom hook to get state and handlers
    const {
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
        messageContainerRef,
        inputRef,
        handleOpenProfile,
        handleCloseProfile,
        setMessage,
        handleSubmit,
        scrollToBottom,
    } = useChatLogic();

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentContainer}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <TrumpAvatar size={56} onClick={() => handleOpenProfile('trump')} />
                        <div>
                            <h1 style={styles.headerTitle}>TRUMP CHAT</h1>
                            <p style={styles.headerSubtitle}>Public conversation with the Trump AI & Fact Checker</p>
                        </div>
                    </div>
                    <div style={styles.connectionStatus(isConnected)}>
                        <span style={styles.statusDot(isConnected)}></span>
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
                    <div ref={messageContainerRef} style={styles.messageList} className="messageList">
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
                        {chatHistory.map((item, index) => (
                            <div key={`${item.timestamp}-${index}-${item.message_id || ''}`} style={styles.messageGroup(item.isUser)}>
                                {item.isUser ?
                                    <UserAvatar size={42} onClick={() => handleOpenProfile('public')} /> :
                                    <TrumpAvatar size={42} onClick={() => handleOpenProfile('trump')} />
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
                                        {item.isUser ? item.content : item.trump_response}
                                        {!item.isUser && item.fact_check && (
                                            <div style={styles.factCheckSection}>
                                                <div style={styles.factCheckHeader}>
                                                    <FactCheckIcon size={14} /> Fact Check
                                                </div>
                                                <div style={styles.factCheckContent}>{item.fact_check}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(isTyping || pendingResponses.length > 0) && (
                            <div style={styles.typingIndicator}>
                                <TrumpAvatar size={42} onClick={() => handleOpenProfile('trump')} />
                                <div style={styles.typingBubble}>
                                    <div style={{ ...styles.dot, ...styles.dot1 }}></div>
                                    <div style={{ ...styles.dot, ...styles.dot2 }}></div>
                                    <div style={{ ...styles.dot, ...styles.dot3 }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scroll to bottom button */}
                    <button style={styles.scrollToBottomButton(showScrollButton)} onClick={() => scrollToBottom('smooth')} aria-label="Scroll to bottom">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z" transform="rotate(180 12 12)" />
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
                            disabled={!isConnected || isSending}
                            style={styles.textInput}
                        />
                        <button
                            type="submit"
                            disabled={!isConnected || !message.trim() || isSending}
                            style={{ ...styles.sendButton, ...((!isConnected || !message.trim() || isSending) ? styles.sendButtonDisabled : {}) }}
                            title="Send Message"
                        >
                            <img src="/send-msg.png" alt="Send" style={styles.sendIconImage} />
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

            {/* Keyframes CSS */}
            <style>{`
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
                .messageList::-webkit-scrollbar { width: 6px; }
                .messageList::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
                .messageList::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
                .messageList::-webkit-scrollbar-thumb:hover { background: #aaa; }
                .messageList { scrollbar-width: thin; scrollbar-color: #ccc #f1f1f1; }
            `}</style>
        </div>
    );
};

export default ConversePage;