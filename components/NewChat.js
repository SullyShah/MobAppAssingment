import React, { Component } from 'react';
import { TextInput, Button, Alert, View, Modal, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NewChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newChatName: '',
      modalVisible: false,
      modalTitle: '',
      modalMessage: '',
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
        this.props.navigation.navigate('Chat', {
          chat_id: chatDetails.id,
          chatDetails: chatDetails
        });
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
          visible={modalVisible}
          onRequestClose={this.hideModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <Button title="Close" onPress={this.hideModal} />
              <Button title="Back" onPress={() => this.props.navigation.goBack()} />

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
    backgroundColor: '#f5f5f5',
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
//MODAL IS NOT WORKING !!!!!!!!!!!!!!!!!!!!!!