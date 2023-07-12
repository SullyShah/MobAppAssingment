import React, { Component } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DraftMessageScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draftMessage: '',
    };
  }

  componentDidMount() {
    this.loadDraftMessage();
  }

  loadDraftMessage = async () => {
    try {
      const draftMessage = await AsyncStorage.getItem('whatsthat_draft_message');
      if (draftMessage) {
        this.setState({ draftMessage });
      }
    } catch (error) {
      console.log('Error loading draft message:', error);
    }
  };

  handleDeleteDraft = async () => {
    try {
      await AsyncStorage.removeItem('whatsthat_draft_message');
      this.setState({ draftMessage: '' });
      this.props.navigation.goBack();
    } catch (error) {
      console.log('Error deleting draft message:', error);
    }
  };

  handleSendDraft = () => {
    const { navigation, route } = this.props;
    const { onSendDraft } = route.params;
    const { draftMessage } = this.state;
    onSendDraft(draftMessage); // Pass the draft message to onSendDraft function
    navigation.goBack();
  };
  
  
  handleEditButton = async () => {
    try {
      const { draftMessage } = this.state;
      await AsyncStorage.setItem('whatsthat_draft_message', draftMessage);
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

  render() {
    const { draftMessage } = this.state;

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={draftMessage}
          onChangeText={this.handleEditMessage}
        />
        <Button title="Edit" onPress={this.handleEditButton} />
        <Button title="Send Draft" onPress={this.handleSendDraft} />
        <Button title="Delete Draft" onPress={this.handleDeleteDraft} />
        <Button title="Cancel" onPress={this.handleCancel} />
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
  },
});

export default DraftMessageScreen;
