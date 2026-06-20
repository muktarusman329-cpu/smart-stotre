import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "./mongodb"
import { User } from "@/models"
import { checkRateLimit, resetRateLimit } from "./auth-rate-limit"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials')
          return null
        }

        // Rate limiting based on email
        const email = credentials.email as string
        const rateLimitResult = checkRateLimit(email, 5, 15 * 60 * 1000) // 5 attempts, 15 minutes
        
        console.log(`Rate limit check for ${email}: allowed=${rateLimitResult.allowed}, remaining=${rateLimitResult.remaining}`)
        
        if (!rateLimitResult.allowed) {
          console.error('Rate limit exceeded for email:', email)
          throw new Error('Too many login attempts. Please try again later.')
        }

        try {
          await connectDB()
          console.log('Database connected')

          const user = await User.findOne({ email: credentials.email as string }).select('+password')
          console.log('User found:', !!user)

          if (!user || !user.isActive) {
            console.error('User not found or inactive')
            return null
          }

          const isPasswordValid = await user.comparePassword(credentials.password as string)
          console.log('Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.error('Invalid password')
            return null
          }

          // Reset rate limit on successful login
          resetRateLimit(email)

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            branchId: user.branchId?.toString() || null,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.branchId = user.branchId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.branchId = token.branchId as string | null
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
})
