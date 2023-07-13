import React, { Component } from 'react';
import { ScrollView, TextInput, Button, View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
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
    const { chat_id } = route.params;
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
  
    AsyncStorage.getItem('whatsthat_draft_message').then(draftMessage => {
      if (draftMessage) {
        this.setState({ draftMessage, isDraft: true }); // Set isDraft to true
      } else {
        this.setState({ isDraft: false }); // Set isDraft to false if no draft message
      }
    });
  
    this.startPolling();
  }
  

  componentWillUnmount() {
    this.stopPolling();
  }

  startPolling = () => {
    this.timer = setInterval(() => {
      const { currentchat_id } = this.state;
      this.fetchNewMessages(currentchat_id);
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
    AsyncStorage.setItem('whatsthat_draft_message', text);
  };

  saveDraftMessage = async () => {
    if (this.state.newMessage.length > 0) {
      await AsyncStorage.setItem('whatsthat_draft_message', this.state.newMessage);
      this.setState({ isTyping: false, isDraft: true, newMessage: '' });
    }
  };
  
  loadDraftMessage = async () => {
    AsyncStorage.getItem('whatsthat_draft_message').then(draftMessage => {
      if (draftMessage && !this.state.newMessage) {
        this.setState({ newMessage: draftMessage, isDraft: true });
      } else {
        this.setState({ newMessage: '', isDraft: false }); // Clear the newMessage and isDraft states if there's no draft message
      }
    });
  };
  

  sendMessage = async () => {
    if (this.state.newMessage && this.state.currentchat_id) {
      try {
        const messageToSend = this.state.newMessage; // Store the message to be sent

        // Clear the text input before sending the message
        this.setState({ newMessage: '', isTyping: false });
  
        await this.SendMessage(this.state.currentchat_id, messageToSend);
        this.viewSingleChat(this.state.currentchat_id);
      } catch (error) {
        Alert.alert('Error', error.toString());
      }
    }
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
        await AsyncStorage.removeItem('whatsthat_draft_message');
        this.setState({
          chatDetails: chatDetails,
          messages: chatDetails.messages || [], // Update messages
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

  fetchNewMessages = async (chat_id) => {
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
        console.log('Not Found')      } else {
          throw 'Server Error';
        }
      } catch (error) {
        console.log('Error fetching new messages:', error);
      }
    };

    navigateToDraftScreen = () => {
      const { navigation } = this.props;
      const { newMessage } = this.state;
      navigation.navigate('DraftMessage', {
        draftMessage: newMessage,
        onEditDraft: this.handleEditDraft, // Pass the handleEditDraft function
        onDeleteDraft: this.handleDeleteDraft, // Pass the handleDeleteDraft function
        onSendDraft: this.handleSendDraft, // Pass the handleSendDraft function
      });
    };
    
    
    handleEditDraft = (updatedDraftMessage) => {
      this.setState({ newMessage: updatedDraftMessage });
      AsyncStorage.setItem('whatsthat_draft_message', updatedDraftMessage);
    };
    
    
  
    handleDeleteDraft = () => {
      this.setState({ newMessage: '', isDraft: false });
    };
  
    handleSendDraft = (draftMessage) => {
      this.sendMessage(draftMessage); // Pass the draft message to sendMessage function
    };

    render() {
      const { singleChat, messages, currentUser, newMessage, isTyping, isDraft } = this.state;
  
      if (!singleChat) {
        return <Text>Loading...</Text>;
      }
  
      const reversedMessages = [...messages].reverse();
  
      return (
        <View style={styles.container}>
          <ScrollView style={styles.messagesContainer}>
            {reversedMessages.map((msg, index) => (
              <TouchableOpacity
                key={msg.message_id}
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
            ))}
          </ScrollView>
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
         {isDraft && (
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
  
