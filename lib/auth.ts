import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Auth: missing credentials')
            return null
          }

          console.log('🔐 Auth: attempting login for', credentials.email)

          await connectDB()

          const user = await User.findOne({
            email: credentials.email.toLowerCase().trim(),
            isActive: true,
          })
            .populate('church', 'name')
            .populate('district', 'name')
            .populate('province', 'name')
            .lean()

          if (!user) {
            console.log('❌ Auth: user not found:', credentials.email)
            return null
          }

          console.log('✅ Auth: user found, checking password...')

          const isValid = await bcrypt.compare(credentials.password, user.password)

          if (!isValid) {
            console.log('❌ Auth: wrong password for', credentials.email)
            return null
          }

          console.log('✅ Auth: login success for', credentials.email, '| role:', user.role)

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            churchId: (user.church as any)?._id?.toString() ?? null,
            churchName: (user.church as any)?.name ?? null,
            districtId: (user.district as any)?._id?.toString() ?? null,
            districtName: (user.district as any)?.name ?? null,
            provinceId: (user.province as any)?._id?.toString() ?? null,
            provinceName: (user.province as any)?.name ?? null,
          }
        } catch (error: any) {
          console.error('❌ Auth error:', error.message)
          throw new Error('Authentication failed: ' + error.message)
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.churchId = (user as any).churchId
        token.churchName = (user as any).churchName
        token.districtId = (user as any).districtId
        token.districtName = (user as any).districtName
        token.provinceId = (user as any).provinceId
        token.provinceName = (user as any).provinceName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).churchId = token.churchId
        ;(session.user as any).churchName = token.churchName
        ;(session.user as any).districtId = token.districtId
        ;(session.user as any).districtName = token.districtName
        ;(session.user as any).provinceId = token.provinceId
        ;(session.user as any).provinceName = token.provinceName
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
