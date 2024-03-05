// @/utils/randomchat/socketEvents.js
import { scrollToBottom } from "../generalUtilities";
import SimplePeer from "simple-peer";

export const handleIdentify = (socket, userDetailsAndPreferences) => {

    const { userDetails, preferredCollege, preferredGender } = userDetailsAndPreferences

    if (userDetails && preferredCollege && preferredGender) {
        // Identify user and send preferences to the server
        socket.emit('identify', {
            userEmail: userDetails?.email,
            userGender: userDetails?.gender,
            userCollege: userDetails?.college,
            preferredGender: preferredGender,
            preferredCollege: preferredCollege,
            pageType: 'textchat'
        });
    }
}

export const handlePairingSuccess = (data, hasPaired, stateFunctions) => {

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
    }

    setHasPaired(true);
};

export const handleReceivedMessage = (data, stateFunctions, messagesContainerRef) => {

    const { setStrangerIsTyping, setMessages } = stateFunctions;

    setStrangerIsTyping(false);
    const { sender, content } = data;
    setMessages((prevMessages) => [
        ...prevMessages,
        { sender: sender, message: content },
    ]);
    scrollToBottom(messagesContainerRef)
};

export const handlePairDisconnected = (stateFunctions, messagesContainerRef) => {

    const { setStrangerDisconnectedMessageDiv, setHasPaired } = stateFunctions;

    console.log('Partner disconnected');
    setStrangerDisconnectedMessageDiv(true)
    setHasPaired(false)
    scrollToBottom(messagesContainerRef)
}

export const handleSend = (socket, textValue, stateFunctions, messagesContainerRef, userDetails) => {

    const { setTextValue, setMessages, setStrangerIsTyping } = stateFunctions;

    const message = textValue.trim()

    if (message !== '' && socket) {
        socket.emit('message', { type: 'message', content: message });
        setTextValue('');
        setMessages(prevMessages => [
            ...prevMessages,
            { sender: userDetails?.email, message: message },
        ]);
        setStrangerIsTyping(false);
    }
    scrollToBottom(messagesContainerRef)
}

export const handleTyping = (e, socket, typingTimeoutRef) => {
    if (e.key !== 'Enter' && socket) {
        socket.emit('typing');

        // Clear any existing timeout
        clearTimeout(typingTimeoutRef.current);

        // Set a new timeout with dynamic delay
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stoppedTyping');
        }, e.key === ' ' ? 500 : 1500); // Shorter timeout for spaces
    }
};


export const handleStoppedTyping = (socket, typingTimeoutRef) => { // Removed strangerIsTyping
    clearTimeout(typingTimeoutRef.current);
    if (socket) {
        socket.emit('stoppedTyping');
    }
};


export const handleFindNew = (socket, userDetailsAndPreferences, stateFunctions) => {
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
    setTimeout(() => {
        setIsFindingPair(false);
    }, timeout);
};


export const handleReceivedCall = (data, streamsAndPeerStates) => {
    const { setMyStream, setPartnerStream, setPeer } = streamsAndPeerStates;
    const { signal, sender } = data;

    // Create Simple Peer connection for audio call
    const peer = new SimplePeer({ initiator: false, trickle: false });

    // Save the peer instance
    setPeer(peer);

    // Set up signal events
    peer.on('signal', (data) => {
        // Send signal data back to the caller
        socket.emit('answerCall', { signalData: data, receiver: sender });
    });

    // Set up stream event
    peer.on('stream', (stream) => {
        // Save partner's stream
        setPartnerStream(stream);
    });

    // Set up error event
    peer.on('error', (error) => {
        console.error('SimplePeer error:', error);
    });

    // Signal the peer with the received signal
    peer.signal(signal);

    console.log(`Received call from ${sender}`);
};

export const startAudioCall = (socket, myStream, partnerUserId, { setPeer }) => {
    // Create Simple Peer connection for audio call
    const peer = new SimplePeer({ initiator: true, trickle: false, stream: myStream });

    // Save the peer instance
    setPeer(peer);

    // Set up signal events
    peer.on('signal', (data) => {
        // Send signal data to the partner
        socket.emit('startCall', { signalData: data, receiver: partnerUserId });
    });
};
