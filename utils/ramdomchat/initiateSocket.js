import { io } from 'socket.io-client';
import { handleIdentify, handlePairDisconnected, handlePairingSuccess, handleReceivedMessage } from "@/utils/ramdomchat/socketFunctions";
// const serverUrl = 'https://hostedmymserver.onrender.com'
const serverUrl = 'http://localhost:1000'

export const initiateSocket = (socket, userDetailsAndPreferences, hasPaired, stateFunctions, refs) => {

    const {room, setSocket, setUsersOnline, setStrangerIsTyping,strangerSocketId } = stateFunctions;
    const { messagesContainerRef, findingTimeoutRef } = refs

    let newSocket
    try {
        if (socket === null || !socket || socket === undefined) {
            newSocket = io(serverUrl, { query: { pageType: 'textchat' } });
            setSocket(newSocket)
        } else {
            newSocket = socket
        }
    } catch (error) {
        console.log('error setting newsocket', error)
    }

    newSocket.on('connect', () => {
        console.log('Connected to server');

        // sending your preferences to server
        handleIdentify(newSocket, userDetailsAndPreferences, stateFunctions, findingTimeoutRef)

        // getting number of users online
        newSocket.on('roundedUsersCount', (count) => {
            setUsersOnline(count)
        })

        // Handling the successful pairing event
        newSocket.on('pairingSuccess', (data) => {
            handlePairingSuccess(data, hasPaired, stateFunctions, findingTimeoutRef)
        });

        // Handling receive message event
        newSocket.on('message', (data) => {
            handleReceivedMessage(data, stateFunctions, messagesContainerRef);
        });

        // sending 'user is typing' evnent to server
        newSocket.on('userTyping', () => {
            setStrangerIsTyping(true)
        });

        // sending 'user stopped typing' event to server
        newSocket.on('userStoppedTyping', () => {
            setStrangerIsTyping(false)
        });

        // Handling stranger's disconnection event
        newSocket.on('pairDisconnected', () => {
            handlePairDisconnected(stateFunctions, messagesContainerRef)
        });


        // handling user's disconnection
        newSocket.on('disconnect', () => {
            setSocket(null)
        });
    });
}