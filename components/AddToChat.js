import React, { Component } from 'react';
import { TextInput, Button, Alert, View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AddToChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      filteredContacts: [],
      searchQuery: '',
      chat_id: this.props.route.params.chat_id,
      user_id: '',
      chatDetails: this.props.route.params.chatDetails,
    };
  } 
  componentDidMount() {
    console.log('Chat ID:', this.state.chat_id);

    if(this.state.chatDetails) {
      console.log("Chat Details ID: ", this.state.chatDetails.id);
    } else {
      console.log("Chat Details is undefined");
    }

    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.fetchContacts();
    });
  }

  componentWillUnmount() {
    if (this.focusListener != null && this.focusListener.remove) {
      this.focusListener.remove();
    }
  }

  fetchContacts = async () => {
    try {
      const response = await this.getContacts();
      this.setState({ contacts: response });
      this.filterContacts();
    } catch (error) {
      console.error(error);
    }
  };

  getContacts = async () => {
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
  };

  filterContacts = () => {
    const { searchQuery, contacts } = this.state;
    const filteredContacts = contacts.filter(
      (contact) =>
        String(contact.user_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(contact.first_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(contact.last_name).toLowerCase().includes(searchQuery.toLowerCase())
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

  // AddUserToChat = async (chat_id, user_id) => {
  //   try {
  //     const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/user/${user_id}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
  //       },
  //     });

  //     if (response.status === 200) {
  //       const chatDetails = await response.json();
  //       this.setState({ chatDetails });
  //       console.log(`User with ID ${user_id} added to chat with ID ${chat_id}`);
  //     } else if (response.status === 400) {
  //       console.log('Bad Request');
  //     } else if (response.status === 401) {
  //       console.log('Unauthorised');
  //       await AsyncStorage.removeItem('whatsthat_session_token');
  //       await AsyncStorage.removeItem('whatsthat_user_id');
  //       this.props.navigation.navigate('Login');
  //     } else if (response.status === 403) {
  //       console.log('Forbidden');
  //     } else if (response.status === 404) {
  //       console.log('Not Found');
  //     } else {
  //       throw new Error('Server Error');
  //     }
  //   } catch (error) {
  //     console.log('Failed to add user to chat:', error);
  //     Alert.alert('Error', error.toString());
  //   }
  // };

  AddUserToChat = async (chat_id, user_id) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/user/${user_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
  
      if (response.status === 200) {
        const contentType = response.headers.get("content-type");
        if(contentType && contentType.includes("application/json")) {
          const chatDetails = await response.json();
          this.setState({ chatDetails });
        }
        console.log(`User with ID ${user_id} added to chat with ID ${chat_id}`);
      } else if (response.status === 400) {
        console.log('Bad Request');
      } else if (response.status === 401) {
        console.log('Unauthorised');
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
      console.log('Failed to add user to chat:', error);
      Alert.alert('Error', error.toString());
    }
  };
  

  render() {
    const { filteredContacts, searchQuery } = this.state;
    return (
      <View style={styles.container}>
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
              <Button style={styles.button} title="Add to Chat" onPress={() => {this.AddToChat(item.user_id);}} />
            </View>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5'
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
});

export default AddToChatScreen;