import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './components/Login';
import SignupScreen from './components/Signup';
// import MainScreen from './components/Main';
import AddContactsScreen from './components/AddContact';
import BlockedScreen from './components/Block';
import ChatScreen from './components/Chat';
import ContactScreen from './components/Contacts';
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


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ContactStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Contacts" component={ContactScreen} options={{ headerShown: false }}  />
      <Stack.Screen name="AddContact" component={AddContactsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeleteContact" component={DeleteContactScreen}options={{ headerShown: false }}  />
      <Stack.Screen name="ManageContacts" component={ManageContactScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }}  />
      <Stack.Screen name="NewChat" component={NewChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SendMessage" component={SendMessageScreen} options={{ headerShown: false }}  />
      <Stack.Screen name="AddToChat" component={AddToChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SingleChat" component={SingleChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="UpdateChat" component={UpdateChatScreen} options={{ title: 'Edit Chat' }} />
      <Stack.Screen name="EditChat" component={EditChatScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}  />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }}  />
      <Stack.Screen name="Block" component={BlockedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Camera" component={CameraScreen1} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Main Tabs
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Contacts" component={ContactStack} options={{ headerShown: false }} />
      <Tab.Screen name="Chat" component={ChatStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

// Root Stack
function RootStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStackScreen />
    </NavigationContainer>
  );
}