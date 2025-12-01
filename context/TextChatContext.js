import React, { createContext, useState, useContext, useRef } from 'react';

const TextChatContext = createContext();

export const TextChatProvider = ({ children }) => {
    // Socket and basic state
    const [socket, setSocket] = useState(null);
    const [isFindingPair, setIsFindingPair] = useState(false);
    const [strangerDisconnectedMessageDiv, setStrangerDisconnectedMessageDiv] = useState(false);
    const [room, setRoom] = useState('');
    const [receiver, setReceiver] = useState('');
    const [strangerGender, setStrangerGender] = useState('');
    const [hasPaired, setHasPaired] = useState(false);
    const [strangerIsTyping, setStrangerIsTyping] = useState(false);
    const [usersOnline, setUsersOnline] = useState(0);
    const [messages, setMessages] = useState([]);
    const [isStrangerVerified, setIsStrangerVerified] = useState(true);
    
    // Enhanced Pairing System State
    const [queuePosition, setQueuePosition] = useState(0);
    const [waitTime, setWaitTime] = useState(0);
    const [filterLevel, setFilterLevel] = useState(1);
    const [filterDescription, setFilterDescription] = useState('Searching in your college for preferred gender');
    const [estimatedWaitTime, setEstimatedWaitTime] = useState(0);
    const [queueSize, setQueueSize] = useState(0);
    const [pairingState, setPairingState] = useState('IDLE'); // IDLE, WAITING, PAIRED, CHATTING
    const [matchQuality, setMatchQuality] = useState(null); // Stores match quality info after pairing
    
    // Refs
    const paddingDivRef = useRef(null);
    
    return (
        <TextChatContext.Provider
            value={{
                // Original state
                socket, setSocket,
                isFindingPair, setIsFindingPair,
                strangerDisconnectedMessageDiv, setStrangerDisconnectedMessageDiv,
                room, setRoom,
                receiver, setReceiver,
                strangerGender, setStrangerGender,
                hasPaired, setHasPaired,
                strangerIsTyping, setStrangerIsTyping,
                usersOnline, setUsersOnline,
                messages, setMessages,
                paddingDivRef,
                isStrangerVerified, setIsStrangerVerified,
                
                // Enhanced pairing state
                queuePosition, setQueuePosition,
                waitTime, setWaitTime,
                filterLevel, setFilterLevel,
                filterDescription, setFilterDescription,
                estimatedWaitTime, setEstimatedWaitTime,
                queueSize, setQueueSize,
                pairingState, setPairingState,
                matchQuality, setMatchQuality,
            }}
        >
            {children}
        </TextChatContext.Provider>
    );
};

export const useTextChat = () => useContext(TextChatContext);
