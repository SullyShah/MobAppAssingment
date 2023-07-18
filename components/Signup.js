import React, { Component } from 'react';
import {
  Text, View, Button, TextInput, Modal, TouchableOpacity, StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    padding: 10,
  },
  input: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    margin: 10,
  },
  button: {
    margin: 10,
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
    fontSize: 18,
  },
  modalButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

class SignupScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      modalVisible: false,
    };
  }

  closeModal = () => {
    const { navigation } = this.props;
    this.setState({ modalVisible: false });
    navigation.navigate('Login');
  };

  Signup = async () => {
    const {
      first_name, last_name, email, password,
    } = this.state;

    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password,
        }),
      });

      if (response.status === 201) {
        const text = await response.text();
        const responseJson = JSON.parse(text);
        this.setState({ modalVisible: true });
        await AsyncStorage.setItem('whatsthat_user_id', responseJson.user_id.toString());
      } else if (response.status === 400) {
        throw new Error('Bad Request');
      } else {
        throw new Error('Something Went Wrong');
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  render() {
    const {
      first_name,
      last_name,
      email,
      password,
      confirmPassword,
      modalVisible,
    } = this.state;
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>To Register enter your details below:</Text>

        <TextInput
          placeholder="Enter Your First Name:"
          onChangeText={(text) => this.setState({ first_name: text })}
          value={first_name}
          style={styles.input}
        />

        <TextInput
          placeholder="Enter Your Last Name:"
          onChangeText={(text) => this.setState({ last_name: text })}
          value={last_name}
          style={styles.input}
        />

        <TextInput
          placeholder="Enter Your Email:"
          onChangeText={(text) => this.setState({ email: text })}
          value={email}
          style={styles.input}
        />

        <TextInput
          placeholder="Enter Your Password:"
          onChangeText={(text) => this.setState({ password: text })}
          value={password}
          style={styles.input}
        />

        <TextInput
          placeholder="Enter Your Password Again:"
          onChangeText={(text) => this.setState({ confirmPassword: text })}
          value={confirmPassword}
          style={styles.input}
        />

        <Button
          title="Register"
          onPress={() => this.Signup()}
          style={styles.button}
        />

        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          style={styles.button}
        />

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => this.closeModal()}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Account created successfully!</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => this.closeModal()}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

SignupScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default SignupScreen;
