import React, { Component } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DraftListScreen extends Component {
  state = {
    drafts: [],
  };

  componentDidMount() {
    this.loadDrafts();
  }

  loadDrafts = async () => {
    const { chat_id } = this.props; // access chat_id from props
    const keys = await AsyncStorage.getAllKeys();
    const draftKeys = keys.filter(key => key.startsWith(`whatsthat_draft_message_${chat_id}`));
    const draftValues = await AsyncStorage.multiGet(draftKeys);
    const drafts = draftValues.map(([key, value]) => ({key, value}));
  
    this.setState({ drafts });
  }

  handleSelectDraft = (draftMessageKey) => {
    this.props.navigation.navigate('DraftMessage', { draftMessageKey });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={this.state.drafts}
          keyExtractor={(item) => item[0]} // Use the draft key as the unique key
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => this.handleSelectDraft(item[0])}
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
              }}
            >
<Text style={{ fontSize: 18 }}>{item[1]}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
}

export default DraftListScreen;
