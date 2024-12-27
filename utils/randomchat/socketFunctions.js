// utils/randomchat/socketFunctions.js

import CryptoJS from 'crypto-js';
import { scrollToBottom, triggerVibration } from "../generalUtilities";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

const encryptMessage = (message, secretKey) => {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
};

const decryptMessage = (encryptedMessage, secretKey) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const handleIdentify = (socket, userDetailsAndPreferences, stateFunctions, findingTimeoutRef) => {
    const { setIsFindingPair } = stateFunctions;
    const { userDetails, preferredCollege, preferredGender } = userDetailsAndPreferences;
    setIsFindingPair(true);
    try {
        if (userDetails && preferredCollege !== undefined && preferredGender !== undefined) {
            // Identify user and send preferences to the server
            socket.emit('identify', {
                userMID: userDetails.mid,
                userGender: userDetails.gender,
                userCollege: userDetails.college,
                preferredGender: preferredGender,
                preferredCollege: preferredCollege,
                isVerified: userDetails?.isVerified || false,
                pageType: 'textchat'
            });
        }
    } catch (error) {
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
        setSnackbarColor,
        setSnackbarMessage,
        setSnackbarOpen,
        setHasPaired,
        setIsStrangerVerified,
    } = stateFunctions;

    if (!hasPaired) {
        setStrangerDisconnectedMessageDiv(false);
        setIsFindingPair(false);

        const { roomId, strangerGender, stranger, isStrangerVerified } = data;
        setRoom(roomId);
        setReceiver(stranger);
        setStrangerGender(strangerGender);
        setIsStrangerVerified(isStrangerVerified);

        triggerVibration({
            duration: 200,
            strength: 0.5,
            interval: 100,
            repeat: 2
        });

        // Uncomment and customize if you wish to use snackbar notifications
        /*
        const snackbarColor = strangerGender === 'male' ? '#0094d4' : '#e3368d';
        setSnackbarColor(snackbarColor);

        const snackbarMessage = `A ${strangerGender === 'male' ? 'boy' : 'girl'} connected`;
        setSnackbarMessage(snackbarMessage);

        setSnackbarOpen(true);
        */
        setHasPaired(true);
    }

    // Clear the timeout
    clearTimeout(findingTimeoutRef.current);
};

// Your handleReceivedMessage function
export const handleReceivedMessage = (data, stateFunctions, messagesContainerRef) => {
    const { setStrangerIsTyping, setMessages } = stateFunctions;
    setStrangerIsTyping(false);

    const { sender, content } = data;
    const decryptedMessage = decryptMessage(content, secretKey);
    setMessages((prevMessages) => [
        ...prevMessages,
        { sender: sender, message: decryptedMessage },
    ]);

    triggerVibration({
        duration: 150,
        strength: 0.3,
        repeat: 1
    });

    scrollToBottom(messagesContainerRef);
};

export const handlePairDisconnected = (stateFunctions, messagesContainerRef) => {
    const { setStrangerDisconnectedMessageDiv, setHasPaired } = stateFunctions;

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
            { sender: userDetails?.mid, message: message },
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
    const { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages } = stateFunctions;

    setHasPaired(false);
    setIsFindingPair(true); // Set finding pair state to true
    setStrangerDisconnectedMessageDiv(false);

    setMessages([]);
    socket.emit('findNewPair', {
        userMID: userDetails?.mid,
        userGender: userDetails?.gender,
        userCollege: userDetails?.college,
        preferredGender: preferredGender,
        preferredCollege: preferredCollege,
        isVerified: userDetails?.isVerified || false,
        pageType: 'textchat'
    });


    // const timeout = 10000;
    // clearTimeout(findingTimeoutRef.current); // Clear previous timeout
    // findingTimeoutRef.current = setTimeout(() => {
    //     // emit stop pairing here
    //     if (!hasPaired) {
    //         socket.emit('stopFindingPair');
    //         setIsFindingPair(false);
    //     }
    // }, timeout);
};

export const handleFindNewWhenSomeoneLeft = (socket, userDetailsAndPreferences, stateFunctions, hasPaired, findingTimeoutRef) => {
    const { userDetails, preferredCollege, preferredGender } = userDetailsAndPreferences;
    const { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv, setMessages } = stateFunctions;

    setHasPaired(false);
    setIsFindingPair(true); // Set finding pair state to true
    setStrangerDisconnectedMessageDiv(false);

    setMessages([]);
    socket.emit('findNewPairWhenSomeoneLeft', {
        userMID: userDetails?.mid,
        userGender: userDetails?.gender,
        userCollege: userDetails?.college,
        preferredGender: preferredGender,
        preferredCollege: preferredCollege,
        isVerified: userDetails?.isVerified || false,
        pageType: 'textchat'
    });

    // const timeout = 10000;
    // clearTimeout(findingTimeoutRef.current); // Clear previous timeout
    // findingTimeoutRef.current = setTimeout(() => {
    //     // emit stop pairing here
    //     if (!hasPaired) {
    //         socket.emit('stopFindingPair');
    //         setIsFindingPair(false);
    //     }
    // }, timeout);
};


export const stopFindingPair = (socket, stateFunctions) => {
    const { setIsFindingPair } = stateFunctions;
    socket.emit('stopFindingPair');
    setIsFindingPair(false);
};
