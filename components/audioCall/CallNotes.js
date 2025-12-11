import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramOutlinedIcon from '@mui/icons-material/Instagram';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import styles from './styles/CallNotes.module.css';

// Lock icon component
const LockIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Instagram icon component (outlined)
const InstagramIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Phone icon component (outlined)
const PhoneIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

// Parse content for Instagram handles and phone numbers
const parseNoteContent = (content) => {
  const parts = [];
  let lastIndex = 0;
  
  // Combined regex - Instagram and 10-digit phone numbers
  const combinedRegex = /(@[a-zA-Z0-9._]{1,30})|(\+?91[-.\s]?\d{10}|\d{10})/g;
  
  let match;
  while ((match = combinedRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    
    if (match[1]) {
      const handle = match[1].slice(1);
      parts.push({ type: 'instagram', value: handle, raw: match[1] });
    } else if (match[2]) {
      const phone = match[2].replace(/[-.\s+]/g, '').replace(/^91/, '');
      if (phone.length === 10) {
        parts.push({ type: 'phone', value: phone, raw: match[2] });
      } else {
        parts.push({ type: 'text', value: match[2] });
      }
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }
  
  return parts.length > 0 ? parts : [{ type: 'text', value: content }];
};

// Render parsed content with clickable links
const NoteContent = ({ content }) => {
  const parts = parseNoteContent(content);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'instagram') {
          return (
            <a
              key={i}
              href={'https://instagram.com/' + part.value}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instaLink}
              onClick={e => e.stopPropagation()}
            >
              <InstagramIcon size={12} />
              <span>@{part.value}</span>
            </a>
          );
        }
        if (part.type === 'phone') {
          return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <a
                href={'https://wa.me/91' + part.value}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappLink}
                onClick={e => e.stopPropagation()}
              >
                <WhatsAppIcon style={{ fontSize: 14 }} />
                <span>{part.raw}</span>
              </a>
              <a
                href={'tel:+91' + part.value}
                className={styles.phoneLink}
                onClick={e => e.stopPropagation()}
              >
                <PhoneIcon size={12} />
              </a>
            </span>
          );
        }
        return <span key={i}>{part.value}</span>;
      })}
    </>
  );
};

