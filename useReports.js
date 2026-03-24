// ============================================================
// hooks/useReports.js
// Combines Firebase Storage (file bytes) with Firestore
// (metadata). Upload → Storage → write metadata doc → done.
// ============================================================

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebaseConfig";

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(null); // 0–100 or null

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("uploadedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReports(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Upload a File object from an <input type="file"> element.
  // Returns a Promise that resolves once both the Storage upload
  // and the Firestore metadata write are complete.
  const uploadReport = (file, uploadedByName) => {
    return new Promise((resolve, reject) => {
      const storagePath = `reports/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(pct);
        },
        (err) => {
          setUploadProgress(null);
          reject(err);
        },
        async () => {
          // Upload complete — get the public download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Write metadata to Firestore
          await addDoc(collection(db, "reports"), {
            name: file.name,
            size: formatBytes(file.size),
            downloadURL,
            storagePath,
            uploadedBy: uploadedByName,
            uploadedAt: serverTimestamp(),
          });

          setUploadProgress(null);
          resolve(downloadURL);
        }
      );
    });
  };

  // Delete from both Storage and Firestore
  const deleteReport = async (report) => {
    try {
      // Remove file from Storage
      const fileRef = ref(storage, report.storagePath);
      await deleteObject(fileRef);
    } catch (err) {
      // Storage object may already be gone — still remove the Firestore doc
      console.warn("Storage delete warning:", err.message);
    }
    await deleteDoc(doc(db, "reports", report.id));
  };

  return { reports, loading, uploadProgress, uploadReport, deleteReport };
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}
