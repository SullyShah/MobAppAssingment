import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './components/Login';
import SignupScreen from './components/Signup';
import AddContactsScreen from './components/AddContact';
import BlockedScreen from './components/BlockList';
import ChatScreen from './components/ChatList';
import ContactScreen from './components/ContactList';
import DeleteContactScreen from './components/DeleteContact';
import AddToChatScreen from './components/AddToChat';
import NewChatScreen from './components/NewChat';
import ProfileScreen from './components/UserProfile';
import EditProfileScreen from './components/EditProfile';
import ManageContactScreen from './components/ManageContacts';
import CameraScreen1 from './components/Camera';
import SendMessageScreen from './components/SendMessage';
import SingleChatScreen from './components/SingleChat';
import UpdateChatScreen from './components/UpdateChat';
import EditChatScreen from './components/EditChat';
import DraftMessageScreen from './components/DraftMessage';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ContactStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ContactList" component={ContactScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddContact" component={AddContactsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeleteContact" component={DeleteContactScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ManageContacts" component={ManageContactScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BlockList" component={BlockedScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatList" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NewChat" component={NewChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SendMessage" component={SendMessageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddToChat" component={AddToChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SingleChat" component={SingleChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="UpdateChat" component={UpdateChatScreen} options={{ title: 'Edit Chat' }} />
      <Stack.Screen name="EditChat" component={EditChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DraftMessage" component={DraftMessageScreen} options={{ headerShown: false }} />

    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Camera" component={CameraScreen1} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Contacts" component={ContactStack} options={{ headerShown: false }} />
      <Tab.Screen name="Chats" component={ChatStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
