import React, { createContext, useState, useContext } from 'react';

const TextChatContext = createContext();

export const TextChatProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isFindingPair, setIsFindingPair] = useState(false);
    const [strangerDisconnectedMessageDiv, setStrangerDisconnectedMessageDiv] = useState(false);
    const [room, setRoom] = useState('');
    const [receiver, setReceiver] = useState('');
    const [strangerGender, setStrangerGender] = useState('');
    const [hasPaired, setHasPaired] = useState(false);
    const [strangerIsTyping, setStrangerIsTyping] = useState(false);
    const [usersOnline, setUsersOnline] = useState('');
    const [messages, setMessages] = useState([])
    return (
        <TextChatContext.Provider
            value={{
                socket, setSocket,
                isFindingPair, setIsFindingPair,
                strangerDisconnectedMessageDiv, setStrangerDisconnectedMessageDiv,
                room, setRoom,
                receiver, setReceiver,
                strangerGender, setStrangerGender,
                hasPaired, setHasPaired,
                strangerIsTyping, setStrangerIsTyping,
                usersOnline, setUsersOnline,
                messages, setMessages
            }}
        >
            {children}
        </TextChatContext.Provider>
    );
};

export const useTextChat = () => useContext(TextChatContext);
