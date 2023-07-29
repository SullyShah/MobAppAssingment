import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
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
      errorMessage: '', 
    };
  }

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  Signup = async () => {
    const {
      first_name, last_name, email, password, confirmPassword,
    } = this.state;

    if (first_name === '' || last_name === '' || email === '' || password === '' || confirmPassword === '') {
      this.setState({
        modalVisible: true,
        errorMessage: 'Please fill in all the relevant fields',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.setState({
        modalVisible: true,
        errorMessage: 'Invalid email address. Please enter a valid email address.',
      });
      return;
    }
    
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      this.setState({
        modalVisible: true,
        errorMessage: 'Invalid password. Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
      return;
    }    

    if (password !== confirmPassword) {
      this.setState({
        modalVisible: true,
        errorMessage: 'Passwords do not match',
      });
      return;
    }

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
  
      if (!response.ok) {
        let errorMessage = 'Error: ' + response.status;
        if (response.status === 400) {
          const errorJson = await response.json();
          if (errorJson.message && errorJson.message.includes('email already taken')) {
            errorMessage = 'Bad Rquest. Email is already taken. Please use a different one.';
          } else {
            errorMessage = 'Server Error';
          }
        }
        this.setState({ errorMessage, modalVisible: true });
        return;
      }
  
      const text = await response.text();
      let responseJson = {};
      if (text) {
        try {
          responseJson = JSON.parse(text);
        } catch (error) {
          this.setState({ errorMessage: 'Unable to process the server response', modalVisible: true });
          return;
        }
      }
  
      if (response.status === 201) {
        this.setState({ modalVisible: true });
        await AsyncStorage.setItem('whatsthat_user_id', responseJson.user_id.toString());
      }
    } catch (error) {
      this.setState({ errorMessage: error.message, modalVisible: true });
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
      errorMessage,
    } = this.state;
    const { navigation } = this.props;

    const showFirstNameError = first_name === '' && errorMessage !== '';
    const showLastNameError = last_name === '' && errorMessage !== '';
    const showEmailError = email === '' && errorMessage !== '';
    const showPasswordError = password === '' && errorMessage !== '';
    const showConfirmPasswordError = confirmPassword === '' && errorMessage !== '';

    return (
      <View style={styles.container}>
        <Text style={styles.title}>To Register enter your details below:</Text>
        <View>
          {showFirstNameError && (
            <Text style={styles.errorMessage}> First name is required </Text>
          )}
          <TextInput
            placeholder="Enter Your First Name:"
            onChangeText={(text) => this.setState({ first_name: text })}
            value={first_name}
            style={styles.input}
          />
        </View>

        <View>
          {showLastNameError && (
            <Text style={styles.errorMessage}>Last name is required</Text>
          )}
          <TextInput
            placeholder="Enter Your Last Name:"
            onChangeText={(text) => this.setState({ last_name: text })}
            value={last_name}
            style={styles.input}
          />
        </View>

        <View>
          {showEmailError && (
            <Text style={styles.errorMessage}>Email is required</Text>
          )}
          <TextInput
            placeholder="Enter Your Email:"
            onChangeText={(text) => this.setState({ email: text })}
            value={email}
            style={styles.input}
          />
        </View>

        <View>
          {showPasswordError && (
            <Text style={styles.errorMessage}>Password is required</Text>
          )}
          <TextInput
            placeholder="Enter Your Password:"
            onChangeText={(text) => this.setState({ password: text })}
            value={password}
            style={styles.input}
          />
        </View>

        <View>
          {showConfirmPasswordError && (
            <Text style={styles.errorMessage}>Confirm Password is required</Text>
          )}
          <TextInput
            placeholder="Enter Your Password Again:"
            onChangeText={(text) => this.setState({ confirmPassword: text })}
            value={confirmPassword}
            style={styles.input}
          />
        </View>

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
              <Text style={styles.modalText}>
                {errorMessage || 'Account created successfully!'}
              </Text>
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
