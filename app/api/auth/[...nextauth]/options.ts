import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { doc, getDoc, query, where, collection, getDocs, Firestore } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { compare } from "bcrypt";

// Firebase configuration (move this to a separate file if reused elsewhere)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AdminUser | null> {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username or email and password are required");
        }

        try {
          // Debug: Log to confirm db is valid
          console.log("Firestore db initialized:", db);

          // Try username lookup
          let adminRef = doc(db, "admins", credentials.username);
          let adminSnap = await getDoc(adminRef);
          let adminData;

          if (!adminSnap.exists()) {
            // Try email lookup
            const adminsQuery = query(
              collection(db, "admins"),
              where("email", "==", credentials.username)
            );
            const querySnapshot = await getDocs(adminsQuery);

            if (querySnapshot.empty) {
              throw new Error("Admin user not found");
            }

            adminSnap = querySnapshot.docs[0];
            adminData = adminSnap.data();
            credentials.username = adminSnap.id; // Update to document ID
          } else {
            adminData = adminSnap.data();
          }

          if (!adminData || !adminData.hashedPassword) {
            throw new Error("Admin data is incomplete or invalid");
          }

          const isValidPassword = await compare(
            credentials.password,
            adminData.hashedPassword
          );

          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          return {
            id: credentials.username,
            username: credentials.username,
            name: adminData.name || "Admin",
            email: adminData.email,
            role: adminData.role || "admin",
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error instanceof Error ? error : new Error("Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};