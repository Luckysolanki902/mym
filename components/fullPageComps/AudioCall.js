import React, { useEffect, useRef, useState } from 'react';
import FilterOptions from '@/components/chatComps/FilterOptions';
import styles from '../componentStyles/textchat.module.css';
import CustomSnackbar from '../commonComps/Snackbar';
import AudioCallControls from '../audioCallComps/AudioCallControls';
import { io } from 'socket.io-client';

const AudioCall = ({ userDetails }) => {
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

    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const audioRef = useRef(null);

    const localAudioTrackRef = useRef(null);
    const remoteAudioTrackRef = useRef(null);

    const agora = useRef(null);
    const clientRef = useRef(null);


    const [isPartnerMuted, setIsPartnerMuted] = useState(false)
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                agora.current = await import('agora-rtc-sdk-ng');
                console.log('AgoraRTC imported successfully');
            } catch (error) {
                console.error('Error importing AgoraRTC:', error);
            }
        })();
    }, []);

    const handleTogglePartnerMute = () => {
        // Use remoteAudioTrackRef to toggle partner mute
        if (remoteAudioTrackRef.current) {
            remoteAudioTrackRef.current.setVolume(!isPartnerMuted ? 0 : 1000);
        }
        setIsPartnerMuted(!isPartnerMuted);
    }

    const handleToggleMute = () => {
        // Use localAudioTrackRef to toggle local mute
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.setMuted(!isMuted);
            console.log('isMuted:', isMuted);
        }
        setIsMuted(!isMuted);

    };

    const serverUrl = 'https://hostedmymserver.onrender.com'
    // const serverUrl = 'http://localhost:1000'

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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            console.log('Successfully obtained local stream:', stream);
            let newSocket
            try {
                if (socket === null || !socket || socket === undefined) {
                    newSocket = io(serverUrl, { query: { pageType: 'audiocall' } });

                    setSocket(newSocket)
                } else {
                    newSocket = socket
                }
            } catch (error) {
                console.log('error setting newsocket', error)
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
            console.error('Error getting audio permissions:', error);
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
                pageType: 'audiocall',
            });
        }
    }

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
            setSnackbarMessage(snackbarMessage)
            joinCall(stranger, roomId);
            setHasPaired(true);
        }
    };

    const handlePairDisconnected = () => {
        console.log('Partner disconnected');
        setStrangerDisconnectedMessageDiv(true);
        cleanCall();
        setHasPaired(false);
    }

    const joinCall = async (stranger, room) => {
        console.log(stranger, agora.current);

        if (!stranger || !agora.current) return;

        const client = agora.current.createClient({ codec: 'vp8', mode: 'rtc' });
        clientRef.current = client;
        client.on('user-published', async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            remoteAudioTrackRef.current = user.audioTrack;
            if (audioRef.current && remoteAudioTrackRef.current) {
                audioRef.current.srcObject = remoteAudioTrackRef.current.play();
            }
        });
        await client.join('bcbdc5c2ee414020ad8e3881ade6ff9a', room, null, null);
        // Convert localStream to an array of tracks
        const localAudioTrack = await agora.current.createMicrophoneAudioTrack();
        localAudioTrackRef.current = localAudioTrack;
        await client.publish([localAudioTrackRef.current]);
        setSnackbarOpen(true);
    };
    const cleanCall = async () => {
        if (clientRef.current && clientRef.current != null) {
            await clientRef.current.leave(() => {
                console.log('User left the channel');
            });
        }
        localStreamRef.current = null;
        remoteStreamRef.current = null;
        clientRef.current = null;
    };

    const handleFindNew = async () => {
        if (socket) {
            await cleanCall()
            setHasPaired(false);
            setIsFindingPair(true);
            setStrangerDisconnectedMessageDiv(false);
            socket.emit('findNewPair', {
                userEmail: userDetails?.email,
                userGender: userDetails?.gender,
                userCollege: userDetails?.college,
                preferredGender: filters.strangerGender,
                preferredCollege: filters.college,
                pageType: 'audiocall',
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

            <audio ref={audioRef} autoPlay />

            <AudioCallControls
                isFindingPair={isFindingPair}
                handleFindNewButton={handleFindNew}
                handleToggleMute={handleToggleMute}
                isMuted={isMuted}
                isPartnerMuted={isPartnerMuted}
                handleTogglePartnerMute={handleTogglePartnerMute}
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

export default AudioCall
