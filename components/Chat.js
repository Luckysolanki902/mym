import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const Chat = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [findingUser, setFindingUser] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      return; // Don't proceed if session status is still loading
    }

    if (!session) {
      router.replace("/signin");
      return; // Don't proceed if the user is not signed in
    }

    const fetchUsersEmails = async () => {
      try {
        const response = await fetch('/api/getmails');
        const data = await response.json();

        if (response.ok) {
          const emails = data;
          emails.forEach((email) => {
            socket.emit('email', email);
          });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsersEmails();

    const handleMessage = (data) => {
      setMessages(prevMessages => [...prevMessages, data]);
    };

    const handleOnlineUsers = (count) => {
      setOnlineUsers(count);
    };

    const handlePairedUsers = ({ user }) => {
      const currentUser = socket.id;
      console.log(currentUser)
      const isPairedUser = user.socketId === currentUser;

      if (isPairedUser) {
        setFindingUser(false);
      }
    };

    socket.on('message', handleMessage);
    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('pairedUsers', handlePairedUsers);

    return () => {
      socket.off('message', handleMessage);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('pairedUsers', handlePairedUsers);
      socket.disconnect();
    };
  }, [session, status, router]);



  if (status === "loading" || !session) {
    return <p>Loading...</p>;
  }

  return (
    <div>
    
    </div>
  );
};

export default Chat;
