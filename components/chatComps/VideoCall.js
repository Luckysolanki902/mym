import React, { useRef, useEffect } from 'react';

const VideoCall = ({ myStream, partnerStream }) => {
  const myVideoRef = useRef();
  const partnerVideoRef = useRef();

  useEffect(() => {
    if (myStream && myVideoRef.current) {
      myVideoRef.current.srcObject = myStream;
    }

    if (partnerStream && partnerVideoRef.current) {
      partnerVideoRef.current.srcObject = partnerStream;
    }
  }, [myStream, partnerStream]);

  return (
    <div>
      <video ref={myVideoRef} autoPlay muted />
      <video ref={partnerVideoRef} autoPlay />
    </div>
  );
};

export default VideoCall;
