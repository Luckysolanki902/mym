import { io } from 'socket.io-client';
import { handleIdentify, handlePairDisconnected, handlePairingSuccess } from "@/utils/ramdomchat/audiocallSocketFunctions";

// const serverUrl = 'https://hostedmymserver.onrender.com'
const serverUrl = 'http://localhost:1000'

export const initiateSocket = (socket, userDetailsAndPreferences, hasPaired, stateFunctions, peer) => {

    const { setSocket, setUsersOnline, localStream } = stateFunctions;
    let newPeer
    let newSocket;
    try {
        if (!socket) {
            newSocket = io(serverUrl);
            setSocket(newSocket);
        } else {
            newSocket = socket;
        }
    } catch (error) {
        console.log('error setting newsocket', error);
    }

    newSocket.on('connect', () => {
        console.log('Connected to server');

        handleIdentify(newSocket, userDetailsAndPreferences);

        newSocket.on('roundedUsersCount', (count) => {
            setUsersOnline(count);
        });

        newSocket.on('pairingSuccess', (data) => {
            newPeer = handlePairingSuccess(data, newSocket, hasPaired, stateFunctions, peer);
            console.log('np', newPeer)
        });

        newSocket.on('pairDisconnected', () => {
            handlePairDisconnected(stateFunctions);
        });

        if (newPeer && newPeer !== null) {
            console.log('np2', newPeer)
            // Offer received from the other peer
            newSocket.on('offer', (data) => {
                const { from, offer } = data;

                if (newPeer) { // Check if the peer object exists
                    console.log(newPeer)
                    newPeer.signal(offer);

                    newPeer.on('signal', (answer) => {
                        newSocket.emit('answer', { to: from, answer });
                    });
                } else {
                    console.error('Peer object not yet available to process offer');
                    // Handle this situation - maybe store the offer temporarily?
                }
            });
            // Answer received from the other peer
            newSocket.on('answer', (data) => {
                const { answer } = data;
                newPeer.signal(answer);
            });
        }

        newSocket.on('disconnect', () => {
            setSocket(null);
        });

        // Basic error handling
        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });
};
