import { db, collection, addDoc, serverTimestamp } from './firebase';

export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Try to write a test document
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Firebase connection test',
      timestamp: serverTimestamp()
    });

    console.log('✅ Firebase connected successfully! Document ID:', testDoc.id);
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};