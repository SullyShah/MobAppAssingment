



import React, { Component } from 'react';
import { View, TextInput, Button, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

class DraftMessageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draftMessage: '',
      chat_id: '',
      scheduledDate: new Date(),
      showDatePicker: false,
    };
  }

  componentDidMount() {
    const { route } = this.props;
    const { draftMessageKey } = route.params;
    const chat_id = draftMessageKey.replace('whatsthat_draft_message_', ''); // Extract chat_id from draftMessageKey
    this.setState({ chat_id });
    this.loadDraftMessage(chat_id);
  }

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
      console.log('Error loading draft message:', error);
    }
  };

  handleDeleteDraft = async () => {
    const { chat_id } = this.state;
    const { route } = this.props;
    const { draftMessageKey } = route.params;
    try {
      await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
      this.setState({ draftMessage: '' });
      this.props.navigation.goBack();
    } catch (error) {
      console.log('Error deleting draft message:', error);
    }
  };

  handleSendDraft = async () => {
    const { navigation } = this.props;
    const { draftMessage, chat_id, scheduledDate } = this.state;
  
    try {
      await AsyncStorage.setItem(`whatsthat_draft_message_${chat_id}`, draftMessage);
      await AsyncStorage.setItem(`whatsthat_draft_scheduledDate_${chat_id}`, JSON.stringify(scheduledDate));
      this.scheduleMessage();
      navigation.goBack();
    } catch (error) {
      console.log('Error sending draft message:', error);
    }
  };

  sendMessageWithDraft = async (chat_id, draftMessage) => {
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
        const chatDetails = await response.json();
        await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
        await AsyncStorage.removeItem(`whatsthat_draft_scheduledDate_${chat_id}`);
        this.setState((prevState) => ({
          chatDetails: chatDetails,
          messages: chatDetails.messages || [],
          draftMessage: '', // Remove the draft message from state
        }));
  
        // Delete the draft message and scheduled date from local storage
        await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
        await AsyncStorage.removeItem(`whatsthat_draft_scheduledDate_${chat_id}`);
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
  };

  handleEditButton = async () => {
    const { draftMessage, chat_id, scheduledDate } = this.state;
    try {
      await AsyncStorage.setItem(`whatsthat_draft_message_${chat_id}`, draftMessage);
      await AsyncStorage.setItem(`whatsthat_draft_scheduledDate_${chat_id}`, JSON.stringify(scheduledDate));
      this.scheduleMessage();
      this.props.navigation.goBack();
    } catch (error) {
      console.log('Error saving edited draft message:', error);
    }
  };

  handleCancel = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  handleEditMessage = (text) => {
    this.setState({ draftMessage: text });
  };

  handleSendRightNow = async () => {
    const { chat_id, draftMessage } = this.state;
  
    try {
      await this.sendMessageWithDraft(chat_id, draftMessage);
    } catch (error) {
      console.log('Error sending draft message:', error);
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
          // Delete the draft message and scheduled date from local storage
          await AsyncStorage.removeItem(`whatsthat_draft_message_${chat_id}`);
          await AsyncStorage.removeItem(`whatsthat_draft_scheduledDate_${chat_id}`);
        }, delay);
      } else {
        console.log('Scheduled date and time must be in the future.');
      }
    } catch (error) {
      console.log('Error scheduling message:', error);
    }
  };

  handleDateChange = (selectedDate) => {
    const currentDate = moment();
    const selected = moment(selectedDate);
  
    if (selected.isSameOrAfter(currentDate, 'day')) {
      if (selected.isSame(currentDate, 'day') && selected.isBefore(currentDate)) {
        // Selected time is in the past within the current day
        console.log('Cannot select a past time within the current day');
      } else {
        this.setState({ scheduledDate: selectedDate, showDatePicker: false });
      }
    } else {
      // Selected date is in the past
      console.log('Cannot select a past date');
    }
  };

  showDatePicker = () => {
    this.setState({ showDatePicker: true });
  };

  render() {
    const { draftMessage, scheduledDate, showDatePicker } = this.state;
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
        <TouchableOpacity style={styles.button} onPress={this.showDatePicker}>
          <Text style={styles.buttonText}>{formattedDate}</Text>
        </TouchableOpacity>
        {showDatePicker && (Platform.OS === 'web' ? (
          <DatePicker
            selected={scheduledDate}
            onChange={this.handleDateChange}
            showTimeSelect
            dateFormat="dd/MM/yyyy HH:mm"
            minDate={new Date()} // Restrict to current date onwards
          />
        ) : (
          <DateTimePicker
            value={scheduledDate}
            mode="datetime"
            onChange={this.handleDateChange}
            display="default"
            minimumDate={new Date()} // Restrict to current date onwards
            minuteInterval={1} // Set minute intervals for testing
          />
        ))}
        <TouchableOpacity style={styles.button} onPress={this.handleEditButton}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.handleSendDraft}>
          <Text style={styles.buttonText}>Send Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.handleSendRightNow}>
          <Text style={styles.buttonText}>Send Right Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.handleDeleteDraft}>
          <Text style={styles.buttonText}>Delete Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
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
    button: {
      backgroundColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      marginTop: 10,
      width: '100%',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
  });
  
  export default DraftMessageScreen;
  


