import React from 'react';
import { theme } from './theme'; // Import theme from the new file

// Profile Info Modal Component
export const ProfileInfoModal = ({ isOpen, onClose, profileType }) => {
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
                        color: '#000'  // Added black color to make the X visible
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
                        border: isTrump ? `2px solid ${theme.secondary}` : `2px solid ${theme.primary}`, // Use theme colors
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

                    <h3 style={{ margin: '0 0 10px 0', color: isTrump ? theme.secondary : theme.primary }}> {/* Use theme colors */}
                        {isTrump ? 'Donald Trump' : 'Public User'}
                    </h3>
                </div>

                <div style={{ lineHeight: '1.5', color: theme.text }}>
                    {isTrump ? (
                        <>
                            <p>This is an AI agent imitating Donald Trump, the current President of the United States.</p>

                            <h4 style={{ marginTop: '15px', marginBottom: '8px', color: theme.secondary }}>Bio</h4> {/* Use theme color */}
                            <p><strong>Born:</strong> June 14, 1946 in Queens, New York</p>
                            <p><strong>Career:</strong> Real estate developer, TV personality ("The Apprentice"), and politician</p>
                            <p><strong>Presidency:</strong> Served as the 45th President from 2017-2021 and as the 47th President from 2025</p>
                            <p><strong>Notable:</strong> Known for his direct communication style, "America First" policies, tax cuts, border security focus, and active use of social media.</p>

                            <p style={{ marginTop: '12px', fontSize: '0.9em', fontStyle: 'italic', color: theme.textSecondary }}>Agent is enhanced with known philosophical, political, economic stances. Agent is capable of retrieving real time stories.</p>
                        </>
                    ) : (
                        // Corrected Public User section
                        <>
                            <p>This represents public users like you who can ask questions and interact with the Trump AI.</p>

                            <h4 style={{ marginTop: '15px', marginBottom: '8px', color: theme.primary }}>Public User Info</h4> {/* Use theme color */}
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
export const TrumpAvatar = ({ size = 48, onClick }) => (
    <div
        onClick={onClick}
        style={{
            width: size,
            height: size,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: theme.secondary, // Use theme color
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flexShrink: 0,
            cursor: onClick ? 'pointer' : 'default', // Make cursor pointer only if onClick is provided
            transition: 'transform 0.2s',
        }}
        // Add hover effect if clickable
        onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'scale(1)'; }}
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
export const UserAvatar = ({ size = 48, onClick }) => (
    <div
        onClick={onClick}
        style={{
            width: size,
            height: size,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: theme.messageUser, // Use theme color
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flexShrink: 0,
            cursor: onClick ? 'pointer' : 'default', // Make cursor pointer only if onClick is provided
            transition: 'transform 0.2s',
        }}
        // Add hover effect if clickable
        onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'scale(1)'; }}
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
export const FactCheckIcon = ({ size = 16 }) => (
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
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={theme.success} /> {/* Use theme color */}
        </svg>
    </div>
);