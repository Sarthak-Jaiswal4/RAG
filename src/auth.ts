import axios from "axios"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import userModel, { User } from "./models/user.model"
import bcrypt from 'bcrypt'

// Check for required environment variables
const requiredEnvVars = {
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,
}

// Validate environment variables
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.warn(`Warning: ${key} is not set. Authentication may not work properly.`)
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
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
    }),
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: "email", type: 'text' },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        console.log("credentials", credentials)
        const email = credentials.identifier
        const password = credentials.password
        const baseURL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const safeUser = await axios.post(`${baseURL}/api/Login`, {
          password, email
        });
        console.log(safeUser.data)
        const user=safeUser.data.safeUser
        return user
      },
    }),
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
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET || "fallback-secret-for-development-only",
})