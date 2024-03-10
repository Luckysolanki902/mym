import React, { useEffect, useRef, useState } from 'react';
import FilterOptions from '@/components/chatComps/FilterOptions';
import styles from '../componentStyles/textchat.module.css';
import CustomSnackbar from '../commonComps/Snackbar';
import VideoCallControls from '../videoCallComps/VideoCallControls';
import { io } from 'socket.io-client';

const VideoCall = ({ userDetails }) => {
  const socketRef = useRef(null);
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

  const peerConnectionRef = useRef(null);

  const serverUrl = 'https://hostedmymserver.onrender.com';
  // const serverUrl = 'http://localhost:1000'

  const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];

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

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      let newSocket = socketRef.current;
      try {
        if (!newSocket) {
          newSocket = io(serverUrl, { query: { pageType: 'videocall' } });
          socketRef.current = newSocket;
        }
      } catch (error) {
        console.error('Error creating socket:', error.message);
      }

      newSocket.on('connect', () => {
        console.log('Connected to server');
        handleIdentify(newSocket);
      });

      newSocket.on('roundedUsersCount', (count) => {
        console.log('Online users in this category:', count);
        setUsersOnline(count);
      });

      newSocket.on('pairingSuccess', (data) => {
        handlePairingSuccess(data);
      });

      newSocket.on('pairDisconnected', () => {
        console.log('Partner disconnected');
        handlePairDisconnected();
      });

      newSocket.on('disconnect', () => {
        socketRef.current = null;
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      newSocket.on('offer', (data) => {
        handleOffer(data);
      });

      newSocket.on('add-ice-candidate', (data) => {
        handleAddIceCandidate(data);
      });

    } catch (error) {
      console.error('Error getting media permissions:', error.message);
    }
  };

  useEffect(() => {
    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
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
      console.log('Connected');
      setStrangerDisconnectedMessageDiv(false);
      setIsFindingPair(false);

      const { roomId, strangerGender, stranger } = data;
      console.log('Stranger:', stranger);
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
    console.log('Debug 1');
  
    if (!stranger) return;
  
    // Create PeerConnection with unified plan SDP semantics
    const peerConnection = new RTCPeerConnection({ iceServers, sdpSemantics: 'unified-plan' });
  
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStreamRef.current);
    });
  
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log('Debug 3');
        try {
          socketRef.current.emit('add-ice-candidate', {
            candidate: event.candidate,
            type: 'sender',
            roomId: room,
          });
        } catch (error) {
          console.error('Error sending ICE candidate:', error.message);
        }
      }
    };
  
    peerConnection.onnegotiationneeded = async () => {
      try {
        console.log('Debug 6');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
  
        if (socketRef.current) {
          console.log('Debug 7');
          socketRef.current.emit('offer', {
            sdp: peerConnection.localDescription,
            roomId: room,
          });
        }
      } catch (error) {
        console.error('Error creating and sending offer:', error.message);
      }
    };
  
    try {
      console.log('Debug 8');
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
  
      if (socketRef.current) {
        socketRef.current.emit('offer', {
          sdp: peerConnection.localDescription,
          roomId: room,
        });
      }
  
      peerConnectionRef.current = peerConnection;
    } catch (error) {
      console.error('Error creating and sending offer:', error.message);
    }
  };
  

  const handleOffer = async (data) => {
    console.log('Debug 8');
    const { sdp, roomId } = data;
    const remoteDescription = new RTCSessionDescription(sdp);

    try {
      await peerConnectionRef.current.setRemoteDescription(remoteDescription);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socketRef.current.emit('answer', {
        sdp: peerConnectionRef.current.localDescription,
        roomId: room,
      });
    } catch (error) {
      console.error('Error handling offer:', error.message);
    }
  };

  const handleAddIceCandidate = async (data) => {
    console.log('Debug 9');
    const { candidate, type } = data;

    try {
      if (type === 'sender') {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } else {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error.message);
    }
  };

  const cleanCall = async () => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (error) {
        console.error('Error closing PeerConnection:', error.message);
      }
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (error) {
          console.error('Error stopping local track:', error.message);
        }
      });
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (error) {
          console.error('Error stopping remote track:', error.message);
        }
      });
      remoteStreamRef.current = null;
    }

    console.log('Debug 10');

    setStrangerDisconnectedMessageDiv(false);
    setIsFindingPair(false);
    setHasPaired(false);
    setRoom('');
    setReceiver('');
    setStrangerGender('');
  };

  const handleFindNew = async () => {
    if (socketRef.current) {
      await cleanCall();
      setIsFindingPair(true);
      setStrangerDisconnectedMessageDiv(false);
      try {
        socketRef.current.emit('findNewPair', {
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
      } catch (error) {
        console.error('Error emitting findNewPair event:', error.message);
        setIsFindingPair(false);
      }
    }
  };

  useEffect(() => {
    console.log('Remote video ref:', remoteVideoRef);
  }, [remoteVideoRef]);

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
        <video ref={localVideoRef} autoPlay muted playsInline />
        {hasPaired && <video ref={remoteVideoRef} autoPlay />}
      </div>

      <VideoCallControls
        isFindingPair={isFindingPair}
        handleFindNewButton={handleFindNew}
        isMuted={isMuted}
        isPartnerMuted={isPartnerMuted}
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
