import axios from "axios"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            async profile(profile) {
                console.log(profile);
                try {
                    const baseURL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                    await axios.post(`${baseURL}/api/CreateUserviaGoogle`, {
                        name: profile.name,
                        email: profile.email,
                        email_verified: profile.email_verified
                    });
                    console.log('New User via Google created');
                    return { ...profile };
                } catch (error) {
                    console.error('Error creating user via Google:', error);
                }
            },
        })
    ],
    callbacks: {
        jwt({ token, user }) {
          if (user) { // User is available during sign-in
            token.id = user.id
            token.email = user.email
            token.name = user.name
            token.isverified = user.isverified
          }
          return token
        },
        session({ session, token }) {
          session.user.id = token.id as string
          session.user.email = token.email as string
          session.user.name = token.name as string
          session.user.isverified = token.isverified as boolean
          return session
        },
    },
    session:{
        strategy:'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.AUTH_SECRET,
})