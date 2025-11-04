import { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  type User,
  type UserRole,
  type UserProfile
} from '../lib/firebase';
import { getUserRole } from '../lib/setupUsers';
import { getDefaultRoute, hasPermission } from '../lib/roles';

interface Agency {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  subscription_tier: string;
  subscription_status: string;
  user_id: string | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  agency: Agency | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, agencyData: Omit<Agency, 'id' | 'user_id'>) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  getDefaultRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
        await fetchAgency(firebaseUser.uid);
      } else {
        setUserProfile(null);
        setAgency(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAgency = async (userId: string) => {
    try {
      const agenciesRef = collection(db, 'agencies');
      const q = query(agenciesRef, where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setAgency({ id: doc.id, ...doc.data() } as Agency);
      } else {
        setAgency(null);
      }
    } catch (error) {
      console.error('Error fetching agency:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await getUserRole(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  const signUp = async (email: string, password: string, agencyData: Omit<Agency, 'id' | 'user_id'>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        role: 'agency' as UserRole,
        displayName: agencyData.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create agency record
      const agencyDocRef = doc(collection(db, 'agencies'));
      await setDoc(agencyDocRef, {
        ...agencyData,
        user_id: user.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    return hasPermission(userProfile.role, permission as any);
  };

  const getUserDefaultRoute = (): string => {
    if (!userProfile) return '/';
    return getDefaultRoute(userProfile.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      agency,
      loading,
      signIn,
      signUp,
      signOut,
      hasPermission: checkPermission,
      getDefaultRoute: getUserDefaultRoute
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
