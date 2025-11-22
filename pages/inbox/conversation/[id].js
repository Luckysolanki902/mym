import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './conversation.module.css';

const ConversationPage = ({ initialData, userDetails }) => {
    const router = useRouter();
    const { id } = router.query;
    const [conversation, setConversation] = useState(initialData);
    const [replyText, setReplyText] = useState('');
    const [activeReplyId, setActiveReplyId] = useState(null);

    const userGender = userDetails?.gender || 'male';
    const isMale = userGender === 'male';
    const confessionGender = conversation?.confessorGender || 'male';

    if (!conversation) {
        return <div className={styles.loading}>Loading...</div>;
    }

    const handleReply = async (primaryReplyId) => {
        if (!replyText.trim()) return;

        // Handle reply submission
        setReplyText('');
        setActiveReplyId(null);
    };

    return (
        <div className={`${styles.conversationWrapper} ${isMale ? styles.maleTheme : styles.femaleTheme}`}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button 
                        className={`${styles.backButton} ${isMale ? styles.maleBackButton : styles.femaleBackButton}`}
                        onClick={() => router.push('/inbox')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        <span>Back</span>
                    </button>
                    <h1 className={`${styles.title} ${isMale ? styles.maleTitle : styles.femaleTitle}`}>
                        Conversation
                    </h1>
                </div>

                {/* Confession */}
                <div className={`${styles.confessionCard} ${confessionGender === 'male' ? styles.maleCard : styles.femaleCard}`}>
                    <div className={styles.confessionLabel}>
                        Original Confession
                    </div>
                    <div className={`${styles.confessionText} ${confessionGender === 'male' ? styles.maleText : styles.femaleText}`}>
                        {conversation?.confessionContent}
                    </div>
                    <Link href={`/confession/${id}`} className={styles.viewFullLink}>
                        View full confession →
                    </Link>
                </div>

                {/* Replies Thread */}
                <div className={styles.repliesSection}>
                    <h2 className={styles.repliesTitle}>
                        {conversation?.replies?.length || 0} {conversation?.replies?.length === 1 ? 'Reply' : 'Replies'}
                    </h2>

                    {conversation?.replies?.slice().reverse().map((reply, index) => (
                        <div key={index} className={styles.replyThread}>
                            {/* Primary Reply */}
                            <div className={`${styles.replyCard} ${reply.replierGender === 'male' ? styles.maleReply : styles.femaleReply}`}>
                                <div className={styles.replyHeader}>
                                    <span className={styles.replierLabel}>
                                        {reply.replierGender === 'male' ? 'Him' : 'Her'}
                                    </span>
                                </div>
                                <div className={styles.replyText}>
                                    {reply.reply}
                                </div>
                                <button
                                    className={`${styles.replyButton} ${isMale ? styles.maleButton : styles.femaleButton}`}
                                    onClick={() => setActiveReplyId(activeReplyId === reply._id ? null : reply._id)}
                                >
                                    {activeReplyId === reply._id ? 'Cancel' : 'Reply'}
                                </button>
                            </div>

                            {/* Secondary Replies */}
                            {reply.secondaryReplies?.length > 0 && (
                                <div className={styles.secondaryReplies}>
                                    {reply.secondaryReplies.map((secReply, secIndex) => (
                                        <div 
                                            key={secIndex}
                                            className={`${styles.secondaryReply} ${secReply.sentByConfessor ? (confessionGender === 'male' ? styles.maleSecondary : styles.femaleSecondary) : (secReply.replierGender === 'male' ? styles.maleSecondary : styles.femaleSecondary)}`}
                                        >
                                            <span className={styles.secondaryLabel}>
                                                {secReply.sentByConfessor ? 'You' : (secReply.replierGender === 'male' ? 'Him' : 'Her')}:
                                            </span>
                                            <span className={styles.secondaryText}>
                                                {secReply.content}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Input */}
                            {activeReplyId === reply._id && (
                                <div className={styles.replyInputContainer}>
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        className={`${styles.replyInput} ${isMale ? styles.maleInput : styles.femaleInput}`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleReply(reply._id);
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        className={`${styles.sendButton} ${isMale ? styles.maleSend : styles.femaleSend}`}
                                        onClick={() => handleReply(reply._id)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export async function getServerSideProps(context) {
    const { id } = context.params;
    const session = await getSession(context);
    const pageurl = process.env.NEXT_PUBLIC_PAGEURL;

    let userDetails = null;
    let initialData = null;

    if (session) {
        try {
            const userResponse = await fetch(`${pageurl}/api/getdetails/getuserdetails?userEmail=${encodeURIComponent(session.user.email)}`);
            if (userResponse.ok) {
                userDetails = await userResponse.json();
            }

            if (userDetails?.mid) {
                const dataResponse = await fetch(`${pageurl}/api/inbox/get-replies-to-confessions?mid=${userDetails.mid}`);
                if (dataResponse.ok) {
                    const data = await dataResponse.json();
                    initialData = data.personalReplies?.find(item => item.confessionId === id);
                }

                if (!initialData) {
                    const dataResponse2 = await fetch(`${pageurl}/api/inbox/get-replies-to-replies?mid=${userDetails.mid}`);
                    if (dataResponse2.ok) {
                        const data = await dataResponse2.json();
                        initialData = data.personalReplies?.find(item => item.confessionId === id);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    }

    return {
        props: {
            initialData: initialData || null,
            userDetails: userDetails || null,
        },
    };
}

export default ConversationPage;
