import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { authAPI } from "@/lib/api"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        try {
          // Use your existing auth API
          const data = await authAPI.signIn(credentials.username, credentials.password)
          return {
            id: data.id,
            name: data.username,
            email: data.email,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth',
    signOut: '/auth',
    error: '/auth',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // When user signs in with Google, we'll try to create/update the user in our database
          const response = await authAPI.googleSignIn({
            email: user.email!,
            name: user.name!,
            id: user.id!,
          });
          return true;
        } catch (error) {
          console.error('Error saving Google user:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      return { ...token, ...user }
    },
    async session({ session, token }) {
      session.user = token as any
      return session
    },
  },
})

export { handler as GET, handler as POST } 