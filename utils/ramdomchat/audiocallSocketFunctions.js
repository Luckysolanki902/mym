// @/utils/randomchat/socketEvents.js
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
        });
    }
}

export const handlePairingSuccess = (data, newSocket, hasPaired, stateFunctions, peer) => {
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
      localStream,
      setPeer,
      setRemoteStream // Make sure setRemoteStream is defined in your stateFunctions
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
  
      // Move the offer-related logic inside this block
      const newPeer = new SimplePeer({
        initiator: true,
        stream: localStream,
        trickle: false,
      });
  
      newPeer.on('signal', (data) => {
        newSocket.emit('offer', { to: stranger, offer: data });
      });
  
      newPeer.on('stream', (stream) => {
        setRemoteStream(stream);
      });
  
      newPeer.on('error', (error) => {
        console.error('Peer error:', error);
      });
  
      setPeer(newPeer);

    }
  
    setHasPaired(true);
  };
  
  

export const handlePairDisconnected = (stateFunctions) => {

    const { setStrangerDisconnectedMessageDiv, setHasPaired } = stateFunctions;

    console.log('Partner disconnected');
    setStrangerDisconnectedMessageDiv(true)
    setHasPaired(false)
}


export const handleFindNew = (socket, userDetailsAndPreferences, stateFunctions) => {
    const { userDetails, preferredCollege, preferredGender } = userDetailsAndPreferences;
    const { setHasPaired, setIsFindingPair, setStrangerDisconnectedMessageDiv } = stateFunctions;

    setHasPaired(false);
    setIsFindingPair(true); // Set finding pair state to true
    setStrangerDisconnectedMessageDiv(false);
    socket.emit('findNewPair', {
        userEmail: userDetails?.email,
        userGender: userDetails?.gender,
        userCollege: userDetails?.college,
        preferredGender: preferredGender,
        preferredCollege: preferredCollege,
    });
    console.log('Finding new pair');

    const timeout = 10000;
    setTimeout(() => {
        setIsFindingPair(false);
    }, timeout);
};

