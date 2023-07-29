import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  backText: {
    fontSize: 18,
    color: 'blue',
    textDecorationLine: 'underline',
    marginLeft: 10,
    marginBottom: 10,
  },
  searchInput: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingBottom: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
  },
});

class AddContactsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      errorMessage: '',
      searchQuery: '',
      availableUsers: [],
      addedUsers: [],
      filteredUsers: [],
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('focus', async () => {
      await this.fetchContacts();
      this.getAllUsers();
    });
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
  }

  setModalVisible = (visible, message) => {
    this.setState({ modalVisible: visible, errorMessage: message });
  };

  handleSearchChange = (searchQuery) => {
    this.setState({ searchQuery }, () => this.handleSearch());
  };

  handleSearch = () => {
    const { searchQuery, availableUsers } = this.state;
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredUsers = availableUsers.filter((user) => `${user.given_name.toLowerCase()} ${user.family_name.toLowerCase()}`.includes(lowerCaseQuery));
      this.setState({ filteredUsers });
    } else {
      this.setState({ filteredUsers: availableUsers });
    }
  };

  BackButton = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  handleAddUser = (user_id) => {
    this.AddUser(user_id);
  };

  AddUser = async (user_id) => {
    try {
      const currentUserId = await AsyncStorage.getItem('whatsthat_user_id');
      if (currentUserId === user_id) {
        throw new Error("You can't add yourself as a contact");
      }
      const response = await fetch(
        `http://localhost:3333/api/1.0.0/user/${user_id}/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          },
          body: JSON.stringify({
            user_id,
          }),
        },
      );
      if (response.status === 200) {
        const { availableUsers } = this.state;
        const newUser = availableUsers.find((user) => user.user_id === user_id);
        this.setState((prevState) => ({
          addedUsers: [...prevState.addedUsers, newUser],
          availableUsers: prevState.availableUsers.filter((user) => user.user_id !== user_id),
        }));
        this.setModalVisible(true, 'Contact added successfully');
      } else if (response.status === 400) {
        throw new Error("You can't add yourself as a contact");
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      this.setState({ modalVisible: true, errorMessage: error.toString() });
    }
  };

  getAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/search', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
      
      if (response.status === 200) {
        const responseData = await response.json();
        const { addedUsers } = this.state;
        const addedUsersSet = new Set(addedUsers && addedUsers.map((user) => user.user_id));
        const blockedUsersSet = new Set(await this.getBlockedList());
        const users = responseData.filter(
          (user) => !addedUsersSet.has(user.user_id) && !blockedUsersSet.has(user.user_id),
        );
        this.setState({ availableUsers: users });
        return users;
      } else if (response.status === 400) {
        throw new Error('Bad request');
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      this.setState({ modalVisible: true, errorMessage: error.toString() });
      return [];
    }
  };  

  fetchContacts = async () => {
    try {
      const response = await this.getContacts();
      if (response) {
        this.setState({ addedUsers: response }, this.getAllUsers);
      }
    } catch (error) {
      this.setState({ modalVisible: true, errorMessage: error.toString() });
    }
  };

  getContacts = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/contacts', {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
      if (response.status === 200) {
        const addedUsers = await response.json();
        this.setState({ addedUsers });
        return addedUsers;
      } else if (response.status === 401) {
        throw new Error('Unauthorised access');
      } else {
        throw new Error('Server error. Please try again later.');
      }
    } catch (error) {
      this.setState({ modalVisible: true, errorMessage: error.toString() });
      return [];
    }
  };

  getBlockedList = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/blocked', {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
      if (response.status === 200) {
        const blockedUsers = await response.json();
        return blockedUsers.map((user) => user.user_id);
      }
      throw new Error(response.status === 401 ? 'Unauthorised' : 'Server Error');
    } catch (error) {
      this.setState({ modalVisible: true, errorMessage: error.toString() });
      return [];
    }
  };

  render() {
    const {
      modalVisible,
      errorMessage,
      searchQuery,
      availableUsers,
      filteredUsers,
    } = this.state;
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.BackButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Search users by name"
          onChangeText={this.handleSearchChange}
          value={searchQuery}
          style={styles.searchInput}
        />
        <FlatList
          data={filteredUsers.length > 0 ? filteredUsers : availableUsers}
          keyExtractor={(item, index) => {
            if (item.user_id) {
              return item.user_id.toString();
            }
            return index.toString();
          }}
          renderItem={({ item }) => (
            <View style={styles.userContainer}>
              <Text style={styles.userName}>
                {item.given_name} {item.family_name}
              </Text>
              <Button title="Add" onPress={() => this.handleAddUser(item.user_id)} />
            </View>
          )}
        />
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  this.setModalVisible(false);
                  if (errorMessage === 'Contact added successfully') {
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

AddContactsScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};

export default AddContactsScreen;
