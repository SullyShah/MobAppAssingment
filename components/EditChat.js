import React, { Component } from 'react';
import {
  View,
  Button,
  TextInput,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

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

class EditChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageContent: '',
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
      navigation.goBack();
    } catch (error) {
      throw new Error('Error');
    }
  };

  editMessage = async () => {
    const { route, navigation } = this.props;
    const { chat_id, message_id } = route.params;
    const { messageContent } = this.state;

    try {
      await this.updateMessageAPI(chat_id, message_id, messageContent);
      navigation.goBack();
    } catch (error) {
      throw new Error('Error');
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
        if (response.headers.get('content-type') === 'application/json') {
          const responseJson = await response.json();
          this.setState({ messageContent: responseJson.message });
        }
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        throw new Error('Unauthorised');
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

  async updateMessageAPI(chat_id, message_id, message, navigation) {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/message/${message_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        body: JSON.stringify({ message }),
      });

      if (response.status === 200) {
        if (response.headers.get('content-type') === 'application/json') {
          const responseJson = await response.json();
          this.setState({ messageContent: responseJson.message });
        }
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
        throw new Error('Server Error');
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  render() {
    const { messageContent } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <TextInput
            value={messageContent}
            onChangeText={(text) => this.setState({ messageContent: text })}
            style={styles.input}
          />

          <View style={styles.buttonContainer}>
            <Button title="Update Message" onPress={this.editMessage} />
            <Button title="Delete Message" onPress={this.deleteMessage} color="red" />
            <Button title="Cancel" onPress={this.cancelEdit} />
          </View>
        </View>
      </View>
    );
  }
}

EditChatScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      message_content: PropTypes.string,
      chat_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      message_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
  }).isRequired,
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditChatScreen;
