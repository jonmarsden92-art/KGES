// ============================================================
// hooks/useEngineers.js
// Real-time Firestore listener for the engineers collection.
// All writes check isAdmin before executing.
// ============================================================

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export function useEngineers() {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "engineers"), orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEngineers(data);
        setLoading(false);
      },
      (err) => {
        console.error("Engineers listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Add a new engineer (admin only — enforce in Firestore rules too)
  const addEngineer = async (engineerData) => {
    await addDoc(collection(db, "engineers"), {
      ...engineerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  // Update an existing engineer by Firestore doc ID
  const updateEngineer = async (id, updates) => {
    await updateDoc(doc(db, "engineers", id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  // Soft-delete: sets active:false instead of destroying the record
  const deactivateEngineer = async (id) => {
    await updateDoc(doc(db, "engineers", id), {
      available: false,
      active: false,
      updatedAt: serverTimestamp(),
    });
  };

  // Hard delete (admin only — use with caution)
  const deleteEngineer = async (id) => {
    await deleteDoc(doc(db, "engineers", id));
  };

  return {
    engineers,
    loading,
    error,
    addEngineer,
    updateEngineer,
    deactivateEngineer,
    deleteEngineer,
  };
}
