import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF5E2',
  },
  titleContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Kanit',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signup: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  button: {
    marginBottom: 10,
    width: '100%',
    height: 40,
  },
  signUpButton: {
    backgroundColor: 'gray',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
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
    marginBottom: 10,
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

class LoginScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      modalVisible: false,
      errorModalVisible: false,
    };
  }

  isValidEmail = (email) => {
    const check = /\S+@\S+\.\S+/;
    return check.test(email);
  };

  isValidPassword = (password) => {
    const check = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return check.test(password);
  };

  showErrorModal() {
    this.setState({ errorModalVisible: true });
  }

  hideErrorModal() {
    this.setState({ errorModalVisible: false });
  }

  hideModal() {
    this.setState({ modalVisible: false }, () => {});
  }

  login() {
    const { email, password } = this.state;
    const { navigation } = this.props;

    if (!this.isValidEmail(email)) {
      this.setState({ error: 'Please enter a valid email address.' }, () => {
        this.showErrorModal();
      });
      return;
    }

    if (!this.isValidPassword(password)) {
      this.setState(
        {
          error:
            'Password Incorrect',
        },
        () => {
          this.showErrorModal();
        },
      );
      return;
    }

    const { email: userEmail, password: userPassword } = this.state;
    const toSend = {
      email: userEmail,
      password: userPassword,
    };

    fetch('http://localhost:3333/api/1.0.0/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSend),
    })
      .then((response) => {
        if (response.status === 200) {
          this.setState({ error: '', modalVisible: true });
          return response.json();
        } 
        if(response.status === 400) {
          throw new Error('Invalid Email/ Password Supplied');
        }
        throw new Error(`Server Error - Status: ${response.status}`);
      })
      .then(async (rJson) => {
        try {
          await AsyncStorage.setItem('whatsthat_user_id', rJson.id.toString());
          await AsyncStorage.setItem('whatsthat_session_token', rJson.token);
        } catch (error) {
          throw new Error('Server Error:', error);
        }
        navigation.navigate('Main');
      })
      .catch((error) => {
        this.setState({ error: error.message }, () => {
          this.showErrorModal();
        });
      });    
  }

  render() {
    const {
      error,
      modalVisible,
      errorModalVisible,
    } = this.state;
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>WhatsThat</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.signup}>Sign In</Text>

          <View style={styles.inputContainer}>
            <Icon name="envelope" size={20} color="gray" style={styles.icon} />
            <TextInput
              placeholder="Email"
              onChangeText={(text) => this.setState({ email: text })}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="gray" style={styles.icon} />
            <TextInput
              placeholder="Password"
              secureTextEntry
              onChangeText={(text) => this.setState({ password: text })}
              style={styles.input}
            />
          </View>

          {error !== '' && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.buttonContainer}>
            <Button
              title="Log In"
              onPress={() => this.login()}
              style={styles.button}
            />

            <Button
              title="Sign Up"
              onPress={() => navigation.navigate('Signup')}
              style={[styles.button, styles.signUpButton]}
            />
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent
          visible={errorModalVisible}
          onRequestClose={() => this.hideErrorModal()}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{error}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => this.hideErrorModal()}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => this.hideModal()}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Login successful!</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => this.hideModal()}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}
LoginScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default LoginScreen;
