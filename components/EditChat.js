import React, { Component } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EditChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageContent: '',
      chat_id: this.props.route.params.chat_id,
      message_id: this.props.route.params.message_id,
    };
  }

  componentDidMount() {
    const { route } = this.props;

    if (route && route.params && route.params.message_content) {
      this.setState({
        messageContent: route.params.message_content,
      });
    }
  }

  deleteMessage = async () => {
    const { route, navigation } = this.props;
    const { chat_id, message_id } = route.params;

    try {
      await this.deleteMessageAPI(chat_id, message_id);
      Alert.alert('Success', 'Message deleted successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.toString());
    }
  };

  editMessage = async () => {
    const { route, navigation } = this.props;
    const { chat_id, message_id } = route.params;
    const { messageContent } = this.state;

    try {
      await this.updateMessageAPI(chat_id, message_id, messageContent);
      Alert.alert('Success', 'Message updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.toString());
    }
  };

  cancelEdit = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  async deleteMessageAPI(chat_id, message_id) {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/message/${message_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });

      if (response.status === 200) {
        const chatDetails = await response.json();
        this.setState({ chatDetails: chatDetails });
      } else if (response.status === 401) {
        console.log('Unauthorized');
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

  async updateMessageAPI(chat_id, message_id, message) {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/message/${message_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        body: JSON.stringify({ message: message }),
      });

      if (response.status === 200) {
        const chatDetails = await response.json();
        this.setState({ chatDetails: chatDetails });
      } else if (response.status === 400) {
        console.log('Bad Request');
      } else if (response.status === 401) {
        console.log('Unauthorized');
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

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <TextInput
            value={this.state.messageContent}
            onChangeText={(text) => this.setState({ messageContent: text })}
            style={styles.input}
          />

          <View style={styles.buttonContainer}>
          <Button title="Update Message" onPress={this.editMessage.bind(this)} />
        <Button title="Delete Message" onPress={this.deleteMessage.bind(this)} color="red" />
        <Button title="Cancel" onPress={this.cancelEdit} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF5E2',
    justifyContent: 'center',
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 32,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default EditChatScreen;
