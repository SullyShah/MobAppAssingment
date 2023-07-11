import React, { Component } from 'react';
import { Text, View, TextInput, Button, Modal, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AddContactsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      user_id: '',
      modalVisible: false,
      errorMessage: '',
      searchQuery: '',
      availableUsers: [],
      addedUsers: [],
      first_name: '',
      last_name: '',
      filteredUsers: [],
    };
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('focus', async () => {
      await this.fetchContacts();
      this.getAllUsers();
    });
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
      const filteredUsers = availableUsers.filter(user =>
        (user.given_name.toLowerCase() + " " + user.family_name.toLowerCase()).includes(lowerCaseQuery)
      );
      this.setState({ filteredUsers });
    } else {
      this.setState({ filteredUsers: availableUsers });
    }
  };
  
  
  
  handleAddUser = (user_id) => {
    this.AddUser(user_id);
  };

  AddUser = async (user_id) => {
    try {
      const currentUserId = await AsyncStorage.getItem('whatsthat_user_id');
      if (currentUserId === user_id) {
        this.setModalVisible(true, "You can't add yourself as a contact");
        return;
      }
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        body: JSON.stringify({
          user_id: user_id,
        }),
      });
  
      if (response.status === 200) {
        const newUser = this.state.availableUsers.find((user) => user.user_id === user_id);
        this.setState((prevState) => ({
          addedUsers: [...prevState.addedUsers, newUser],
          availableUsers: prevState.availableUsers.filter((user) => user.user_id !== user_id),
        }));
        this.setModalVisible(true, "Contact added successfully");
      } else if (response.status === 400) {
        throw  "You Can't Add Yourself As A Contact.";
      } else if (response.status === 401) {
        throw 'Unauthorised';
      } else if (response.status === 404) {
        throw 'Not Found';
      } else if (response.status === 409) {
        throw 'This user is already a contact.';
      } else {
        throw "Server Error";
      }
    } catch (error) {
      this.setState({ modalVisible: true, errorMessage: error.toString() });
    }
  };
  

  searchUsers = async (searchQuery) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/search?q=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
      if (response.status === 200) {
        const user = await response.json();
       // this.setModalVisible(true, "SEARCH");
        console.log('Response:', user);
        return user;
      } else if (response.status === 400) {
        throw 'Bad Request';
      } else if (response.status === 401) {
        throw 'Unauthorised';
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      this.setState({ modalVisible: true, modalContent: error.toString() });
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
        const addedUsersSet = new Set(
          this.state.addedUsers && this.state.addedUsers.map((user) => user.user_id)
        );
        const blockedUsersSet = new Set(await this.getBlockedList()); // Fetch blocked users
        const users = responseData.filter(
          (user) => !addedUsersSet.has(user.user_id) && !blockedUsersSet.has(user.user_id)
        ); 
        this.setState({ availableUsers: users });
        return users; // Add this line to return the array
      } else if (response.status === 401) {
        throw 'Unauthorised';
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      this.setState({ modalVisible: true, modalContent: error.toString() });
    }
  };


  fetchContacts = async () => {
    try {
      const response = await this.getContacts();
      if (response) {
        this.setState({ addedUsers: response }, this.getAllUsers);
      }
    } catch (error) {
      this.setState({ modalVisible: true, modalContent: error.toString() });
    }
  };

  getContacts = async () => {
    try {
      const token = await AsyncStorage.getItem('whatsthat_session_token');
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
        throw 'Unauthorised';
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      this.setState({ modalVisible: true, modalContent: error.toString() });
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
      } else if (response.status === 401) {
        throw 'Unauthorised';
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      this.setState({ modalVisible: true, modalContent: error.toString() });
    }
  };

  render() {
    const { modalVisible, errorMessage, searchQuery, availableUsers } = this.state;

    return (
      <View>
<TextInput
  placeholder="Search users by name"
  onChangeText={this.handleSearchChange}
  value={searchQuery}
  style={{
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    margin: 10,
  }}
/>


<FlatList
  data={this.state.filteredUsers.length > 0 ? this.state.filteredUsers : availableUsers}
  keyExtractor={(item, index) => item.user_id ? item.user_id.toString() : index.toString()}
  renderItem={({ item }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <Text>{item.given_name} {item.family_name}</Text>
      <Button title="Add" onPress={() => this.handleAddUser(item.user_id)} />
    </View>
  )}
/>


        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
              <Text>{errorMessage}</Text>
              <TouchableOpacity
                style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5, marginTop: 10 }}
                onPress={() => {
                  this.setModalVisible(false);
                  if (errorMessage === 'Contact added successfully') {
                  }
                }}
              >
                <Text style={{ color: 'white' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default AddContactsScreen;


