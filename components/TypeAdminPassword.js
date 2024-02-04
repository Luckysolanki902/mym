import { useState } from 'react';
import { TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import styles from './componentStyles/admin.module.css';

const TypeAdminPassword = ({ onLogin }) => {
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/admin/security/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password1, password2 }),
      });

      const data = await response.json();
      if (data.success) {
        const { token } = data;
        console.log(token)
        localStorage.setItem('adminAuthToken', token);
        console.log('Logged in successfully');
        onLogin(); // Invoke the login function passed as a prop
      } else {
        setErrorMessage(data.message || 'Error granting admin access.');
      }
    } catch (error) {
      console.error('Error validating password:', error);
    }
  };

  const toggleShowPassword = (field) => {
    if (field === 'password1') {
      setShowPassword1(!showPassword1);
    } else {
      setShowPassword2(!showPassword2);
    }
  };

  return (
    <div style={{ padding: '2rem', width: '100vw', height: '100vh', display:'flex', flexDirection:'column', alignItems:'center' }}>
    <div className={styles.maddyCustom} style={{ margin: '0' }}>MYM</div>
    <div className={styles.adminPanel} style={{maxWidth:'40rem'}}>
      <h1 className={styles.heading}>Greetings, Admin</h1>
      <p className={styles.description}>Have a great day!</p>
      <form onSubmit={handleSubmit} className={styles.passwordForm}>
        <TextField
          label="Password 1"
          type={showPassword1 ? 'text' : 'password'}
          value={password1}
          autoComplete='new-password'

          onChange={(e) => setPassword1(e.target.value)}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => toggleShowPassword('password1')} edge="end">
                  {showPassword1 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Password 2"
          autoComplete='new-password'
          type={showPassword2 ? 'text' : 'password'}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => toggleShowPassword('password2')} edge="end">
                  {showPassword2 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        <Button variant="contained" color="primary" type="submit" className={styles.submitButton} style={{float:'right'}}>
          Submit
        </Button>
      </form>
      <style>
                {`
              html, body {
                background-color: #1a1a1a;
                color: #f0f0f0;
                font-family: Jost, sans-serif;
                margin: 0;
                height: 100%;
              }
            `}
            </style>
    </div>
    </div>
  );
};

export default TypeAdminPassword;
