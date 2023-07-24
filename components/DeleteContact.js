import React, { Component } from 'react';
import { Text, View, TextInput, Button, Modal, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DeleteConntactScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      user_id: '',
      modalVisible: false,
    };
  }

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  };

  DeleteUser = async (user_id) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/contact`, {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.state.user_id,
        }),
      });

      if (response.status === 200) {
        this.setModalVisible(true);
        this.props.route.params.onRefreshContacts();
        this.props.navigation.goBack();
      } else if (response.status === 400) {
        throw 'You Cant remove yourself as a contact';
      } else if (response.status === 404) {
        throw 'Unauthorised';
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const { modalVisible } = this.state;

    return (
      <View>
        <Text>This is the Delete Contacts screen</Text>
        <TextInput
          placeholder="Enter The User Id Of The Person You Want To Delete"
          onChangeText={(user_id) => this.setState({ user_id })}
          value={this.state.user_id}
          style={{
            padding: 10,
            borderWidth: 2,
            borderRadius: 5,
            margin: 10,
          }}
        />

        <Button title="Delete Contact" onPress={() => this.DeleteUser(this.state.user_id)} />

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => {
            this.setModalVisible(!modalVisible);
          }}
          style={{ zIndex: 999 }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
              <Text>Contact deleted successfully</Text>
              <TouchableOpacity
                style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5, marginTop: 10 }}
                onPress={() => {
                  this.setModalVisible(!modalVisible);
                }}
              >
                <Text style={{ color: 'white' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default DeleteConntactScreen;
