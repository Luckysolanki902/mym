// utils/randomchat/socketFunctions.js

import CryptoJS from 'crypto-js';
import { scrollToBottom, triggerVibration } from "../generalUtilities";
import { devLogger } from './developmentLogger';

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

const encryptMessage = (message, secretKey) => {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
};

const decryptMessage = (encryptedMessage, secretKey) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const handleIdentify = (socket, userDetailsAndPreferences, stateFunctions, findingTimeoutRef) => {
    const { userDetails, preferredCollege, preferredGender } = userDetailsAndPreferences;
    
    try {
        if (userDetails && preferredCollege !== undefined && preferredGender !== undefined) {
            // Just identify - queue joining happens via handleFindNew
            socket.emit('identify', {
                userMID: userDetails.mid,
                userGender: userDetails.gender,
                userCollege: userDetails.college,
                preferredGender: preferredGender,
                preferredCollege: preferredCollege,
                isVerified: userDetails?.isVerified || false,
                pageType: 'textchat',
                joinQueue: false  // Don't auto-join, let auto-start effect handle it
            });
            
            devLogger.socket('User identified (not auto-joining queue)', {
                userMID: userDetails.mid,
                gender: userDetails.gender,
                college: userDetails.college,
                preferences: { gender: preferredGender, college: preferredCollege }
            });
        }
    } catch (error) {
        devLogger.error('Error in handleIdentify', { error: error.message });
        console.error('Error in handleIdentify:', error.message);
    }
};

export const handlePairingSuccess = (data, hasPaired, stateFunctions, findingTimeoutRef) => {
    const {
        setStrangerDisconnectedMessageDiv,
        setIsFindingPair,
        setRoom,
        setReceiver,
        setStrangerGender,
        setHasPaired,
        setIsStrangerVerified,
        setPairingState,
        setMatchQuality,
    } = stateFunctions;

    if (!hasPaired) {
        setStrangerDisconnectedMessageDiv(false);
        setIsFindingPair(false);

        const { roomId, strangerGender, stranger, isStrangerVerified, matchQuality, waitTime } = data;
        setRoom(roomId);
        setReceiver(stranger);
        setStrangerGender(strangerGender);
        setIsStrangerVerified(isStrangerVerified);
        setMatchQuality(matchQuality);
        setPairingState('CHATTING');

        devLogger.pairingSuccess({
            room: roomId,
            receiver: stranger,
            strangerGender,
            isStrangerVerified,
            matchQuality,
            waitTime
        });

        triggerVibration({
            duration: 200,
            strength: 0.5,
            interval: 100,
            repeat: 2
        });

        setHasPaired(true);
    }

    // Clear the timeout
    clearTimeout(findingTimeoutRef.current);
};

// Your handleReceivedMessage function
export const handleReceivedMessage = (data, stateFunctions, messagesContainerRef) => {
    const { setStrangerIsTyping, setMessages } = stateFunctions;
    
    const { sender, content } = data;
    const decryptedMessage = decryptMessage(content, secretKey);
    
    devLogger.message('Message received', { sender, messageLength: decryptedMessage.length });
    
    // BRILLIANT SOLUTION: Staggered transition for buttery smooth animation
    // Step 1: Immediately hide typing (starts fade out)
    setStrangerIsTyping(false);
    
    // Step 2: Wait for typing indicator to be halfway through fade out (125ms)
    // Then add the message (it will start appearing as typing disappears)
    setTimeout(() => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { 
                sender: sender, 
                message: decryptedMessage,
                timestamp: Date.now(), // Unique timestamp for React key
                id: `${sender}-${Date.now()}-${Math.random()}` // Unique ID
            },
        ]);

        triggerVibration({
            duration: 150,
            strength: 0.3,
            repeat: 1
        });

        // Scroll after message renders
        setTimeout(() => {
            scrollToBottom(messagesContainerRef);
        }, 50);
    }, 125); // 125ms = half of 250ms typing fade duration
};

export const handlePairDisconnected = (stateFunctions, messagesContainerRef) => {
    const { setStrangerDisconnectedMessageDiv, setHasPaired } = stateFunctions;

    devLogger.pairing('Pair disconnected');

    setStrangerDisconnectedMessageDiv(true);
    setHasPaired(false);
    scrollToBottom(messagesContainerRef);

    triggerVibration({
        duration: 250,
        strength: 0.3,
        repeat: 1
    });
};

// Your handleSend function
export const handleSend = (socket, textValue, stateFunctions, messagesContainerRef, userDetails, hasPaired) => {
    const { setTextValue, setMessages, setStrangerIsTyping } = stateFunctions;
    const message = textValue.trim();
    if (message !== '' && socket && hasPaired) {
        const encryptedMessage = encryptMessage(message, secretKey);
        socket.emit('message', { type: 'message', content: encryptedMessage, userMID: userDetails?.mid, pageType: 'textchat' });
        setTextValue('');
        setMessages(prevMessages => [
            ...prevMessages,
            { 
                sender: userDetails?.mid, 
                message: message,
                timestamp: Date.now(), // Unique timestamp for React key
                id: `${userDetails?.mid}-${Date.now()}-${Math.random()}` // Unique ID
            },
        ]);
        setStrangerIsTyping(false);
    }

    triggerVibration({
        duration: 50,
        strength: 0.2,
        repeat: 1
    });

    scrollToBottom(messagesContainerRef);
};

