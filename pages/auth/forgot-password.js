import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "@/firebase";
export default function ForgotPassword() {
    const [email, setEmail] = useState('');

    const resetEmail = () => {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                // Password reset email sent successfully
                console.log("Password reset email sent to your email");
                // You might want to display a success message to the user here
            })
            .catch((error) => {
                // Handle errors in sending password reset email
                console.error("Error sending password reset email:", error);
                // You might want to display an error message to the user here
            });
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        // Here, you can call the function to reset the email
        resetEmail();
        // You can add further logic if needed after submitting the form
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}>
                <h1>Forgot Password</h1>
                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            margin: '10px',
                            padding: '8px',
                            width: '300px',
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            margin: '10px',
                            padding: '8px 16px',
                            backgroundColor: 'blue',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                        disabled={!email}
                    >
                        Send reset link
                    </button>
                </form>
            </div>
        </div>
    );
}
