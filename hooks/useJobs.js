// ============================================================
// hooks/useJobs.js
// Real-time Firestore listener for the jobs collection.
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
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen to all non-archived jobs, ordered by start date
    const q = query(
      collection(db, "jobs"),
      where("archived", "==", false),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobs(data);
        setLoading(false);
      },
      (err) => {
        console.error("Jobs listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addJob = async (jobData) => {
    await addDoc(collection(db, "jobs"), {
      ...jobData,
      archived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateJob = async (id, updates) => {
    await updateDoc(doc(db, "jobs", id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  // Archive instead of delete — preserves history
  const archiveJob = async (id) => {
    await updateDoc(doc(db, "jobs", id), {
      archived: true,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteJob = async (id) => {
    await deleteDoc(doc(db, "jobs", id));
  };

  return { jobs, loading, error, addJob, updateJob, archiveJob, deleteJob };
}
