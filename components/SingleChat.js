import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  TextInput,
  Button,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

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

class SingleChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      singleChat: null,
      currentUser: null,
      newMessage: '',
      messages: [],
      isTyping: false,
    };
  }

  componentDidMount() {
    const { route, navigation } = this.props;
    const { chat_id } = route?.params || {};
    if (!chat_id) {
      throw new Error('No chat_id provided');
    }
    this.viewSingleChat(chat_id);
    this.setState({ currentchat_id: chat_id });
    this.setupNavigationOptions(navigation);
    this.fetchCurrentUser();
    this.startPolling();
  }

  setupNavigationOptions = (navigation) => {
    const { route } = this.props;
    const { chat_id } = route?.params || {};

    navigation.setOptions({
      title: chat_id,
      headerRight: () => this.renderHeaderOptions(),
    });
  };

  renderHeaderOptions = () => {
    const { navigation } = this.props;
    const { route } = this.props;
    const { chat_id } = route?.params || {};

    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => navigation.navigate('UpdateChat', { chat_id })}>
          <Text style={styles.buttonText}>Edit Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.navigateToDraftListScreen}>
          <Text style={styles.buttonText}>Load Draft</Text>
        </TouchableOpacity>
      </View>
    );
  };

  fetchCurrentUser = async () => {
    const userId = await AsyncStorage.getItem('whatsthat_user_id');
    if (userId) {
      this.setState({ currentUser: Number(userId) });
    }
  };

  startPolling = () => {
    setInterval(() => {
      const { currentchat_id } = this.state;
      if (currentchat_id) {
        this.fetchNewMessages(currentchat_id);
      }
    }, 100);
  };

  handleMessageLongPress = (message) => {
    const { currentchat_id } = this.state;
    const { navigation } = this.props;
    navigation.navigate('EditChat', {
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
  };

  saveDraftMessage = async () => {
    const { newMessage, currentchat_id } = this.state;
    if (newMessage.length > 0) {
      const timestamp = Date.now();
      const draftMessageKey = `whatsthat_draft_message_${currentchat_id}_${timestamp}`;
      try {
        await AsyncStorage.setItem(draftMessageKey, newMessage);
        this.setState({ isTyping: false, newMessage: '' });
      } catch (error) {
        throw new Error('Error saving draft message:', error);
      }
    }
  };

  navigateToDraftListScreen = () => {
    const { navigation } = this.props;
    const { currentchat_id } = this.state;
    navigation.navigate('DraftListScreen', { chat_id: currentchat_id.toString() });
  };

  sendMessage = async () => {
    const { newMessage, currentchat_id, currentUser } = this.state;
    if (newMessage && currentchat_id) {
      const messageToSend = newMessage;

      try {
        await this.SendMessage(currentchat_id, messageToSend);
        await AsyncStorage.setItem('whatsthat_user_id', currentUser.toString());
        await AsyncStorage.removeItem(`whatsthat_draft_message_${currentchat_id}`);
        this.setState({ newMessage: '', isTyping: false });
      } catch (error) {
        throw new Error(error);
      }
    }
  };

  fetchNewMessages = async (chat_id = null) => {
    const { navigation } = this.props;
    if (!chat_id) return;
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
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('Login');
        throw new Error('Unauthorised');
      } else if (response.status === 403) {
        throw new Error('Forbidden');
      } else if (response.status === 404) {
        this.stopPolling();
        throw new Error('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      throw new Error('Error fetching new messages:', error);
    }
  };

  async SendMessage(chat_id, message) {
    const { navigation } = this.props;
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        body: JSON.stringify({
          message,
        }),
      });
      if (response.status === 200) {
        try {
          const chatDetails = null;
          if (chatDetails) {
            this.setState({
              messages: chatDetails.messages || [],
            });
          }
        } catch (error) {
          throw new Error(error);
        }
      } else if (response.status === 400) {
        throw new Error('Bad Request');
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('Login');
        throw new Error('Unathorised');
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
  }

  async viewSingleChat(chat_id) {
    const { navigation } = this.props;
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
        navigation.setOptions({ title: chat.name });
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
  }

  render() {
    const {
      singleChat,
      messages,
      currentUser,
      newMessage,
      isTyping,
    } = this.state;

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
            <TouchableOpacity onLongPress={() => this.handleMessageLongPress(msg)}>
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

          {isTyping && (
            <TouchableOpacity onPress={this.saveDraftMessage}>
              <Text style={styles.buttonText}>Save Draft</Text>
            </TouchableOpacity>
          )}

          <Button title="Send" onPress={this.sendMessage} />
        </View>
      </View>
    );
  }
}

SingleChatScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    setOptions: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      chat_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      message_id: PropTypes.number,
    }).isRequired,
  }).isRequired,
};

export default SingleChatScreen;
