import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router';
import styles from '@/components/componentStyles/videochat.module.css';

const useSendMessage = (socket, sender, receiver) => {
    const sendMessage = useCallback((message) => {
        socket.emit('sendMessage', { sender, receiver, message, });
    },
        [socket, sender, receiver]
    );

    return sendMessage;
};

const ChatPage = () => {
    const [textValue, setTextValue] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesContainerRef = useRef(null);
    const socket = useRef(null);
    const router = useRouter();
    const sender = router.query.username;
    const receiver = router.query.remoteuser;

    const sendMessage = useSendMessage(socket.current, sender, receiver);

    const handleChange = (event) => {
        const { value } = event.target;
        setTextValue(value);
    };

    const handleSend = () => {
        if (textValue.trim() !== '') {
            sendMessage(textValue.trim());
            setTextValue('');
        }
    };

    useEffect(() => {
        socket.current = io('http://localhost:3001');

        if (sender) {
            socket.current.emit('user connected', { displayName: sender });
        }

        socket.current.on('receiveMessage', ({ sender, message }) => {
            setMessages((prevMessages) => [...prevMessages, { sender, message }]);
        });

        return () => {
            socket.current.disconnect();
        };
    }, [sender]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className={styles.videoChatContainer}>
            <div className={styles.messagesContainer} ref={messagesContainerRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`${styles.message} ${msg.sender === sender ? styles.left : styles.right}`}>
                        {msg.sender === sender ? 'Me' : 'Stranger'}: {msg.message}
                    </div>
                ))}
            </div>
            <div className={styles.inputContainer}>
                <div style={{ width: '100%', display: 'flex', marginTop: '2rem', alignItems: 'center', justifyContent: 'center', height: '2rem' }}>
                    <div className={styles.messageBox}>
                        <textarea name="messageBox" id="messageBox" value={textValue} rows={3} onChange={handleChange} style={{ width: '100%' }}></textarea>
                    </div>
                    <button className={styles.sendButton} onClick={handleSend}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
