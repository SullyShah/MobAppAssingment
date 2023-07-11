import React, { Component } from 'react';
import { Text, View, TextInput, Button, FlatList, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class UpdateChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chats: [],
      messages: [],
      error: null,
      submitted: false,
      newChatUserId: '',
      newMessage: '',
      chat_id: this.props.route.params.chat_id,
      chatDetails: this.props.route.params.chatDetails,
      newChatName: '',
      users: [],
      chat_name: '',
      modalVisible: false,
      modalTitle: '',
      modalMessage: '',
    };
  }

  componentDidMount() {
    this.fetchChatDetails();
  }

  navigateToAddToChat = () => {
    const { chat_id, chatDetails } = this.state;
    this.props.navigation.navigate('AddToChat', { chat_id, chatDetails });
  };

  navigateToChatPage = () => {
    this.props.navigation.navigate('Chat');
  };

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


  fetchChatDetails = async () => {
    try {
      const chat_id = this.state.chat_id;
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}`, {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
      if (response.status === 200) {
        const chatDetails = await response.json();
        console.log('chatDetails:', chatDetails);
        this.setState({
          chatDetails,
          newChatName: chatDetails.name || '',
          users: chatDetails.members || [],
        });

      } else if (response.status === 401) {
        console.log('Unauthorized');
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        this.props.navigation.navigate('Login');
      } else if (response.status === 403) {
        console.log('Forbidden');
      } else if (response.status === 404) {
        console.log('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      console.error(error);
      this.setState({ error: error.toString() });
    }
  };

  updatenewChatName = async () => {
    try {
      const { chat_id, newChatName } = this.state;
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        body: JSON.stringify({ name: newChatName }),
      });
      if (response.status === 200) {
        console.log('Chat name updated successfully');
        this.showModal('Success', 'Chat name updated successfully');
        this.navigateToChatPage();
      } else if (response.status === 400) {
        try {
          const responseData = await response.json();
          console.log('Bad Request:', responseData.message);
        } catch (error) {
          console.log('Bad Request: Invalid JSON');
        }
      } else if (response.status === 401) {
        console.log('Unauthorized');
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        this.props.navigation.navigate('Login');
      } else if (response.status === 403) {
        console.log('Forbidden');
      } else if (response.status === 404) {
        console.log('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      console.error(error);
      this.setState({ error: error.toString() });
    }
  };
  
  removeUserFromChat = async (user_id) => {
    try {
      const { chat_id } = this.state;
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/user/${user_id}`, {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
  
      if (response.status === 200) {
        console.log(`User with ID ${user_id} removed from the chat`);
        this.showModal('Success', `User with ID ${user_id} removed from the chat`);
        this.fetchChatDetails();
      } else if (response.status === 401) {
        console.log('Unauthorized');
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        this.props.navigation.navigate('Login');
      } else if (response.status === 403) {
        console.log('Forbidden');
      } else if (response.status === 404) {
        console.log('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      console.error(error);
      this.setState({ error: error.toString() });
    }
  };
  render() {
    const { newChatName, users, chat_id, modalVisible, modalTitle, modalMessage } = this.state;
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chat Name:</Text>
        <TextInput
          value={newChatName}
          onChangeText={(text) => this.setState({ newChatName: text })}
          style={styles.input}
        />
        <Button title="Update" onPress={this.updatenewChatName} />
  
        <Text style={styles.userTitle}>Users in Chat:</Text>
        {users && users.length > 0 ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.user_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <Text style={styles.userName}>{`${item.first_name} ${item.last_name}`}</Text>
                <Button title="Remove" onPress={() => this.removeUserFromChat(item.user_id)} />
              </View>
            )}
          />
        ) : (
          <Text style={styles.noUsers}>No users in the chat</Text>
        )}
  
        <Button title="Add Users to Chat" onPress={this.navigateToAddToChat} />
        <Button title="Back" onPress={() => this.props.navigation.goBack()} />
   
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    padding: 5,
  },
  userTitle: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  userName: {
    flex: 1,
  },
  noUsers: {
    marginTop: 10,
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

export default UpdateChatScreen;
