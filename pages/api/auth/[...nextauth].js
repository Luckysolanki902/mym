import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/firebase';

export const authOptions = {
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials) {
return await signInWithEmailAndPassword(auth, credentials.email || '', credentials.password || '').then(userCredentials=>{
  if(userCredentials.user){
    return userCredentials.user
  }
  return null
}).catch(error=>console.log(error))
  

      },
    }),
  ],
};

export default NextAuth(authOptions);
