import { scrollToBottom } from "../generalUtilities";

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

            const timeout = 10000;
            clearTimeout(findingTimeoutRef.current)
            findingTimeoutRef.current  = setTimeout(() => {
                // emit stop pairing here
                socket.emit('stopFindingPair');
                setIsFindingPair(false);
            }, timeout);
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


export const handleReceivedMessage = (data, stateFunctions, messagesContainerRef) => {

    const { setStrangerIsTyping, setMessages } = stateFunctions;

    setStrangerIsTyping(false);
    const { sender, content } = data;
    setMessages((prevMessages) => [
        ...prevMessages,
        { sender: sender, message: content },
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

export const handleSend = (socket, textValue, stateFunctions, messagesContainerRef, userDetails, hasPaired) => {

    const { setTextValue, setMessages, setStrangerIsTyping } = stateFunctions;

    const message = textValue.trim();

    if (message !== '' && socket && hasPaired) {
        socket.emit('message', { type: 'message', content: message, userEmail: userDetails?.email, pageType: 'textchat' });
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
    console.log('Finding new pair');

    const timeout = 10000;
    clearTimeout(findingTimeoutRef.current); // Clear previous timeout
    findingTimeoutRef.current = setTimeout(() => {
        // emit stop pairing here
        if (!hasPaired) {
            socket.emit('stopFindingPair');
            setIsFindingPair(false);
        }
    }, timeout);
};


export const stopFindingPair = (socket, stateFunctions) => {
    const {  setIsFindingPair} = stateFunctions;
    socket.emit('stopFindingPair');
    setIsFindingPair(false);
}