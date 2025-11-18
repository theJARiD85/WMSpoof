import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { databases } from '../lib/appwrite';
import { toast } from '../lib/toast';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 📱 Registers this device’s push token and saves it to Appwrite
export async function registerPushTokenForUser(userId: string) {
  try {
    if (!Device.isDevice) {
      console.log("❌ Must use physical device for push notifications");
      return;
    }

    // Ask for permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log("❌ Push permissions not granted");
      return;
    }

    // ✅ Properly await the token
    const tokenResponse = await Notifications.getDevicePushTokenAsync();
    const devicePushToken = tokenResponse.data;

    // Save it to Appwrite
    await databases.updateDocument('users', 'users', userId, {
      pushToken: devicePushToken,
    });


    return devicePushToken;
  } catch (err) {
    console.error("❌ Failed to register push token:", err);
    toast("Failed to register push token");
  }
}
