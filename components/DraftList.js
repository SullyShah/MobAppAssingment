import React, { Component } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DraftListScreen extends Component {
  state = {
    drafts: [],
  };

  componentDidMount() {
    const chat_id = this.props.route.params.chat_id;
    this.loadDrafts(chat_id);
  }

  loadDrafts = async (chat_id) => {
    const keys = await AsyncStorage.getAllKeys();
    const draftKeys = keys.filter((key) =>
      key.startsWith(`whatsthat_draft_message_${chat_id}`)
    );
    const draftValues = await AsyncStorage.multiGet(draftKeys);
    const drafts = draftValues.map(([key, value]) => ({ key, value }));
    this.setState({ drafts });
  };

  handleSelectDraft = (draftMessageKey) => {
    this.props.navigation.navigate('DraftMessage', { draftMessageKey });
  };

  renderEmptyList = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You have no saved drafts!</Text>
      </View>
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.drafts.length === 0 ? (
          this.renderEmptyList()
        ) : (
          <FlatList
            data={this.state.drafts}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => this.handleSelectDraft(item.key)}
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                }}
              >
                <Text style={{ fontSize: 18 }}>{item.value}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DraftListScreen;
