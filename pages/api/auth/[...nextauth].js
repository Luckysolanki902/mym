import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';

export const authOptions = {
    pages: {
        signIn: '/signin'
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {},
            async authorize(credentials) {
                try {
                    const userCredential = await signInWithEmailAndPassword(auth, credentials.email || '', credentials.password || '');
                    if (userCredential.user) {
                        return userCredential.user;
                    }
                    return null;
                } catch (error) {
                    console.log(error);
                    return null;
                }
            }
        })
    ]
};

export default NextAuth(authOptions);
