import React, { useEffect } from 'react';
import { KeyboardAvoidingView } from 'react-native';
import { UserProvider } from './contexts/UserContext';
import * as ScreenCapture from 'expo-screen-capture';
import Router from './lib/Router';
import { enableScreens } from 'react-native-screens';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { databases, account } from './lib/appwrite';
import { Client, Messaging, Databases, ID } from "react-native-appwrite";

Notifications.addNotificationResponseReceivedListener(async response => {
  const data = response.notification.request.content.data;
  const { exitPassId, actionYes, actionNo } = data;

  if (actionYes === "respond_yes") {
    await databases.updateDocument("exits", "exit_passes", exitPassId, { status: "responded_yes" });
  } else if (actionNo === "respond_no") {
    await databases.updateDocument("exits", "exit_passes", exitPassId, { status: "responded_no" });
    // optional: trigger a separate Appwrite function for escalation
  }
});

export default function App() {
  enableScreens(true);

  return (
    <UserProvider>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior='height'enabled={false}>
        <Router />
      </ KeyboardAvoidingView>
    </UserProvider>
  )
};