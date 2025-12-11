import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import styles from './styles/CallNotes.module.css';

const CallNotes = ({ isOpen, onClose, callSessionId }) => {
  const { data: session } = useSession();
  const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);
  
  const [notes, setNotes] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Get owner info based on authentication status
  const getOwnerInfo = useCallback(() => {
    if (session?.user?.email) {
      return {
        ownerId: session.user.email,
        ownerType: 'verified',
        userEmail: session.user.email,
      };
    } else if (unverifiedUserDetails?.mid) {
      return {
        ownerId: unverifiedUserDetails.mid,
        ownerType: 'unverified',
      };
    }
    return null;
  }, [session, unverifiedUserDetails]);

  // Fetch notes
  const fetchNotes = useCallback(async (cursor = null, append = false) => {
    const ownerInfo = getOwnerInfo();
    if (!ownerInfo) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '20',
        ...(ownerInfo.ownerType === 'verified' 
          ? { userEmail: ownerInfo.userEmail, ownerId: ownerInfo.ownerId }
          : { ownerId: ownerInfo.ownerId }
        ),
        ...(cursor && { before: cursor }),
      });

      const res = await fetch(`/api/call-notes?${params}`);
      const data = await res.json();

      if (data.success) {
        // Notes come in reverse chronological order, we need to reverse for chat display
        const newNotes = data.notes.reverse();
        
        if (append) {
          setNotes(prev => [...newNotes, ...prev]);
        } else {
          setNotes(newNotes);
        }
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getOwnerInfo]);

  // Initial fetch when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotes();
      // Focus input after a short delay
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, fetchNotes]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!isLoading && notes.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes.length, isLoading]);

  // Load more on scroll to top
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || isLoading || !hasMore) return;

    if (container.scrollTop < 100) {
      fetchNotes(nextCursor, true);
    }
  }, [isLoading, hasMore, nextCursor, fetchNotes]);

  // Send note
  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;

    const ownerInfo = getOwnerInfo();
    if (!ownerInfo) return;

    setIsSending(true);
    setInputValue('');

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempNote = {
      _id: tempId,
      content,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };
    setNotes(prev => [...prev, tempNote]);

    try {
      const res = await fetch('/api/call-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ...ownerInfo,
          callSessionId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Replace temp note with real note
        setNotes(prev => 
          prev.map(n => n._id === tempId ? data.note : n)
        );
      } else {
        // Remove temp note on failure
        setNotes(prev => prev.filter(n => n._id !== tempId));
        setInputValue(content); // Restore input
      }
    } catch (error) {
      console.error('Error sending note:', error);
      setNotes(prev => prev.filter(n => n._id !== tempId));
      setInputValue(content);
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Delete note
  const handleDelete = async (noteId) => {
    const ownerInfo = getOwnerInfo();
    if (!ownerInfo) return;

    // Optimistic update
    setNotes(prev => prev.filter(n => n._id !== noteId));

    try {
      await fetch('/api/call-notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId,
          ownerId: ownerInfo.ownerId,
        }),
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      // Refetch on error
      fetchNotes();
    }
  };

  // Format timestamp
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>📝</span>
            <span className={styles.headerTitle}>Notes</span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div 
          className={styles.messagesContainer}
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {/* Load more indicator */}
          {isLoading && notes.length > 0 && (
            <div className={styles.loadingMore}>
              <div className={styles.loadingDots}>
                <span /><span /><span />
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && notes.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <p className={styles.emptyTitle}>No notes yet</p>
              <p className={styles.emptySubtitle}>
                Jot down phone numbers, names, or anything important during your call
              </p>
            </div>
          )}

          {/* Notes */}
          {notes.map((note, index) => (
            <div 
              key={note._id} 
              className={`${styles.message} ${note.isTemp ? styles.sending : ''}`}
            >
              <div className={styles.messageContent}>
                <p className={styles.messageText}>{note.content}</p>
                <div className={styles.messageFooter}>
                  <span className={styles.messageTime}>{formatTime(note.createdAt)}</span>
                  {!note.isTemp && (
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(note._id)}
                      aria-label="Delete note"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a note..."
              className={styles.input}
              disabled={isSending}
            />
            <button 
              className={`${styles.sendButton} ${inputValue.trim() ? styles.active : ''}`}
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallNotes;
