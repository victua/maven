import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhA5P6lAvos_2aHdrtxTzcTmkhUmR2x20",
  authDomain: "gomavenke.firebaseapp.com",
  projectId: "gomavenke",
  storageBucket: "gomavenke.firebasestorage.app",
  messagingSenderId: "451094290523",
  appId: "1:451094290523:web:a1bc31c6bae1c056739f7e",
  measurementId: "G-E15JLFQ514"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  app,
  analytics,
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
  serverTimestamp
};

export type { User };

export type UserRole = 'admin' | 'agency' | 'talent' | 'team';

export type UserProfile = {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Database = {
  users: {
    uid: string;
    email: string;
    role: UserRole;
    displayName?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  agencies: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    subscription_tier: string;
    subscription_status: string;
    user_id?: string | null;
    created_at?: Date | null;
    updated_at?: Date | null;
  };
  hiring_requests: {
    id?: string;
    agency_id: string;
    job_title: string;
    quantity: number;
    destination_country: string;
    requirements: string;
    salary_range: string;
    status: string;
    deadline: string;
    created_at?: Date | null;
    updated_at?: Date | null;
  };
  placements: {
    id?: string;
    hiring_request_id: string;
    candidate_id: string;
    agency_id: string;
    status: string;
    placement_fee?: number | null;
    placed_at?: Date | null;
    created_at?: Date | null;
  };
};