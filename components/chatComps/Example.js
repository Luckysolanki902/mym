// pages/chat.js
import { useEffect, useRef, useState } from 'react';
import { Container, Paper, TextField, Button, List, ListItem, ListItemText } from '@mui/material';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      setMessages([{ id: messages.length, text: newMessage }, ...messages]);
      setNewMessage('');
    }
  };

  return (
    <Container>
      <Paper elevation={3} style={{ height: '80vh', overflowY: 'scroll', display: 'flex', flexDirection: 'column-reverse' }}>
        <List>
          {messages.map((message) => (
            <ListItem key={message.id}>
              <ListItemText>{message.text}</ListItemText>
            </ListItem>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </Paper>
      <TextField
        label="Type a message"
        variant="outlined"
        fullWidth
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSendMessage}>
        Send
      </Button>
    </Container>
  );
};

export default Chat;
