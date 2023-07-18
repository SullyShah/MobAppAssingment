import React, { Component } from 'react';
import {
  TextInput,
  Button,
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  input: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  itemText: {
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
});

class AddToChatScreen extends Component {
  constructor({ route }) {
    super();
    const { chat_id } = route.params;
    this.state = {
      contacts: [],
      filteredContacts: [],
      searchQuery: '',
      chat_id,
      modalVisible: false,
      modalMessage: '',
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.fetchContacts();

    this.focusListener = navigation.addListener('focus', () => {
      this.fetchContacts();
    });
  }

  componentWillUnmount() {
    if (this.focusListener != null && this.focusListener.remove) {
      this.focusListener.remove();
    }
  }

  setModalVisible = (visible, message) => {
    this.setState({ modalVisible: visible, modalMessage: message });
  };

  handleModalDone = () => {
    const { chat_id } = this.state;
    const { navigation } = this.props;
    this.setState({ modalVisible: false });
    navigation.navigate('SingleChat', { chat_id });
  };

  fetchContacts = async () => {
    try {
      const response = await this.getContacts();
      this.setState({ contacts: response });
      this.filterContacts();
    } catch (error) {
      this.setModalVisible(true, error.toString());
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
      if (response.status !== 200) {
        throw new Error('Failed to fetch contacts');
      }
      const contacts = await response.json();
      return contacts;
    } catch (error) {
      this.setModalVisible(true, error.toString());
      throw error;
    }
  };

  filterContacts = () => {
    const { searchQuery, contacts } = this.state;
    const filteredContacts = contacts.filter(
      (contact) => String(contact.user_id).toLowerCase().includes(searchQuery.toLowerCase())
      || String(contact.first_name).toLowerCase().includes(searchQuery.toLowerCase())
      || String(contact.last_name).toLowerCase().includes(searchQuery.toLowerCase()),
    );
    this.setState({ filteredContacts });
  };

  SpecificContactSearch = (searchQuery) => {
    this.setState({ searchQuery }, this.filterContacts);
  };

  AddToChat = (user_id) => {
    const { chat_id } = this.state;

    if (user_id && chat_id) {
      this.AddUserToChat(chat_id, user_id);
    }
  };

  AddUserToChat = async (chat_id, user_id) => {
    const { navigation } = this.props;

    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/user/${user_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
      if (response.status === 200) {
        this.setModalVisible(true, `User with ID ${user_id} added to chat with ID ${chat_id}`);
      } else if (response.status === 400) {
        throw new Error('Bad Request');
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('Login');
        throw new Error('Unauthorised');
      } else if (response.status === 403) {
        throw new Error('Forbidden');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error(`Response status is ${response.status}`);
      }
    } catch (error) {
      this.setModalVisible(true, error.toString());
    }
  };

  render() {
    const {
      filteredContacts,
      searchQuery,
      modalVisible,
      modalMessage,
    } = this.state;
    return (
      <View style={styles.container}>
        <Modal animationType="slide" transparent visible={modalVisible}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <TouchableOpacity style={styles.buttonClose} onPress={this.handleModalDone}>
                <Text style={styles.textStyle}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TextInput
          style={styles.input}
          placeholder="Search For Contacts"
          value={searchQuery}
          onChangeText={this.SpecificContactSearch}
        />

        <Button
          style={styles.button}
          title="Search Contacts"
          onPress={this.filterContacts}
        />

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{`${item.first_name} ${item.last_name}`}</Text>
              <Button
                style={styles.button}
                title="Add to Chat"
                onPress={() => {
                  this.AddToChat(item.user_id);
                }}
              />
            </View>
          )}
        />
      </View>
    );
  }
}
AddToChatScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      chat_id: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  navigation: PropTypes.object.isRequired,
};

export default AddToChatScreen;
