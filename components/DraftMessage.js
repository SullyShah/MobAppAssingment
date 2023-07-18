import React, { Component } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eaf7ea',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
    width: '100%',
    height: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: 'blue',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

class DraftMessageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draftMessage: '',
      chat_id: '',
      scheduledDate: new Date(),
      showDatePicker: false,
      errorModalVisible: false,
    };
  }

  componentDidMount() {
    const {
      route: {
        params: { draftMessageKey },
      },
      navigation,
    } = this.props;
    const chat_id = draftMessageKey.replace('whatsthat_draft_message_', '');
    this.setState({ chat_id });
    this.loadDraftMessage(chat_id);
    this.focusListener = navigation.addListener('focus', () => {
      this.loadDraftMessage(chat_id);
    });
  }

  componentWillUnmount() {
    this.focusListener();
  }

  toggleErrorModal = () => {
    this.setState((prevState) => ({
      errorModalVisible: !prevState.errorModalVisible,
    }));
  };

  loadDraftMessage = async (chat_id) => {
    try {
      const draftMessage = await AsyncStorage.getItem(`whatsthat_draft_message_${chat_id}`);
      if (draftMessage) {
        this.setState({ draftMessage });
      }
      const scheduledDate = await AsyncStorage.getItem(`whatsthat_draft_scheduledDate_${chat_id}`);
      if (scheduledDate) {
        this.setState({ scheduledDate: new Date(JSON.parse(scheduledDate)) });
      }
    } catch (error) {
      throw new Error('Error loading draft message:', error);
    }
  };

  handleDeleteDraft = async () => {
    const { chat_id } = this.state;
    const { navigation } = this.props;

    try {
      await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
      navigation.navigate('SingleChat', { chat_id });
    } catch (error) {
      throw new Error('Error deleting draft message:', error);
    }
  };

  handleSendDraft = async () => {
    const { navigation } = this.props;
    const { chat_id, scheduledDate } = this.state;

    try {
      if (moment(scheduledDate).isSameOrAfter(moment())) {
        await AsyncStorage.setItem(`whatsthat_draft_scheduledDate_${chat_id}`, JSON.stringify(scheduledDate));
        this.scheduleMessage();
        navigation.navigate('SingleChat', { chat_id });
      } else {
        throw new Error('Scheduled date and time must be in the future.');
      }
    } catch (error) {
      this.setState({ errorModalVisible: true });
    }
  };

  sendMessageWithDraft = async (chat_id, draftMessage, navigation) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chat_id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        body: JSON.stringify({
          message: draftMessage,
        }),
      });
      if (response.status === 200) {
        await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
        await AsyncStorage.removeItem(`whatsthat_draft_scheduledDate_${chat_id}`);
        this.setState({
          draftMessage: '',
        });
        await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
        await AsyncStorage.removeItem(`whatsthat_draft_scheduledDate_${chat_id}`);
      } else if (response.status === 400) {
        throw new Error('Bad Request');
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('SingleChat', { chat_id });
        throw new Error('Unauthorized');
      } else if (response.status === 403) {
        throw new Error('Forbidden');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      throw new Error(`Error sending draft message: ${error.message}`);
    }
  };

  handleEditButton = async () => {
    const { draftMessage, chat_id } = this.state;
    const { navigation } = this.props;

    try {
      await AsyncStorage.setItem(`whatsthat_draft_message_${chat_id}`, draftMessage);
      navigation.navigate('SingleChat', { chat_id });
    } catch (error) {
      throw new Error('Error saving edited draft message:', error);
    }
  };

  handleCancel = () => {
    const { navigation } = this.props;
    const { chat_id } = this.state;
    navigation.navigate('SingleChat', { chat_id });
  };

  handleEditMessage = (text) => {
    this.setState({ draftMessage: text });
  };

  handleSendRightNow = async () => {
    const { chat_id, draftMessage } = this.state;
    try {
      await this.sendMessageWithDraft(chat_id, draftMessage);
      await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
      await AsyncStorage.removeItem(`whatsthat_draft_scheduledDate_${chat_id}`);
      const { navigation } = this.props;
      navigation.navigate('SingleChat', { chat_id });
    } catch (error) {
      throw new Error('Error sending draft message:', error);
    }
  };

  scheduleMessage = async () => {
    const { chat_id, scheduledDate, draftMessage } = this.state;

    try {
      const now = new Date();
      const delay = scheduledDate.getTime() - now.getTime();

      if (delay > 0) {
        setTimeout(async () => {
          await this.sendMessageWithDraft(chat_id, draftMessage);
          await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
          await AsyncStorage.removeItem(`whatsthat_draft_scheduledDate_${chat_id}`);
        }, delay);
      } else {
        throw new Error('Scheduled date and time must be in the future.');
      }
    } catch (error) {
      // throw new Error('Scheduled date and time must be in the future.');
    }
  };

  handleDateChange = (selectedDate) => {
    const currentDate = moment();
    const selected = moment(selectedDate);
    const { showDatePicker } = this.state;

    if (showDatePicker) {
      if (selected.isSameOrAfter(currentDate)) {
        this.setState({ scheduledDate: selectedDate, showDatePicker: false });
      }
    } else {
      this.setState({ scheduledDate: selectedDate });
    }
  };

  showDatePicker = () => {
    this.setState({ showDatePicker: true });
  };

  render() {
    const {
      draftMessage,
      scheduledDate,
      showDatePicker,
      errorModalVisible,
    } = this.state;
    const formattedDate = moment(scheduledDate).format('DD/MM/HH:mm');

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={draftMessage}
          onChangeText={this.handleEditMessage}
          placeholder="Enter your draft message"
          multiline
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={this.showDatePicker}>
            <Text style={styles.buttonText}>{formattedDate}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this.handleSendDraft}>
            <Text style={styles.buttonText}>Scheduled Send</Text>
          </TouchableOpacity>
        </View>
        {showDatePicker && (
          <DatePicker
            selected={scheduledDate}
            onChange={this.handleDateChange}
            showTimeSelect
            dateFormat="dd/MM/yyyy HH:mm"
            minDate={new Date()} // Restrict to current date onwards
          />
        )}
        <TouchableOpacity style={styles.button} onPress={this.handleEditButton}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.handleSendRightNow}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.handleDeleteDraft}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={this.handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Modal visible={errorModalVisible} animationType="fade" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Cannot select a past date or time</Text>
              <TouchableOpacity style={styles.modalButton} onPress={this.toggleErrorModal}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

DraftMessageScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      draftMessageKey: PropTypes.string.isRequired,
      chat_id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  navigation: PropTypes.shape({
    addListener: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default DraftMessageScreen;

