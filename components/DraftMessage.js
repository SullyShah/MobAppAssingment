import React, { Component } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DraftMessageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draftMessage: '',
      chat_id: '',
    };
  }
  
  componentDidMount() {
    const { route } = this.props;
    const { chat_id } = route.params;
    this.setState({ chat_id });
    this.loadDraftMessage(chat_id);
  }

  loadDraftMessage = async (chat_id) => {
    try {
      const draftMessage = await AsyncStorage.getItem(`whatsthat_draft_message_${chat_id}`);
      if (draftMessage) {
        this.setState({ draftMessage });
      }
    } catch (error) {
      console.log('Error loading draft message:', error);
    }
  };

  handleDeleteDraft = async () => {
    const { chat_id } = this.state;
    try {
      await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
      this.setState({ draftMessage: '' });
      this.props.navigation.goBack();
    } catch (error) {
      console.log('Error deleting draft message:', error);
    }
  };

  handleSendDraft = async () => {
    const { navigation } = this.props;
    const { draftMessage, chat_id } = this.state;
    try {
      await this.SendMessage(chat_id, draftMessage);
      await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
      navigation.goBack();
    } catch (error) {
      console.log('Error sending draft message:', error);
    }
  };

  SendMessage = async (chat_id, message) => {
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
        await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
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
  };

  handleEditButton = async () => {
    const { draftMessage, chat_id } = this.state;
    try {
      await AsyncStorage.setItem(`whatsthat_draft_message_${chat_id}`, draftMessage);
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

  render() {
    const { draftMessage, isDraft } = this.state;
  
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={draftMessage}
          onChangeText={this.handleEditMessage}
        />
        {isDraft && (
          <Button title="Load Draft" onPress={this.handleLoadDraft} />
        )}
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
