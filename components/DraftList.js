import React, { Component } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  draftItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  draftText: {
    fontSize: 18,
  },
});

class DraftListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drafts: [],
    };
  }

  componentDidMount() {
    const {
      route: {
        params: { chat_id },
      },
    } = this.props;
    this.loadDrafts(chat_id);
  }

  loadDrafts = async (chat_id) => {
    const keys = await AsyncStorage.getAllKeys();
    const draftKeys = keys.filter((key) => key.startsWith(`whatsthat_draft_message_${chat_id}`));
    const draftValues = await AsyncStorage.multiGet(draftKeys);
    const drafts = draftValues.map(([key, value]) => ({ key, value }));
    this.setState({ drafts });
  };

  handleSelectDraft = (draftMessageKey) => {
    const { navigation, route } = this.props;
    const { chat_id } = route.params;
    navigation.navigate('DraftMessage', { chat_id, draftMessageKey });
  };

  static renderEmptyList() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You have no saved drafts!</Text>
      </View>
    );
  }

  render() {
    const { drafts } = this.state;
    return (
      <View style={styles.container}>
        {drafts.length === 0 ? (
          DraftListScreen.renderEmptyList()
        ) : (
          <FlatList
            data={drafts}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => this.handleSelectDraft(item.key)}
                style={styles.draftItem}
              >
                <Text style={styles.draftText}>{item.value}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }
}

DraftListScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      chat_id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  navigation: PropTypes.shape({
    addListener: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default DraftListScreen;
