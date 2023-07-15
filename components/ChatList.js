import React, { Component } from 'react';
import { Text, View, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ChatListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chats: [],
      error: null,
      chatSearchId: '',
      singleChat: null,
      ChatName:'',
    };
  }

  //need to update chat instantly when i edit message. 
  // make the edit chat sceen look bette. 

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.viewChats();
    });
  }

  componentWillUnmount() {
    if (this.focusListener != null && this.focusListener.remove) {
      this.focusListener.remove();
    }
  }
  async viewChats() {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const chats = await response.json();
        this.setState({ chats: chats });
      } else if (response.status === 401) {
        console.log('Unauthorised');
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        this.props.navigation.navigate('Login');
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      this.setState({ error: error });
    }
  }

  render() {
    const { chats, singleChat } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Chat</Text>
          <TouchableOpacity style={styles.headerButton} onPress={() => this.props.navigation.navigate('NewChat')}>
            <Text style={styles.createChatLinkText}>Create New Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separatorLine} />

        <FlatList
          data={chats}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatContainer}
              onPress={() => this.props.navigation.navigate('SingleChat', { chat_id: item.chat_id })}
            >
              <Text style={styles.chatName}>{item.name}</Text>
              <Text>Last Message: {item.last_message.message}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.chat_id.toString()}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#EAF5E2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EAF5E2',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  createChatLinkText: {
    color: 'blue',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  chatContainer: {
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  singleChatContainer: {
    borderColor: '#ccc',
    borderWidth: 3,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  separatorLine: {
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    marginBottom: 10,
  },
});

export default ChatListScreen;