const CallNotes = ({ isOpen, onClose, callSessionId, userGender = 'neutral' }) => {
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
  const [copiedId, setCopiedId] = useState(null);
  const [inputWarning, setInputWarning] = useState(null);
  
  const notesEndRef = useRef(null);
  const notesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);
  const initialLoadDone = useRef(false);
  const prevScrollHeight = useRef(0);

  // Gender theme helper
  const gender = userGender || 'neutral';
  const genderClass = gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Neutral';

  // Determine active shortcut based on input
  const activeShortcut = useMemo(() => {
    const trimmed = inputValue.trim();
    if (trimmed.startsWith('@')) return 'insta';
    if (/^\+?91|^\d/.test(trimmed) && /\d{4,}/.test(trimmed.replace(/[-\s.+()]/g, ''))) return 'phone';
    return null;
  }, [inputValue]);

  // Validate phone number - only accept exactly 10 digits
  const validateInput = useCallback((value) => {
    const digitsOnly = value.replace(/[-.\s()+]/g, '');
    const looksLikePhone = /^\+?\d/.test(value.trim()) && digitsOnly.length >= 4;
    
    if (looksLikePhone) {
      const cleanDigits = digitsOnly.replace(/^91/, '');
      
      if (cleanDigits.length < 10) {
        return { message: 'Phone number too short (' + cleanDigits.length + '/10 digits)', blocking: true };
      } else if (cleanDigits.length > 10) {
        return { message: 'Invalid phone number (' + cleanDigits.length + ' digits, need exactly 10)', blocking: true };
      }
    }
    return null;
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setInputWarning(validateInput(value));
  };

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

  const fetchNotes = useCallback(async (cursor = null, prepend = false) => {
    const ownerInfo = getOwnerInfo();
    if (!ownerInfo || isLoading) return;

    setIsLoading(true);
    
    if (prepend && notesContainerRef.current) {
      prevScrollHeight.current = notesContainerRef.current.scrollHeight;
    }

    try {
      const params = new URLSearchParams({
        limit: '20',
        ...(ownerInfo.ownerType === 'verified' 
          ? { userEmail: ownerInfo.userEmail, ownerId: ownerInfo.ownerId }
          : { ownerId: ownerInfo.ownerId }
        ),
        ...(cursor && { before: cursor }),
      });

      const res = await fetch('/api/call-notes?' + params);
      const data = await res.json();

      if (data.success) {
        const newNotes = data.notes.reverse();
        
        if (prepend) {
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

  useEffect(() => {
    if (isOpen && !initialLoadDone.current) {
      fetchNotes();
      initialLoadDone.current = true;
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    if (!isOpen) {
      initialLoadDone.current = false;
    }
  }, [isOpen, fetchNotes]);

  // Handle browser back button - close dialog instead of navigating
  useEffect(() => {
    if (!isOpen) return;
    
    // Push a state when dialog opens
    window.history.pushState({ notesOpen: true }, '');
    
    const handlePopState = (e) => {
      // Close dialog when back is pressed
      onClose();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isLoading && notes.length > 0 && initialLoadDone.current && prevScrollHeight.current === 0) {
      notesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [notes.length, isLoading]);

  useEffect(() => {
    if (prevScrollHeight.current > 0 && notesContainerRef.current) {
      const newScrollHeight = notesContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeight.current;
      notesContainerRef.current.scrollTop = scrollDiff;
      prevScrollHeight.current = 0;
    }
  }, [notes]);

  const handleScroll = useCallback(() => {
    const container = notesContainerRef.current;
    if (!container || isLoading || !hasMore) return;

    if (container.scrollTop < 50) {
      fetchNotes(nextCursor, true);
    }
  }, [isLoading, hasMore, nextCursor, fetchNotes]);

  const handleCopy = async (note) => {
    try {
      await navigator.clipboard.writeText(note.content);
      setCopiedId(note._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const startEdit = (note) => {
    setEditingNote(note._id);
    setEditValue(note.content);
    setActiveMenu(null);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const saveEdit = async (noteId) => {
    const content = editValue.trim();
    if (!content) return;

    const ownerInfo = getOwnerInfo();
    if (!ownerInfo) return;

    setNotes(prev => prev.map(n => n._id === noteId ? { ...n, content } : n));
    setEditingNote(null);

    try {
      await fetch('/api/call-notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, content, ownerId: ownerInfo.ownerId }),
      });
    } catch (error) {
      console.error('Error editing note:', error);
      fetchNotes();
    }
  };

  const handleEditKeyDown = (e, noteId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit(noteId);
    } else if (e.key === 'Escape') {
      setEditingNote(null);
    }
  };

  useEffect(() => {
    if (!activeMenu) return;
    
    const handleClickOutside = (e) => {
      // Close menu on any click that's not on the dropdown itself
      setActiveMenu(null);
    };
    
    // Add listener on next tick to avoid immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [activeMenu]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;
    
    if (inputWarning?.blocking) return;

    const ownerInfo = getOwnerInfo();
    if (!ownerInfo) return;

    setIsSending(true);
    setInputValue('');
    setInputWarning(null);

    const tempId = 'temp-' + Date.now();
    const tempNote = {
      _id: tempId,
      content,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };
    setNotes(prev => [...prev, tempNote]);
    
    setTimeout(() => {
      notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const res = await fetch('/api/call-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, ...ownerInfo, callSessionId }),
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (noteId) => {
    const ownerInfo = getOwnerInfo();
    if (!ownerInfo) return;

    setActiveMenu(null);
    setNotes(prev => prev.filter(n => n._id !== noteId));

    try {
      await fetch('/api/call-notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, ownerId: ownerInfo.ownerId }),
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      fetchNotes();
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const addInstaPrefix = () => {
    const newValue = inputValue.startsWith('@') ? inputValue : '@' + inputValue;
    setInputValue(newValue);
    setInputWarning(validateInput(newValue));
    inputRef.current?.focus();
  };

  const addWhatsappPrefix = () => {
    const newValue = inputValue.startsWith('+91') ? inputValue : '+91 ' + inputValue.replace(/^\+/, '');
    setInputValue(newValue);
    setInputWarning(validateInput(newValue));
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.container + ' ' + styles['container' + genderClass]} 
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon + ' ' + styles['headerIcon' + genderClass]}>
              <LockIcon size={18} />
            </span>
            <span className={styles.headerTitle}>Notes</span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div 
          className={styles.notesContainer}
          ref={notesContainerRef}
          onScroll={handleScroll}
        >
          {hasMore && notes.length > 0 && (
            <div className={styles.loadMoreArea}>
              {isLoading ? (
                <div className={styles.loadingDots}><span /><span /><span /></div>
              ) : (
                <span className={styles.loadMoreText}>Scroll up for older notes</span>
              )}
            </div>
          )}

          {!isLoading && notes.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper + ' ' + styles['emptyIconWrapper' + genderClass]}>
                <LockIcon size={28} />
              </div>
              <h3 className={styles.emptyTitle}>Your Notes</h3>
              <p className={styles.emptySubtitle}>
                Save Instagram handles, phone numbers, or anything else. <strong>End-to-end encrypted</strong>.
              </p>
              <div className={styles.emptyHints}>
                <div className={styles.hintItem}>
                  <span className={styles.hintIcon}><InstagramIcon size={16} /></span>
                  <span>Type <code>@username</code> for Instagram</span>
                </div>
                <div className={styles.hintItem}>
                  <span className={styles.hintIcon}><WhatsAppIcon style={{ fontSize: 16 }} /></span>
                  <span>Phone numbers link to WhatsApp</span>
                </div>
              </div>
            </div>
          )}

          {notes.map((note) => (
            <div 
              key={note._id} 
              className={styles.noteCard + (note.isTemp ? ' ' + styles.noteCardSending : '')}
            >
              {editingNote === note._id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleEditKeyDown(e, note._id)}
                  onBlur={() => saveEdit(note._id)}
                  className={styles.editInput}
                />
              ) : (
                <p className={styles.noteContent}>
                  <NoteContent content={note.content} />
                </p>
              )}
              <div className={styles.noteFooter}>
                <span className={styles.noteTime}>{formatTime(note.createdAt)}</span>
                
                {!note.isTemp && editingNote !== note._id && (
                  <div className={styles.noteActions}>
                    <button 
                      className={styles.actionBtn + (copiedId === note._id ? ' ' + styles.copied : '')}
                      onClick={() => handleCopy(note)}
                      title="Copy"
                    >
                      {copiedId === note._id ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      )}
                    </button>

                    <div className={styles.menuWrapper}>
                      <button 
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === note._id ? null : note._id);
                        }}
                        title="More"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>

                      {activeMenu === note._id && (
                        <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
                          <button className={styles.dropdownItem} onClick={() => startEdit(note)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button className={styles.dropdownItem + ' ' + styles.deleteItem} onClick={() => handleDelete(note._id)}>
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
            </div>
          ))}

          <div ref={notesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <div className={styles.quickActions}>
            <button 
              className={styles.quickBtn + ' ' + styles.instaBtn + (activeShortcut === 'insta' ? ' ' + styles.active : activeShortcut === 'phone' ? ' ' + styles.dimmed : '')} 
              onClick={addInstaPrefix}
              title="Add Instagram"
            >
              <InstagramOutlinedIcon style={{ fontSize: 18 }} />
            </button>
            <button 
              className={styles.quickBtn + ' ' + styles.phoneBtn + (activeShortcut === 'phone' ? ' ' + styles.active : activeShortcut === 'insta' ? ' ' + styles.dimmed : '')} 
              onClick={addWhatsappPrefix}
              title="Add Phone"
            >
              <PhoneOutlinedIcon style={{ fontSize: 18 }} />
            </button>
          </div>
          {inputWarning && (
            <div className={styles.inputWarning}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {inputWarning.message}
            </div>
          )}
          <div className={styles.inputWrapper + (inputWarning ? ' ' + styles.inputWrapperWarning : '')}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a note..."
              className={styles.input}
              disabled={isSending}
            />
            <button 
              className={styles.sendButton + ' ' + styles['sendButton' + genderClass] + (inputValue.trim() && !inputWarning?.blocking ? ' ' + styles.active : '')}
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending || inputWarning?.blocking}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
