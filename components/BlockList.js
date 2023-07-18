import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 5,
  },
  listContainer: {
    flexGrow: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  backText: {
    fontSize: 18,
    color: 'blue',
    textDecorationLine: 'underline',
    marginLeft: 10,
  },
});

const BlockedUserItem = ({ user, unblockUser }) => {
  const { first_name, last_name, user_id } = user;

  return (
    <View style={styles.userContainer}>
      <Text style={styles.userName}>{`${first_name} ${last_name}`}</Text>
      <Button title="Unblock User" onPress={() => unblockUser(user_id)} />
    </View>
  );
};

BlockedUserItem.propTypes = {
  user: PropTypes.shape({
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    user_id: PropTypes.number.isRequired,
  }).isRequired,
  unblockUser: PropTypes.func.isRequired,
};

class BlockedScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blockedUsers: [],
      searchQuery: '',
      modalVisible: false,
      modalContent: '',
    };
  }

  componentDidMount() {
    this.getBlockedList();
  }

  handleSearchChange = (searchQuery) => {
    this.setState({ searchQuery });
  };

  async getBlockedList() {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/blocked', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        this.setState({ blockedUsers: data });
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      throw new Error('Error');
    }
  }

  BackButton = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  unblockUser = async (user_id) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/block`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
      if (response.status === 200) {
        this.setState({ modalVisible: true, modalContent: 'User unblocked successfully' });
        this.getBlockedList();
      } else if (response.status === 400) {
        throw new Error("You can't unblock yourself");
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      this.setState({ modalVisible: true, modalContent: error.toString() });
    }
  };

  render() {
    const {
      blockedUsers,
      searchQuery,
      modalVisible,
      modalContent,
    } = this.state;
    let filteredBlockedUsers = blockedUsers;

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      filteredBlockedUsers = blockedUsers.filter((user) => searchRegex.test(`${user.first_name} ${user.last_name}`));
    }

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.BackButton} style={styles.header}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Search by name"
          onChangeText={this.handleSearchChange}
          value={searchQuery}
          style={styles.searchInput}
        />

        <FlatList
          data={filteredBlockedUsers}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <BlockedUserItem user={item} unblockUser={this.unblockUser} />
          )}
        />

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => {
            this.setState({ modalVisible: false });
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalContent}</Text>
              <Button
                title="Close"
                onPress={() => {
                  this.setState({ modalVisible: false });
                }}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

BlockedScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default BlockedScreen;
