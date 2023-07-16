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
    // Use AsyncStorage.getAllKeys and AsyncStorage.multiGet to fetch all drafts
    const keys = await AsyncStorage.getAllKeys();
    const draftKeys = keys.filter((key) => key.startsWith('whatsthat_draft_message_'));
    const drafts = await AsyncStorage.multiGet(draftKeys);
    this.setState({ drafts });
  };

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
