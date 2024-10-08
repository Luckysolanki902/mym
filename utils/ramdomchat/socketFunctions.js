import { scrollToBottom } from "../generalUtilities";
import CryptoJS from 'crypto-js';
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
                userEmail: userDetails.email,
                userGender: userDetails.gender,
                userCollege: userDetails.college,
                preferredGender: preferredGender,
                preferredCollege: preferredCollege,
                pageType: 'textchat'
            });
            console.log('Finding first pair');
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
        setHasPaired
    } = stateFunctions;

    if (!hasPaired) {
        setStrangerDisconnectedMessageDiv(false);
        setIsFindingPair(false);

        const { roomId, strangerGender, stranger } = data;
        setRoom(roomId);
        setReceiver(stranger);
        setStrangerGender(strangerGender);

        const snackbarColor = strangerGender === 'male' ? '#0094d4' : '#e3368d';
        setSnackbarColor(snackbarColor);

        const snackbarMessage = `A ${strangerGender === 'male' ? 'boy' : 'girl'} connected`;
        setSnackbarMessage(snackbarMessage);

        setSnackbarOpen(true); // Show the Snackbar
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
    scrollToBottom(messagesContainerRef);
};

export const handlePairDisconnected = (stateFunctions, messagesContainerRef) => {

    const { setStrangerDisconnectedMessageDiv, setHasPaired } = stateFunctions;

    console.log('Partner disconnected');
    setStrangerDisconnectedMessageDiv(true);
    setHasPaired(false);
    scrollToBottom(messagesContainerRef);
};

// Your handleSend function
export const handleSend = (socket, textValue, stateFunctions, messagesContainerRef, userDetails, hasPaired) => {
    const { setTextValue, setMessages, setStrangerIsTyping } = stateFunctions;
    const message = textValue.trim();
    if (message !== '' && socket && hasPaired) {
        const encryptedMessage = encryptMessage(message, secretKey);
        socket.emit('message', { type: 'message', content: encryptedMessage, userEmail: userDetails?.email, pageType: 'textchat' });
        setTextValue('');
        setMessages(prevMessages => [
            ...prevMessages,
            { sender: userDetails?.email, message: message },
        ]);
        setStrangerIsTyping(false);
    }
    scrollToBottom(messagesContainerRef);
};


export const handleTyping = (e, socket, typingTimeoutRef, userDetails, hasPaired) => {
    if (e.key !== 'Enter' && socket && hasPaired) {
        socket.emit('userTyping', { userEmail: userDetails?.email, pageType: 'textchat' });

        // Clear any existing timeout
        clearTimeout(typingTimeoutRef.current);

        // Set a new timeout with dynamic delay
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('userStoppedTyping', { userEmail: userDetails?.email, pageType: 'textchat' });
        }, e.key === ' ' ? 500 : 1500); // Shorter timeout for spaces
    }
};

export const handleStoppedTyping = (socket, typingTimeoutRef, userDetails, hasPaired) => {
    clearTimeout(typingTimeoutRef.current);
    if (socket && hasPaired) {
        socket.emit('userStoppedTyping', { userEmail: userDetails?.email, pageType: 'textchat' });
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
        userEmail: userDetails?.email,
        userGender: userDetails?.gender,
        userCollege: userDetails?.college,
        preferredGender: preferredGender,
        preferredCollege: preferredCollege,
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
        userEmail: userDetails?.email,
        userGender: userDetails?.gender,
        userCollege: userDetails?.college,
        preferredGender: preferredGender,
        preferredCollege: preferredCollege,
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
}