import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#EAF5E2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'Oswald',
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
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});

class ContactScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      searchQuery: '',
      modalVisible: false,
      modalContent: '',
      filteredContacts: [],
      selectedUser: null,
      profilePicture: '',
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      this.fetchContacts();
    });
  }

  componentWillUnmount() {
    this.focusListener?.remove();
  }

  setModalVisible = (visible, content = '') => {
    this.setState({ modalVisible: visible, modalContent: content });
    if (!visible) {
      setTimeout(() => {
        this.setState({ modalContent: '' });
      }, 2000);
    }
  };

  refreshContactsList = () => {
    this.fetchContacts();
  };

  handleSearchChange = (searchQuery) => {
    this.setState({ searchQuery }, this.filterContacts);
  };

  showUserProfile = async (item) => {
    const profilePicture = await this.GPI(item.user_id);
    this.setState({ selectedUser: item, profilePicture });
    this.setModalVisible(true);
  };

  filterContacts = () => {
    const { searchQuery, contacts } = this.state;
    if (searchQuery) {
      const filteredContacts = contacts.filter(
        (contact) => contact.first_name.toLowerCase().includes(searchQuery.toLowerCase())
        || contact.last_name.toLowerCase().includes(searchQuery.toLowerCase()),
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
      throw new Error('Failed to fetch contacts');
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
        return response.json();
      }
      throw new Error('Unauthorised');
    } catch (error) {
      throw new Error('Failed to get contacts');
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
        body: JSON.stringify({ user_id }),
      });
      if (response.status === 200) {
        this.fetchContacts();
        this.setModalVisible(true, 'User removed successfully');
      } else if (response.status === 400) {
        throw new Error("You can't remove yourself as a contact");
      } else if (response.status === 404) {
        throw new Error('Unauthorised');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      throw new Error('Failed to delete contact');
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
        throw new Error('Unauthorised');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      throw new Error('Failed to block contact');
    }
  };

  GPI = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });

      const resBlob = await response.blob();
      const data = URL.createObjectURL(resBlob);

      return data;
    } catch (err) {
      return '';
    }
  };

  render() {
    const {
      searchQuery,
      filteredContacts,
      modalVisible,
      selectedUser,
      profilePicture,
      modalContent,
    } = this.state;
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Contacts</Text>
        </View>

        <TextInput
          value={searchQuery}
          onChangeText={this.handleSearchChange}
          placeholder="Type in the user's name to search."
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Add Contacts"
            onPress={() => navigation.navigate('AddContact', { onRefreshContacts: this.refreshContactsList })}
          />

          <Button title="Unblock Contacts" onPress={() => navigation.navigate('BlockList', { onRefreshContacts: this.refreshContactsList })} />
        </View>

        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={filteredContacts}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.contactItem}>
              <TouchableOpacity onPress={() => this.showUserProfile(item)}>
                <Text style={styles.contactText}>
                  {item.first_name} {item.last_name}
                </Text>
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <Button title="Remove" onPress={() => this.DeleteUser(item.user_id)} color="red" />
                <Button title="Block" onPress={() => this.blockUser(item.user_id)} />
              </View>
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
              {selectedUser ? (
                <View style={styles.userInfo}>
                  <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
                  <Text style={styles.userName}>
                    {selectedUser.first_name} {selectedUser.last_name}
                  </Text>
                  <Text style={styles.userEmail}>Email: {selectedUser.email}</Text>
                </View>
              ) : (
                <Text style={styles.modalText}>{modalContent}</Text>
              )}

              <Button
                title="Close"
                onPress={() => {
                  this.setModalVisible(false);
                  this.setState({ selectedUser: null });
                }}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}
ContactScreen.propTypes = {
  navigation: PropTypes.shape({
    addListener: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default ContactScreen;
