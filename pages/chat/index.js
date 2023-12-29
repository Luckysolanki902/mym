// Required modules
import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router';
import styles from '@/components/componentStyles/videochat.module.css';

const VideoChatPage = () => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socket = useRef(null);
  const router = useRouter();
  let sendChannel;
  let receiveChannel;

  const [textValue, setTextValue] = useState('');

  const handleChange = (event) => {
    const { value } = event.target;
    setTextValue(value);
    console.log('text is: ', textValue)
  };

  const sendData = () => {
    if (textValue.trim() !== '') {
      const newMessage = document.createElement('div');
      newMessage.className = `${styles.left} ${styles.message}`
      newMessage.textContent = textValue;

      messagesContainerRef.current.appendChild(newMessage);
      setTextValue('');
    }
  };

  function receiveChannelCallback(event) {
    console.log("Receive Channel Callback")
    receiveChannel = event.channel
    receiveChannel.onmessage = onReceiveChannelMessageCallback;
    receiveChannel.onopen = onReceiveChannelStateChange;
    receiveChannel.onclose = onReceiveChannelStateChange;

  }
  function onReceiveChannelMessageCallback(event) {
    console.log('received message')
    const newMessage = document.createElement('div');
    newMessage.className = `${styles.right} ${styles.message}`
    newMessage.textContent = event.data;

  }

  function onReceiveChannelStateChange() {
    const readystate = receiveChannel.readystate;
    console.log('Receive channel state is: ', readystate)
    if (readystate === "open") {
      console.log('Data channel ready state is open - onReceiveChannelStateChange')
    }
    else {
      console.log('Data channel ready state is not open - onReceiveChannelStateChange')

    }
  }
  const initializeSocket = useCallback(() => {
    socket.current = io('http://localhost:3001');

    let username = router.query.username;
    let remoteuser = router.query.remoteuser;

    if (username) {
      socket.current.emit('user connected', { displayname: username });
    }

    return () => {
      socket.current.disconnect();
    };
  }, [router.query.username, router.query.remoteuser]);

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  useEffect(() => {
    const enableVideo = async () => {
      try {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userMediaStream);
      } catch (err) {
        console.error('Error accessing camera/microphone:', err);
      }
    };
    enableVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          // Add more STUN servers if needed
        ],
      });

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      const remoteStream = new MediaStream();
      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
          remoteVideoRef.current.srcObject = remoteStream;
        });
      };

      remoteStream.oninactive = () => {
        remoteStream.getTracks().forEach((track) => {
          track.enabled = !track.enabled
        })

        peerConnection.close()
      }



      peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          socket.current.emit('candidateSentToUser', {
            username: router.query.username,
            remoteuser: router.query.remoteuser,
            iceCandidateData: event.candidate,
          });
        }
      };

      sendChannel = peerConnection.createDataChannel('sendDataChannel')
      sendChannel.onopen = () => {
        console.log("Data channel is now open and ready to use")
        onSendChannelStateChange()
      }
      peerConnection.ondatachannel = receiveChannelCallback;
      // sendChannel.onmessage=onSendChannelMessageCallback


      function onSendChannelStateChange() {
        const readystate = sendChannel.readystate;
        console.log('send channel state is: ', readystate)
        if (readystate === "open") {
          console.log('Data channel ready state is open - onSendChannelStateChange')
        }
        else {
          console.log('Data channel ready state is not open - onSendChannelStateChange')

        }
      }



      socket.current.on('ReceiveOffer', async (data) => {
        try {
          await peerConnection.setRemoteDescription(data.offer);

          const localDescription = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(localDescription);

          socket.current.emit('answerSentToUser1', {
            answer: localDescription,
            sender: data.remoteuser,
            receiver: data.username,
          });
        } catch (err) {
          console.error('Error handling received offer:', err);
        }
      });

      socket.current.on('ReceiveAnswer', async (data) => {
        try {
          await peerConnection.setRemoteDescription(data.answer);
        } catch (err) {
          console.error('Error handling received answer:', err);
        }
      });

      socket.current.on('candidateReceiver', async (data) => {
        try {
          if (peerConnection.signalingState !== 'closed') {
            await peerConnection.addIceCandidate(data.iceCandidateData);
          } else {
            console.error('Peer connection is closed. Cannot add ICE candidate.');
          }
        } catch (err) {
          console.error('Error handling received ice candidate:', err);
        }
      });


      // Create and send offer to remote user
      const createOffer = async () => {
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);

          socket.current.emit('offerSentToRemote', {
            username: router.query.username,
            remoteuser: router.query.remoteuser,
            offer: offer,
          });
        } catch (err) {
          console.error('Error creating and sending offer:', err);
        }
      };
      createOffer();

      return () => {
        // Clean up peer connection when unmounting
        peerConnection.close();
      };
    }
  }, [stream, router.query.username, router.query.remoteuser]);

  return (
    <div className={styles.videoChatContainer}>
      <div className={styles.sidebar}>
        <video ref={videoRef} className={styles.videoBox} id={styles.video1} autoPlay playsInline muted style={{ border: '1px solid red' }}></video>
        <video ref={remoteVideoRef} className={styles.videoBox} id={styles.video2} autoPlay playsInline muted style={{ border: '1px solid red' }}></video>

      </div>
      <div className={styles.messagesContainer}>
        {/* Empty space for messages */}
        <div className={styles.messages} ref={messagesContainerRef}></div>
        <div className={styles.inputContainer}>
          <div style={{ width: '100%', display: 'flex', marginTop: '2rem', alignItems: 'center', justifyContent: 'center', height: '2rem' }}>
            <button className={styles.nextButton}>next</button>
            <div className={styles.messageBox}>
              <textarea name="messageBox" id="messageBox" value={textValue} rows={3} onChange={handleChange} style={{ width: '100%' }}></textarea>
            </div>
            <button className={styles.sendButton} onClick={sendData}>send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChatPage;
