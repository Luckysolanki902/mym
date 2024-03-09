import React, { useEffect, useRef, useState } from 'react';
import FilterOptions from '@/components/chatComps/FilterOptions';
import styles from '../componentStyles/textchat.module.css';
import CustomSnackbar from '../commonComps/Snackbar';
import VideoCallControls from '../videoCallComps/VideoCallControls';
import { io } from 'socket.io-client';

const VideoCall = ({ userDetails }) => {
    const [socket, setSocket] = useState(null);
    const [isFindingPair, setIsFindingPair] = useState(false);
    const [strangerDisconnectedMessageDiv, setStrangerDisconnectedMessageDiv] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarColor, setSnackbarColor] = useState('');
    const [hasPaired, setHasPaired] = useState(false);
    const [usersOnline, setUsersOnline] = useState('');
    const [room, setRoom] = useState('');
    const [receiver, setReceiver] = useState('');
    const [strangerGender, setStrangerGender] = useState('');

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);

    const localVideoTrackRef = useRef(null);
    const remoteVideoTrackRef = useRef(null);
    const localAudioTrackRef = useRef(null);
    const remoteAudioTrackRef = useRef(null);

    const peerConnectionRef = useRef(null);

    const serverUrl = 'https://hostedmymserver.onrender.com'
    // const serverUrl = 'http://localhost:1000'

    const iceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add more ICE servers if needed
    ];

    const [isPartnerMuted, setIsPartnerMuted] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const [filters, setFilters] = useState({
        college: userDetails?.college,
        strangerGender: userDetails?.gender === 'male' ? 'female' : 'male',
    });

    useEffect(() => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            college: userDetails?.college || 'any',
            preferredGender: userDetails?.gender === 'male' ? 'female' : 'male',
        }));
    }, [userDetails]);

    const init = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            console.log('Successfully obtained local stream:', stream);

            // Display local video
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            let newSocket;
            try {
                if (socket === null || !socket || socket === undefined) {
                    newSocket = io(serverUrl, { query: { pageType: 'videocall' } });
                    setSocket(newSocket);
                } else {
                    newSocket = socket;
                }
            } catch (error) {
                console.log('error setting newsocket', error);
            }

            newSocket.on('connect', () => {
                console.log('Connected to server');
                handleIdentify(newSocket);
            });

            newSocket.on('roundedUsersCount', (count) => {
                setUsersOnline(count);
            });

            newSocket.on('pairingSuccess', (data) => {
                handlePairingSuccess(data);
            });

            newSocket.on('pairDisconnected', () => {
                handlePairDisconnected();
            });

            newSocket.on('disconnect', () => {
                setSocket(null);
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        } catch (error) {
            console.error('Error getting media permissions:', error);
        }
    };

    useEffect(() => {
        init();

        return () => {
            if (socket) {
                socket.disconnect();
            }
            cleanCall();
        };
    }, []);

    const handleIdentify = (socket) => {
        if (userDetails && filters.college && filters.strangerGender) {
            socket.emit('identify', {
                userEmail: userDetails?.email,
                userGender: userDetails?.gender,
                userCollege: userDetails?.college,
                preferredGender: filters.strangerGender,
                preferredCollege: filters.college,
                pageType: 'videocall',
            });
        }
    };

    const handlePairingSuccess = (data) => {
        if (!hasPaired) {
            setStrangerDisconnectedMessageDiv(false);
            setIsFindingPair(false);

            const { roomId, strangerGender, stranger } = data;
            console.log('stranger:', stranger);
            setRoom(roomId);
            setReceiver(stranger);
            setStrangerGender(strangerGender);

            const snackbarColor = strangerGender === 'male' ? '#0094d4' : '#e3368d';
            setSnackbarColor(snackbarColor);
            const snackbarMessage = `A ${strangerGender === 'male' ? 'boy' : 'girl'} connected`;
            setSnackbarMessage(snackbarMessage);
            joinCall(stranger, roomId);
            setHasPaired(true);
        }
    };

    const handlePairDisconnected = () => {
        console.log('Partner disconnected');
        setStrangerDisconnectedMessageDiv(true);
        cleanCall();
        setHasPaired(false);
    };

    const joinCall = async (stranger, room) => {
        console.log(stranger);

        if (!stranger) return;

        // Create PeerConnection
        const peerConnection = new RTCPeerConnection({ iceServers });

        // Add local stream tracks to PeerConnection
        localStreamRef.current.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStreamRef.current);
        });

        // Set up event listeners
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // Send the local ICE candidate to the remote peer
                socket.emit('add-ice-candidate', {
                    candidate: event.candidate,
                    type: 'sender',
                    roomId: room,
                });
            }
        };

        peerConnection.onnegotiationneeded = async () => {
            // Create an offer and set it as the local description
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            // Send the offer to the remote peer
            socket.emit('offer', {
                sdp: peerConnection.localDescription,
                roomId: room,
            });
        };

        peerConnection.ontrack = (event) => {
            const [remoteVideoTrack, remoteAudioTrack] = event.streams[0].getTracks();
            remoteVideoTrackRef.current = remoteVideoTrack;
            remoteAudioTrackRef.current = remoteAudioTrack;

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Send an offer to the remote peer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('offer', {
            sdp: peerConnection.localDescription,
            roomId: room,
        });

        // Save the PeerConnection reference
        peerConnectionRef.current = peerConnection;
    };

    const cleanCall = async () => {
        // Close and clean up PeerConnection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Clean up local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        // Clean up remote stream
        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach((track) => track.stop());
            remoteStreamRef.current = null;
        }

        // Reset state
        setStrangerDisconnectedMessageDiv(false);
        setIsFindingPair(false);
        setHasPaired(false);
        setRoom('');
        setReceiver('');
        setStrangerGender('');
    };

    const handleFindNew = async () => {
        if (socket) {
            await cleanCall();
            setIsFindingPair(true);
            setStrangerDisconnectedMessageDiv(false);
            socket.emit('findNewPair', {
                userEmail: userDetails?.email,
                userGender: userDetails?.gender,
                userCollege: userDetails?.college,
                preferredGender: filters.strangerGender,
                preferredCollege: filters.college,
                pageType: 'videocall',
            });

            const timeout = 10000;
            setTimeout(() => {
                setIsFindingPair(false);
            }, timeout);
        }
    };

    return (
        <div className={styles.mainC}>
            <div className={styles.filterPos}>
                <FilterOptions
                    filters={filters}
                    setFilters={setFilters}
                    userCollege={userDetails?.college}
                    userGender={userDetails?.gender}
                />
            </div>
            {usersOnline && <div>Users Online: {usersOnline}</div>}
            {strangerDisconnectedMessageDiv && hasPaired && <div>Stranger disconnected</div>}

            <div style={{ display: 'grid', gap: '2rem' }}>
                <video ref={localVideoRef} autoPlay muted playsInline style={{ backgroundColor: 'black' }} />
                {hasPaired && <video ref={remoteVideoRef} autoPlay style={{ backgroundColor: 'black' }} />}
            </div>

            <VideoCallControls
                isFindingPair={isFindingPair}
                handleFindNewButton={handleFindNew}
                // handleToggleMute={handleToggleMute}
                isMuted={isMuted}
                isPartnerMuted={isPartnerMuted}
            // handleTogglePartnerMute={handleTogglePartnerMute}
            />
            <CustomSnackbar
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                color={snackbarColor}
            />
        </div>
    );
};

export default VideoCall;
