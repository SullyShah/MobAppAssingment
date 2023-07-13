import React, { Component } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DraftMessageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draftMessage: '',
    };
  }

  componentDidMount() {
    this.loadDraftMessage();
  }

  loadDraftMessage = async () => {
    try {
      const draftMessage = await AsyncStorage.getItem('whatsthat_draft_message');
      if (draftMessage) {
        this.setState({ draftMessage });
      }
    } catch (error) {
      console.log('Error loading draft message:', error);
    }
  };

  handleDeleteDraft = async () => {
    try {
      await AsyncStorage.removeItem('whatsthat_draft_message');
      this.setState({ draftMessage: '' });
      this.props.navigation.goBack();
    } catch (error) {
      console.log('Error deleting draft message:', error);
    }
  };

  handleSendDraft = async () => {
    const { navigation, route } = this.props;
    const { draftMessage } = this.state;
    const chat_id = route.params.chat_id; // Make sure you pass chat_id when navigating to this screen
    try {
      await this.SendMessage(chat_id, draftMessage);
      await AsyncStorage.removeItem('whatsthat_draft_message');
      navigation.goBack();
    } catch (error) {
      console.log('Error sending draft message:', error);
    }
  };

  async SendMessage(chat_id, message) {
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
        const chatDetails = await response.json();
        await AsyncStorage.removeItem('whatsthat_draft_message');
        this.setState({
          chatDetails: chatDetails,
          messages: chatDetails.messages || [], // Update messages
        });
      } else if (response.status === 400) {
        console.log('Bad Request');
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

  handleEditButton = async () => {
    try {
      const { draftMessage } = this.state;
      await AsyncStorage.setItem('whatsthat_draft_message', draftMessage);
      this.props.navigation.goBack();
    } catch (error) {
      console.log('Error saving edited draft message:', error);
    }
  };

  handleCancel = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  handleEditMessage = (text) => {
    this.setState({ draftMessage: text });
  };

  sendDraftMessage = async () => {
    const { route } = this.props;
    const { chat_id, draftMessage } = route.params;
    
    // Use your function that sends the message. Here is a sample usage.
    await this.props.sendMessage(chat_id, draftMessage);
  };
  

  render() {
    const { draftMessage } = this.state;

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={draftMessage}
          onChangeText={this.handleEditMessage}
        />
        <Button title="Edit" onPress={this.handleEditButton} />
        <Button title="Send Draft" onPress={this.handleSendDraft} />
        <Button title="Delete Draft" onPress={this.handleDeleteDraft} />
        <Button title="Cancel" onPress={this.handleCancel} />
      </View>
    ); 
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
  },
});

export default DraftMessageScreen;
