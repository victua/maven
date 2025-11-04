import {
  createUserWithEmailAndPassword,
  auth,
  db,
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  firebaseSignOut
} from './firebase';
import { SAMPLE_USERS } from './roles';
import { UserProfile } from './firebase';

export const createSampleUsers = async () => {
  console.log('🚀 Creating sample users...');
  const results = [];

  for (const userData of SAMPLE_USERS) {
    try {
      console.log(`📝 Processing user: ${userData.email}`);

      // Check if user already exists in users collection
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', userData.email));
      const existingUsers = await getDocs(userQuery);

      if (!existingUsers.empty) {
        console.log(`✅ User ${userData.email} already exists, skipping...`);
        results.push({ email: userData.email, status: 'exists', role: userData.role });
        continue;
      }

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;
      console.log(`✅ Created Firebase Auth user: ${user.uid}`);

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to users collection
      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Created Firestore profile for ${userData.email}`);

      // Create role-specific data
      if (userData.role === 'agency') {
        await setDoc(doc(collection(db, 'agencies')), {
          name: userData.displayName || 'Sample Agency',
          email: userData.email,
          phone: '+254700000000',
          country: 'Kenya',
          subscription_tier: 'pro',
          subscription_status: 'active',
          user_id: user.uid,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
        console.log(`✅ Created agency profile for ${userData.email}`);
      }

      console.log(`✅ Successfully created ${userData.email} with role: ${userData.role}`);
      results.push({ email: userData.email, status: 'created', role: userData.role, uid: user.uid });

      // Sign out after creating each user to avoid conflicts
      await firebaseSignOut(auth);
      console.log(`🔓 Signed out user: ${userData.email}`);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      console.error(`❌ Error creating user ${userData.email}:`, error);

      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ User ${userData.email} already exists in Auth`);
        results.push({ email: userData.email, status: 'exists', role: userData.role });
      } else {
        results.push({ email: userData.email, status: 'error', role: userData.role, error: error.message });
      }
    }
  }

  console.log('🎉 Sample users setup complete!');
  console.log('📋 Results:', results);
  return results;
};

export const getUserRole = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
    if (!userDoc.empty) {
      return userDoc.docs[0].data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};