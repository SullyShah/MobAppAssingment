import React, { Component } from 'react';
import { Text, View, TextInput, Button, AsyncStorage } from 'react-native';

class SendMessageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      chat_id: null,
      error: null,
    };
  }

  async SendMessage(chatId, message) {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (response.status === 200) {
        console.log('Message sent');
      } else if (response.status === 400) {
        console.log('Bad Request');
      } else if (response.status === 401) {
        console.log('Unauthorised');
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

  handleMessageChange = (text) => {
    this.setState({ message: text });
  };

  handleSendMessage = () => {
    this.SendMessage(this.state.chatId, this.state.message);
    this.setState({ message: '' }); 
  };

  render() {
    const { message } = this.state;

    return (
      <View>
        <TextInput
          value={message}
          onChangeText={this.handleMessageChange}
          placeholder="Type your message here..."
        />
        <Button
          title="Send Message"
          onPress={this.handleSendMessage}
        />
      </View>
    );
  }
}

export default SendMessageScreen;
