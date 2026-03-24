// ============================================================
// hooks/useAuth.js
// Handles login, logout, and admin role detection via
// Firebase Custom Claims. Call seedAdmin() once from the
// Firebase Admin SDK (Node script) to grant your first admin.
// ============================================================

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

export function useAuth() {
  const [user, setUser] = useState(null);       // Firebase user object
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Force-refresh to get the latest custom claims (including admin flag)
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        setIsAdmin(tokenResult.claims.admin === true);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(friendlyAuthError(err.code));
      throw err;
    }
  };

  const logout = () => signOut(auth);

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  return { user, isAdmin, loading, error, login, logout, resetPassword };
}

// ============================================================
// Human-readable Firebase auth error messages
// ============================================================
function friendlyAuthError(code) {
  const map = {
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "That doesn't look like a valid email address.",
    "auth/too-many-requests": "Too many failed attempts. Please wait and try again.",
    "auth/user-disabled": "This account has been disabled. Contact your administrator.",
    "auth/network-request-failed": "Network error. Check your connection and retry.",
  };
  return map[code] ?? "An unexpected error occurred. Please try again.";
}

// ============================================================
// HOW TO GRANT ADMIN ROLE
// Run this once as a Node.js script using the Firebase Admin SDK.
// npm install firebase-admin
//
// const admin = require("firebase-admin");
// const serviceAccount = require("./serviceAccountKey.json");
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
//
// admin.auth().getUserByEmail("youradmin@email.com").then(user => {
//   return admin.auth().setCustomUserClaims(user.uid, { admin: true });
// }).then(() => {
//   console.log("Admin role granted.");
// });
// ============================================================
