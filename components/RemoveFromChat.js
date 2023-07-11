import React, { Component } from 'react';
import { Text, View, TextInput, Button, FlatList, AsyncStorage } from 'react-native';

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chats: [],
      chatDetails: null,
      messages: [],
      error: null,
      submitted: false,
      newChatUserId: '',
      newMessage: '',
    };
  }

  componentDidMount() {
    this.viewChats();
  }


  async RemoveUserFromChat(chatId, userId) {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/chats/${chatId}/users/${userId}', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorisation': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
  
      if (response.status === 200) {
          const chatDetails = await response.json();
          this.setState({ chatDetails: chatDetails });
      } else if (response.status === 401) {
          console.log('Unathorised');
          await AsyncStorage.removeItem('whatsthat_session_token');
          await AsyncStorage.removeItem('whatsthat_user_id');
          this.props.navigation.navigate('Login');
      } else if (response.status === 403) {
          console.log('Forbidden');
      } else if (response.status === 404) {
          console.log('Not Found');
      } else {
          throw 'Server Error';
      }
    } catch (error) {
      this.setState({ error: error });
    }
  }
}  