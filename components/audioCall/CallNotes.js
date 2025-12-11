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
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const initialFetchDone = useRef(false);
  const prevScrollHeight = useRef(0);

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
  const fetchNotes = useCallback(async (cursor = null, prepend = false) => {
    const ownerInfo = getOwnerInfo();
    if (!ownerInfo || isLoading) return;

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
        // API returns newest first, reverse for chat display (oldest at top, newest at bottom)
        const newNotes = [...data.notes].reverse();
        
        if (prepend) {
          // Store scroll height before prepending older notes
          prevScrollHeight.current = messagesContainerRef.current?.scrollHeight || 0;
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
  }, [getOwnerInfo, isLoading]);

  // Initial fetch when panel opens
  useEffect(() => {
    if (isOpen && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchNotes();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    if (!isOpen) {
      initialFetchDone.current = false;
    }
  }, [isOpen, fetchNotes]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && notes.length > 0 && !prevScrollHeight.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [notes.length, isLoading]);

  // Maintain scroll position when loading older notes
  useEffect(() => {
    if (prevScrollHeight.current && messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = 0;
    }
  }, [notes]);

  // Load more on scroll to top
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || isLoading || !hasMore) return;

    if (container.scrollTop < 50) {
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

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

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
        setNotes(prev => prev.map(n => n._id === tempId ? data.note : n));
      } else {
        setNotes(prev => prev.filter(n => n._id !== tempId));
        setInputValue(content);
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

  // Copy note
  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setActiveMenu(null);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  // Delete note
  const handleDelete = async (noteId) => {
    const ownerInfo = getOwnerInfo();
    if (!ownerInfo) return;

    setActiveMenu(null);
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
      fetchNotes();
    }
  };

  // Start editing
  const handleStartEdit = (note) => {
    setEditingNote(note._id);
    setEditValue(note.content);
    setActiveMenu(null);
  };

  // Save edit
  const handleSaveEdit = async (noteId) => {
    const content = editValue.trim();
    if (!content) return;

    const ownerInfo = getOwnerInfo();
    if (!ownerInfo) return;

    setNotes(prev => prev.map(n => 
      n._id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
    ));
    setEditingNote(null);
    setEditValue('');

    try {
      const res = await fetch('/api/call-notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId,
          ownerId: ownerInfo.ownerId,
          content,
        }),
      });

      const data = await res.json();
      if (!data.success) fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      fetchNotes();
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditValue('');
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

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

          {/* Has more indicator */}
          {hasMore && !isLoading && notes.length > 0 && (
            <div className={styles.loadMoreHint}>Scroll up to load more</div>
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

          {/* Initial loading */}
          {isLoading && notes.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.loadingDots}>
                <span /><span /><span />
              </div>
            </div>
          )}

          {/* Notes */}
          {notes.map((note) => (
            <div 
              key={note._id} 
              className={`${styles.message} ${note.isTemp ? styles.sending : ''}`}
            >
              <div className={styles.messageContent}>
                {editingNote === note._id ? (
                  <div className={styles.editContainer}>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(note._id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className={styles.editInput}
                      autoFocus
                    />
                    <div className={styles.editActions}>
                      <button onClick={() => handleSaveEdit(note._id)} className={styles.editSave}>Save</button>
                      <button onClick={handleCancelEdit} className={styles.editCancel}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={styles.messageText}>{note.content}</p>
                    <div className={styles.messageFooter}>
                      <span className={styles.messageTime}>
                        {formatTime(note.createdAt)}
                        {note.updatedAt && ' (edited)'}
                      </span>
                      {!note.isTemp && (
                        <div className={styles.messageActions}>
                          {/* Copy button */}
                          <button 
                            className={styles.actionButton}
                            onClick={() => handleCopy(note.content)}
                            aria-label="Copy note"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                          </button>
                          {/* Three dot menu */}
                          <div className={styles.menuWrapper}>
                            <button 
                              className={styles.actionButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === note._id ? null : note._id);
                              }}
                              aria-label="More options"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="19" r="2" />
                              </svg>
                            </button>
                            {activeMenu === note._id && (
                              <div className={styles.menu} onClick={e => e.stopPropagation()}>
                                <button 
                                  className={styles.menuItem}
                                  onClick={() => handleStartEdit(note)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  Edit
                                </button>
                                <button 
                                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                  onClick={() => handleDelete(note._id)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
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
