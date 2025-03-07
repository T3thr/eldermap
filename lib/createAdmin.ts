import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { hash } from "bcrypt";

// Firebase configuration (same as in your firebase-config.ts)
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface AdminData {
  username: string;
  email: string;
  name: string;
  password: string;
}

async function createAdmin({ username, email, name, password }: AdminData) {
  try {
    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create admin document with username as document ID
    await setDoc(doc(db, "admins", username), {
      username,
      email,
      name,
      hashedPassword,
    });

    console.log(`Admin ${username} created successfully`);
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
}

// Example usage - directly calling the function
const adminData: AdminData = {
  username: "admin1",
  email: "admin1@example.com",
  name: "Admin One",
  password: "securepassword123",
};

createAdmin(adminData)
  .then(() => process.exit(0))  // Exit successfully
  .catch(() => process.exit(1));  // Exit with error
