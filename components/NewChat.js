import React, { Component } from 'react';
import { TextInput, Button, View, Modal, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NewChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newChatName: '',
      modalVisible: false,
      modalTitle: '',
      modalMessage: '',
      chat_id: null, 
    };
  }

  ChatName = (text) => {
    this.setState({ newChatName: text });
  }

  showModal = (title, message) => {
    this.setState({
      modalVisible: true,
      modalTitle: title,
      modalMessage: message,
    });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  startConversation = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: this.state.newChatName }),
      });
      if (response.status === 201) {
        const chatDetails = await response.json();
        console.log("Chat Details: ", chatDetails);
        this.setState({ chat_id: chatDetails.chat_id }, () => { // Update this line
          console.log("Chat ID is set in state: ", this.state.chat_id);
          this.navigateToEditChat();
        }); // Store chat_id in state and navigate to update chat page
        this.showModal('Success', 'Chat created');
        return chatDetails;
      } else if (response.status === 400) {
        throw 'Bad Request';
      } else if (response.status === 401) {
        throw 'Unauthorised';
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      console.log("Error in startConversation: ", error);
      this.showModal('Error', error.toString());
    }
  }


  navigateToEditChat = () => {
    const chat_id = this.state.chat_id; // Extract the chat_id from the state
    console.log("Navigating to Edit Chat with ID: ", chat_id);
    if (chat_id) {
      this.setState({ modalVisible: false }); // Close the modal
      this.props.navigation.navigate('UpdateChat', { chat_id: chat_id });
    } else {
      console.log('Invalid chat id');
    }
  };
  

  createNewChat = async () => {
    try {
      console.log("Attempting to start chat...");
      await this.startConversation();
    } catch (error) {
      console.log("Failed to start chat: ", error);
      this.showModal('Error', error.toString());
    }
  };

  render() {
    const { newChatName, modalVisible, modalTitle, modalMessage } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create New Chat</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Chat Name"
          value={newChatName}
          onChangeText={this.ChatName}
        />
        <Button title="Create Chat" onPress={this.createNewChat} />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={this.hideModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <Button title="Close" onPress={this.hideModal} />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#EAF5E2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default NewChatScreen;
