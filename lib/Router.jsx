import React, { useState, useEffect } from 'react';
import { View} from 'react-native';
import * as Font from 'expo-font';
import Spark from '../assets/icons/Spark.svg';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useUser } from '../contexts/UserContext';
import LoginScreen from '../screens/LoginScreen';
import MainPage from '../screens/MainPage';
import UpdaterMainPage from '../screens/UpdaterMainPage';
import PurchaseHistory from '../screens/PurchaseHistory';
import PurchaseHistory2 from '../screens/PurchaseHistory2';
import SummaryScreen from '../screens/SummaryScreen';
import SummaryScreen2 from '../screens/SummaryScreen2';
import ReceiptScreen from '../screens/ReceiptScreen';
import ReceiptScreen2 from '../screens/ReceiptScreen2';
import ReceiptScreen3 from '../screens/ReceiptScreen3';
import ReceiptScreen4 from '../screens/ReceiptScreen4';
import ReceiptScreen5 from '../screens/ReceiptScreen5';
import ShopScreen from '../screens/ShopScreen';
import ItemsScreen from '../screens/ItemsScreen';
import AccountScreen from '../screens/AccountScreen';
import AccountScreen2 from '../screens/AccountScreen2';
import DetailsScreen from '../screens/DetailsScreen';
import DetailsScreen2 from '../screens/DetailsScreen2';
import BarcodeScanner from '../screens/BarcodeScanner';
import BarcodeScanner2 from '../screens/BarcodeScanner2';
import ManualSearchScreen from '../screens/ManualSearchScreen';
import ManualSearchScreen2 from '../screens/ManualSearchScreen2';
import { registerPushTokenForUser } from './notifications';
import * as Notifications from 'expo-notifications';
import { databases } from './appwrite';
import ExitConfirmModal from '../components/ExitConfirmModal';

Notifications.addNotificationResponseReceivedListener(async (response) => {
  const data = response.notification.request.content.data;
  const exitPassId = data.exitPassId;
  const action = data.actionYes || data.actionNo;

  if (!exitPassId) return;

  if (action === "respond_yes") {
    await databases.updateDocument("exits", "exit_passes", exitPassId, { status: "responded_yes" });
  } else if (action === "respond_no") {
    await databases.updateDocument("exits", "exit_passes", exitPassId, { status: "responded_no" });
  }
});

const Stack = createNativeStackNavigator();

export default function Router() {
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitPassId, setExitPassId] = useState(null);
  const { user, loading } = useUser();
  const [userId, setUserId] = useState(user ? user.$id : null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

    const loadFonts = async () => {
      await Font.loadAsync({
      EverydaySansRegular: require('../assets/fonts/EverydaySansRegular.otf'),
      EverydaySansMedium: require('../assets/fonts/EverydaySansMedium.otf'),
      EverydaySansBold: require('../assets/fonts/EverydaySansBold.otf'),
      EverydaySansBlack: require('../assets/fonts/EverydaySansBlack.otf'),
      EverydaySansBoldItalic: require('../assets/fonts/EverydaySansBoldItalic.otf'),
      EverydaySansBlackItalic: require('../assets/fonts/EverydaySansBlackItalic.otf'),
      NimbusMonoLBold: require('../assets/fonts/NimbusMonoLBold.otf'),
      NimbusMonoBold: require('../assets/fonts/NimbusMonoBold.ttf'),
    });
        setFontsLoaded(true);
      };

      useEffect(() => {
        loadFonts();
      }, []);
      
useEffect(() => {
  const id = user?.$id || user?.id || user?.userId;
  if (id) {
    const pushToken = registerPushTokenForUser(id);
    const storedPushToken  = SecureStore.getItemAsync('pushToken');
  }
}, [user]);

    useEffect(() => {
      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data.exitPassId) {
          setExitPassId(data.exitPassId);
          setShowExitModal(true);
        }
      });
      return () => subscription.remove();
    }, []);

    useEffect(() => {
      async function checkInitialNotification() {
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse?.notification?.request?.content?.data?.exitPassId) {
          const data = lastResponse.notification.request.content.data;
          setExitPassId(data.exitPassId);
          setShowExitModal(true);
        }
      }
      checkInitialNotification();
    }, []);


  if (loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0053e2' }}>
        <Spark width={widthPercentageToDP(30)} height={heightPercentageToDP(30)} />
        </View>
      );
    }
  
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          { user ? (
            <>
              <Stack.Screen name="ShopScreen" component={ShopScreen} />
              <Stack.Screen name="MainPage" component={MainPage} />
              <Stack.Screen name="UpdaterMainPage" component={UpdaterMainPage} />
              <Stack.Screen name="PurchaseHistory" component={PurchaseHistory} />
              <Stack.Screen name="PurchaseHistory2" component={PurchaseHistory2} />
              <Stack.Screen name="ItemsScreen" component={ItemsScreen} />
              <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
              <Stack.Screen name="DetailsScreen2" component={DetailsScreen2} />
              <Stack.Screen name="AccountScreen" component={AccountScreen} />
              <Stack.Screen name="AccountScreen2" component={AccountScreen2} />
              <Stack.Screen name="SummaryScreen" component={SummaryScreen} />
              <Stack.Screen name="SummaryScreen2" component={SummaryScreen2} />
              <Stack.Screen name="ReceiptScreen" component={ReceiptScreen} />
              <Stack.Screen name="ReceiptScreen2" component={ReceiptScreen2} />
              <Stack.Screen name="ReceiptScreen3" component={ReceiptScreen3} />
              <Stack.Screen name="ReceiptScreen4" component={ReceiptScreen4} />
              <Stack.Screen name="ReceiptScreen5" component={ReceiptScreen5} />
              <Stack.Screen name="BarcodeScanner" component={BarcodeScanner} />
              <Stack.Screen name="BarcodeScanner2" component={BarcodeScanner2} />
              <Stack.Screen name="ManualSearchScreen" component={ManualSearchScreen} />
              <Stack.Screen name="ManualSearchScreen2" component={ManualSearchScreen2} />
            </>
          ) : (
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <ExitConfirmModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        exitPassId={exitPassId}
      />
    </SafeAreaProvider>
    

  );
}