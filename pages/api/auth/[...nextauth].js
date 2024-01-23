import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/firebase';

export const authOptions = {
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials) {
        try {
          // Try to sign in the user
          const signInResult = await signInWithEmailAndPassword(
            auth,
            credentials.email || '',
            credentials.password || ''
          );
          if (signInResult.user) {
            // If signin is successful, return the user
            return signInResult.user;
          }

          // If signin fails, try to create a new user
          const createUserResult = await createUserWithEmailAndPassword(
            auth,
            credentials.email || '',
            credentials.password || ''
          );
          if (createUserResult.user) {
            // If user creation is successful, manually sign in the user
            await signInWithEmailAndPassword(
              auth,
              credentials.email || '',
              credentials.password || ''
            );

            // Return the user
            return createUserResult.user;
          }
          return null;
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],
};

export default NextAuth(authOptions);
