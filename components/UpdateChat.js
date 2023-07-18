import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EAF5E2',
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
    fontSize: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  userName: {
    flex: 1,
    fontSize: 20,
  },
  noUsers: {
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
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

class UpdateChatScreen extends Component {
  constructor(props) {
    super(props);
    const { chat_id } = props.route.params;
    this.state = {
      chat_id,
      newChatName: '',
      users: [],
      modalVisible: false,
      modalTitle: '',
      modalMessage: '',
    };
  }

  componentDidMount() {
    this.fetchChatDetails();
  }

  navigateToAddToChat = () => {
    const { chat_id } = this.state;
    const { navigation } = this.props;
    navigation.navigate('AddToChat', { chat_id });
  };

  navigateToChatPage = () => {
    const { navigation } = this.props;
    navigation.navigate('ChatList');
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
    this.navigateToChatPage();
  };

  fetchChatDetails = async () => {
    try {
      const { navigation } = this.props;
      const { chat_id } = this.state;
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}`, {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
      if (response.status === 200) {
        const chatDetails = await response.json();
        this.setState({
          newChatName: chatDetails.name || '',
          users: chatDetails.members || [],
        });
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('Login');
      } else if (response.status === 403) {
        throw new Error('Forbidden');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  updatenewChatName = async () => {
    try {
      const { navigation } = this.props;
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
        this.showModal('Success', 'Chat name updated successfully');
      } else if (response.status === 400) {
        try {
          const responseData = await response.json();
          throw new Error('Bad Request:', responseData.message);
        } catch (error) {
          throw new Error('Bad Request: Invalid JSON');
        }
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('Login');
      } else if (response.status === 403) {
        throw new Error('Forbidden');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  removeUserFromChat = async (user_id) => {
    try {
      const { navigation } = this.props;
      const { chat_id } = this.state;
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/user/${user_id}`, {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });

      if (response.status === 200) {
        this.showModal('Success', `User with ID ${user_id} removed from the chat`);
        this.fetchChatDetails();
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('Login');
      } else if (response.status === 403) {
        throw new Error('Forbidden');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  render() {
    const {
      newChatName,
      users,
      modalVisible,
      modalTitle,
      modalMessage,
    } = this.state;

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
        <Button
          title="Back"
          onPress={() => {
            const { navigation } = this.props;
            navigation.goBack();
          }}
        />

        <Modal animationType="slide" visible={modalVisible} onRequestClose={this.hideModal} transparent>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{modalTitle}</Text>
                <Text style={styles.modalMessage}>{modalMessage}</Text>
                <Button title="Close" onPress={this.hideModal} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

UpdateChatScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    setOptions: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      chat_id: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default UpdateChatScreen;
