import React, { Component } from 'react';
import { TextInput, Button, View, Text, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

class SingleChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      singleChat: null,
      currentUser: null,
      error: null,
      newMessage: '',
      draftMessage: '',
      messages: [],
      isTyping: false,
      isDraft: false,
    };
    this.timer = null;
  }

  componentDidMount() {
    const { route, navigation } = this.props;
    console.log(route.params); // add this line to check the parameters
    const { chat_id } = route?.params || {}; // Here's the modification
    if (!chat_id) {
      console.error('No chat_id provided');
      return; // exit the function if chat_id is not available
    }
    this.viewSingleChat(chat_id);
    this.setState({ currentchat_id: chat_id });
    navigation.setOptions({
      title: chat_id,
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('UpdateChat', { chat_id })}>
          <Text style={{ color: 'blue', marginRight: 10, fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 15 }}>
            Edit Chat
          </Text>
        </TouchableOpacity>
      ) 


    });
  
    AsyncStorage.getItem('whatsthat_user_id').then(userId => {
      console.log('Fetched user from AsyncStorage:', userId);
      if (userId) {
        this.setState({ currentUser: Number(userId) });
      }
    });
  
    const draftMessageKey = `whatsthat_draft_message_${chat_id}`; // Generate the draft message key based on chat_id
    AsyncStorage.getItem(draftMessageKey).then(draftMessage => {
      if (draftMessage) {
        this.setState({ draftMessage, isDraft: true });
      } else {
        this.setState({ draftMessage: '', isDraft: false });
      }
    });
  
    this.startPolling();
  }
  

  startPolling = () => {
    this.timer = setInterval(() => {
      const { currentchat_id } = this.state;
      if(currentchat_id) {
          this.fetchNewMessages(currentchat_id);
      }
    }, 100); 
  };

  stopPolling = () => {
    clearInterval(this.timer);
  };

  handleMessageLongPress = (message) => {
    const { currentchat_id } = this.state;
    this.props.navigation.navigate('EditChat', {
      chat_id: currentchat_id,
      message_id: message.message_id,
      message_content: message.message,
    });
  };

  handleMessageInputChange = (text) => {
    this.setState({
      newMessage: text,
      isTyping: text.length > 0,
    });
    AsyncStorage.setItem(`whatsthat_draft_message_${this.state.currentchat_id}`, text);
  };

  saveDraftMessage = async () => {
    if (this.state.newMessage.length > 0) {
      const { currentchat_id, newMessage } = this.state;
      try {
        await AsyncStorage.setItem(`whatsthat_draft_message_${currentchat_id}`, newMessage);
        this.setState({ isTyping: false, isDraft: true, newMessage: '' }); // Clear the newMessage
      } catch (error) {
        console.log('Error saving draft message:', error);
      }
    }
  };
  
  
  loadDraftMessage = async () => {
    const { currentchat_id } = this.state;
    try {
      const draftMessage = await AsyncStorage.getItem(`whatsthat_draft_message_${currentchat_id}`);
      if (draftMessage) {
        this.setState({ newMessage: draftMessage, isDraft: true });
      } else {
        this.setState({ newMessage: '', isDraft: false });
      }
    } catch (error) {
      console.log('Error loading draft message:', error);
    }
  };
  
  sendMessage = async () => {
    if (this.state.newMessage && this.state.currentchat_id) {
      const messageToSend = this.state.newMessage; // Store the message to be sent
  
      try {
        await this.SendMessage(this.state.currentchat_id, messageToSend);
        await AsyncStorage.setItem('whatsthat_user_id', this.state.currentUser.toString()); // Set the current user ID again
        await AsyncStorage.removeItem(`whatsthat_draft_message_${this.state.currentchat_id}`); // Remove draft for the current chat
        this.setState({ newMessage: '', isTyping: false, isDraft: false });
      } catch (error) {
        Alert.alert('Error', error.toString());
      }
    }
  };
  
  navigateToDraftScreen = () => {
    const { navigation } = this.props;
    const { newMessage, currentchat_id } = this.state;
    navigation.navigate('DraftMessage', {
      draftMessage: newMessage,
      chat_id: currentchat_id,
      handleEditDraft: this.handleEditDraft, // Pass the handleEditDraft function to DraftMessageScreen
      handleDeleteDraft: this.handleDeleteDraft, // Pass the handleDeleteDraft function to DraftMessageScreen
      handleSendDraft: this.handleSendDraft, // Pass the handleSendDraft function to DraftMessageScreen
    });
  };
  
  handleEditDraft = (updatedDraftMessage) => {
    this.setState({ newMessage: updatedDraftMessage });
    AsyncStorage.setItem(`whatsthat_draft_message_${this.state.currentchat_id}`, updatedDraftMessage);
  };

  handleDeleteDraft = () => {
    this.setState({ newMessage: '', isDraft: false });
    AsyncStorage.removeItem(`whatsthat_draft_message_${this.state.currentchat_id}`);
  };

  handleSendDraft = (draftMessage) => {
    this.sendMessage(draftMessage); // Pass the draft message to sendMessage function
  };

  async viewSingleChat(chat_id) {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}`, {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const chat = await response.json();
        this.setState({
          singleChat: chat,
          messages: chat.messages || [],
        });
        this.props.navigation.setOptions({ title: chat.name });
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
        throw 'Server Error';
      }
    } catch (error) {
      this.setState({ error: error });
    }
  }

  async SendMessage(chat_id, message) {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        body: JSON.stringify({
          message: message,
        }),
      });
      if (response.status === 200) {
        const chatDetails = await response.json();
        this.setState({
          chatDetails: Details,
          messages: chatDetails.messages || [],
        });
      } else if (response.status === 400) {
        console.log('Bad Request');
      } else if (response.status === 401) {
        console.log('Unathorised');
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        this.props.navigation.navigate('Login');
      } else if (response.status === 403) {
        console.log('Forbidden');
      } else if (response.status === 404) {
        console.log('Not Found');
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      this.setState({ error: error });
    }
  }

  fetchNewMessages = async (chat_id = null) => {
    if(!chat_id) return; 
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}`, {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const chat = await response.json();
        this.setState({
          messages: chat.messages || [],
        });
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
        throw 'Server Error';
      }
    } catch (error) {
      console.log('Error fetching new messages:', error);
    }
  };

  render() {
    const { singleChat, messages, currentUser, newMessage, isTyping, isDraft } = this.state;
  
    if (!singleChat) {
      return <Text>Loading...</Text>;
    }
  
    return (
      <View style={styles.container}>
        <FlatList
          inverted
          data={messages}
          keyExtractor={(item) => item.message_id.toString()}
          renderItem={({ item: msg }) => (
            <TouchableOpacity
              onLongPress={() => this.handleMessageLongPress(msg)}
            >
              <View
                style={[
                  styles.messageBox,
                  msg.author.user_id === currentUser ? styles.rightAlign : styles.leftAlign,
                ]}
              >
                <Text style={styles.messageSender}>{msg.author.first_name}</Text>
                <Text style={styles.messageText}>{msg.message}</Text>
                <Text style={styles.messageTime}>
                  {moment(msg.timestamp).format('MMMM Do YYYY, h:mm a')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message here..."
            value={newMessage}
            onChangeText={this.handleMessageInputChange}
          />
          {isTyping && !isDraft && (
            <TouchableOpacity onPress={this.saveDraftMessage}>
              <Text style={styles.buttonText}>Save Draft</Text>
            </TouchableOpacity>
          )}
  
          {isDraft && newMessage === '' && (
            <TouchableOpacity onPress={this.navigateToDraftScreen}>
              <Text style={styles.buttonText}>Load Draft</Text>
            </TouchableOpacity>
          )}
  
          <Button title="Send" onPress={this.sendMessage} />
        </View>
      </View>
    );
  }
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBox: {
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  rightAlign: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
  },
  leftAlign: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageSender: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    marginRight: 10,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  buttonText: {
    color: 'blue',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
});

export default SingleChatScreen;
