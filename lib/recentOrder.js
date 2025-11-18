import * as SecureStore from 'expo-secure-store';

const EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

export const saveRecentOrder = async (documentId) => {
  try {
    const payload = { id: documentId, createdAt: Date.now() };
    await SecureStore.setItemAsync('recentOrderData', JSON.stringify(payload));
    console.log('💾 Saved recentOrderData:', payload);
  } catch (error) {
    console.error('❌ Failed to save recentOrderData:', error);
  }
};

export const checkRecentOrderExpiration = async () => {
  try {
    const data = await SecureStore.getItemAsync('recentOrderData');
    if (!data) return null;

    const parsed = JSON.parse(data);
    const age = Date.now() - parsed.createdAt;

    if (age > EXPIRATION_MS) {
      console.log('🧹 recentOrderData expired — deleting');
      await SecureStore.deleteItemAsync('recentOrderData');
      return null;
    }

    return parsed.id;
  } catch (error) {
    console.error('⚠️ Error checking expiration:', error);
    return null;
  }
};
