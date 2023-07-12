import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TextInput, Alert, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ContactScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      searchQuery: '',
      password: '',
      modalVisible: false,
      modalContent: '',
      filteredContacts: [],
    };
  }

  static navigationOptions = {
    header: null,
  };

  setModalVisible = (visible, content = '') => {
    this.setState({ modalVisible: visible, modalContent: content });
    if (!visible) {
      setTimeout(() => {
        this.setState({ modalContent: '' });
      }, 2000);
    }
  };

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.fetchContacts();
    });
  }

  refreshContactsList = () => {
    this.fetchContacts();
  };

  handleSearchChange = (searchQuery) => {
    this.setState({ searchQuery }, this.filterContacts);
  };

  handleSearch = () => {
    this.filterContacts();
  };

  showUserProfile = (item) => {
    console.log(item);
    Alert.alert(
      'User Profile',
      `Name: ${item.first_name} ${item.last_name}\nEmail: ${item.email}`,
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
      { cancelable: false }
    );
  };

  filterContacts = () => {
    const { searchQuery, contacts } = this.state;
    if (searchQuery) {
      const filteredContacts = contacts.filter(
        (contact) =>
          contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.last_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      this.setState({ filteredContacts });
    } else {
      this.setState({ filteredContacts: contacts });
    }
  };

  fetchContacts = async () => {
    try {
      const response = await this.getContacts();
      const sortedContacts = response.sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      this.setState({ contacts: sortedContacts, filteredContacts: sortedContacts });
    } catch (error) {
      console.error(error);
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
        return response.json();
      } else if (response.status === 401) {
        throw 'Unauthorised';
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      console.error(error);
    }
  };

  DeleteUser = async (user_id) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/contact`, {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user_id }),
      });
      if (response.status === 200) {
        this.fetchContacts();
        this.setModalVisible(true, 'User removed successfully');
      } else if (response.status === 400) {
        throw "You can't remove yourself as a contact";
      } else if (response.status === 404) {
        throw 'Unauthorised';
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      console.error(error);
    }
  };

  blockUser = async (user_id) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/block`, {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        this.fetchContacts();
        this.setModalVisible(true, 'User blocked successfully');
      } else if (response.status === 401) {
        throw 'Unauthorised';
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to block user');
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Contacts</Text>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('NewChat')}>
            <Text style={styles.createChatText}>Create Chat</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={this.state.searchQuery}
          onChangeText={this.handleSearchChange}
          placeholder="Type in the user's name to search."
          style={styles.input}
        />

        <Button
          title="Manage Contacts"
          onPress={() =>
            this.props.navigation.navigate('ManageContacts', {
              onRefreshContacts: this.refreshContactsList,
            })
          }
        />

        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={this.state.filteredContacts}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.contactItem}>
              <TouchableOpacity onPress={() => this.showUserProfile(item)}>
                <Text style={styles.contactText}>
                  {item.first_name} {item.last_name}
                </Text>
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <Button title="Remove" onPress={() => this.DeleteUser(item.user_id)} />
                <Button title="Block" onPress={() => this.blockUser(item.user_id)} />
              </View>
            </View>
          )}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{this.state.modalContent}</Text>
              <Button
                title="Close"
                onPress={() => {
                  this.setModalVisible(false);
                }}
              />
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
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  createChatText: {
    color: 'blue',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  input: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    margin: 10,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  contactText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    margin: 10,
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
    width: '50%',
  },
  modalText: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ContactScreen;