// Updated handleTyping function with debounce
export const handleTyping = (e, socket, typingTimeoutRef, userDetails, hasPaired, isTypingRef) => {
    if (e.key !== 'Enter' && socket && hasPaired) {
        if (!isTypingRef.current) {
            socket.emit('userTyping', { userMID: userDetails?.mid, pageType: 'textchat' });
            isTypingRef.current = true;
        }

        // Clear any existing timeout
        clearTimeout(typingTimeoutRef.current);

        // Set a new timeout with a consistent delay (e.g., 1000ms)
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('userStoppedTyping', { userMID: userDetails?.mid, pageType: 'textchat' });
            isTypingRef.current = false;
        }, 1000); // 1 second delay after the last keystroke
    }
};

// Updated handleStoppedTyping function with isTypingRef parameter
export const handleStoppedTyping = (socket, typingTimeoutRef, userDetails, hasPaired, isTypingRef) => {
    clearTimeout(typingTimeoutRef.current);
    if (socket && hasPaired && isTypingRef.current) {
        socket.emit('userStoppedTyping', { userMID: userDetails?.mid, pageType: 'textchat' });
        isTypingRef.current = false;
    }
};

export const handleFindNew = (socket, userDetailsAndPreferences, stateFunctions, hasPaired, findingTimeoutRef) => {
    const { userDetails, preferredCollege, preferredGender } = userDetailsAndPreferences;
    const { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages, setIsStrangerVerified, setPairingState } = stateFunctions;

    devLogger.pairing('Finding new pair', { 
        userMID: userDetails?.mid, 
        currentState: { hasPaired, isFindingPair: true } 
    });

    // Clear all states
    setHasPaired(false);
    setIsFindingPair(true);
    setStrangerDisconnectedMessageDiv(false);
    setMessages([]);
    setIsStrangerVerified && setIsStrangerVerified(false);
    if (setPairingState) setPairingState('FINDING');

    // Clear any existing timeout
    clearTimeout(findingTimeoutRef?.current);

    // Emit to server
    socket.emit('findNewPair', {
        userMID: userDetails?.mid,
        userGender: userDetails?.gender,
        userCollege: userDetails?.college,
        preferredGender: preferredGender,
        preferredCollege: preferredCollege,
        isVerified: userDetails?.isVerified || false,
        pageType: 'textchat'
    });

    devLogger.socket('findNewPair emitted', { userMID: userDetails?.mid });

    // Safety timeout - if no queueJoined event received within 10s
    const safetyTimeout = setTimeout(() => {
        devLogger.warning('Safety timeout: No queue acknowledgment, resetting state');
        setIsFindingPair(false);
        if (setPairingState) setPairingState('IDLE');
    }, 10000);

    if (findingTimeoutRef) {
        findingTimeoutRef.current = safetyTimeout;
    }
};

export const handleFindNewWhenSomeoneLeft = (socket, userDetailsAndPreferences, stateFunctions, hasPaired, findingTimeoutRef) => {
    const { userDetails, preferredCollege, preferredGender } = userDetailsAndPreferences;
    const { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages, setIsStrangerVerified, setPairingState } = stateFunctions;

    devLogger.pairing('Finding new pair after someone left', { 
        userMID: userDetails?.mid 
    });

    // Clear all states
    setHasPaired(false);
    setIsFindingPair(true);
    setStrangerDisconnectedMessageDiv(false);
    setMessages([]);
    setIsStrangerVerified && setIsStrangerVerified(false);
    if (setPairingState) setPairingState('FINDING');

    // Clear any existing timeout
    clearTimeout(findingTimeoutRef?.current);

    // Emit to server
    socket.emit('findNewPairWhenSomeoneLeft', {
        userMID: userDetails?.mid,
        userGender: userDetails?.gender,
        userCollege: userDetails?.college,
        preferredGender: preferredGender,
        preferredCollege: preferredCollege,
        isVerified: userDetails?.isVerified || false,
        pageType: 'textchat'
    });

    devLogger.socket('findNewPairWhenSomeoneLeft emitted', { userMID: userDetails?.mid });

    // Safety timeout - if no queueJoined event received within 10s
    const safetyTimeout = setTimeout(() => {
        devLogger.warning('Safety timeout: No queue acknowledgment, resetting state');
        setIsFindingPair(false);
        if (setPairingState) setPairingState('IDLE');
    }, 10000);

    if (findingTimeoutRef) {
        findingTimeoutRef.current = safetyTimeout;
    }
};


export const stopFindingPair = (socket, stateFunctions) => {
    const { setIsFindingPair } = stateFunctions;
    socket.emit('stopFindingPair');
    setIsFindingPair(false);
};
