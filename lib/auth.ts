import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { users } from "./db/schema";
import { findUserByEmail } from "./db/users";
import bcrypt from "bcryptjs";
import { isEmailAllowed } from "./allowed-emails";
import { normalizeEmail } from "./validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = normalizeEmail(credentials.email as string);
        const password = credentials.password as string;

        // Find user by email
        const user = await findUserByEmail(email);

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign in
      if (account?.provider === "google") {
        if (!user.email) return false;
        const email = normalizeEmail(user.email);

        // Check if user exists
        const existingUser = await findUserByEmail(email);

        if (!existingUser) {
          // Check if email is in the allowed list before creating new user
          if (!isEmailAllowed(email)) {
            return false; // Block sign-in for non-whitelisted emails
          }

          // Create new user for Google OAuth
          await db.insert(users).values({
            name: (user.name?.trim() || "Google User").slice(0, 60),
            email: email,
            password: null, // No password for OAuth users
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        // For credentials login, sub is already the user ID
        // For OAuth, we need to look up the user
        if (token.email) {
          const user = await findUserByEmail(token.email as string);

          if (user) {
            session.user.id = user.id.toString();
            session.user.name = user.name;
            session.user.email = user.email || '';
          }
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
