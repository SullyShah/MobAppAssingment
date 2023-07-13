import React, { Component } from 'react';
import { Text, View, Button, TextInput, StyleSheet, Alert, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LoginScreen extends Component {
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

  static navigationOptions = {
    header: null,
  };

  showErrorModal() {
    this.setState({ errorModalVisible: true });
  }

  hideErrorModal() {
    this.setState({ errorModalVisible: false });
  }

  hideModal() {
    this.setState({ modalVisible: false }, () => {
    });
  }
  
  isValidEmail(email) {
    const check = /\S+@\S+\.\S+/;
    return check.test(email);
  }

  isValidPassword(password) {
    const check = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return check.test(password);
  }

  login() {
    if (!this.state.email || !this.state.password) {
      this.setState({ error: 'Please enter both email and password.' }, () => {
        this.showErrorModal();
      });
      return;
    }

    if (!this.isValidEmail(this.state.email)) {
      this.setState({ error: 'Please enter a valid email address.' }, () => {
        this.showErrorModal();
      });
      return;
    }

    if (!this.isValidPassword(this.state.password)) {
      this.setState({
        error:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
      }, () => {
        this.showErrorModal();
      });
      return;
    }

    const toSend = {
      email: this.state.email,
      password: this.state.password,
    };

    fetch('http://localhost:3333/api/1.0.0/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSend),
    })
      .then((response) => {
        console.log('login request sent');
        if (response.status === 200) {
          this.setState({ error: '', modalVisible: true });
          console.log(response);
          return response.json();        
        } else if (response.status === 400) {
          throw new Error('Invalid Email Or Password Entered');
        } else {
          throw new Error(`Server Error - Status: ${response.status}`);
        }
      })
      .then(async (rJson) => {
        console.log(rJson);
        try {
          await AsyncStorage.setItem('whatsthat_user_id', rJson.id.toString());
          await AsyncStorage.setItem('whatsthat_session_token', rJson.token);
          // Navigate to the Main screen here after successful login and storing the session token.
          this.props.navigation.navigate('Main');
        } catch (error) {
          console.log('Server Error:', error);
          throw new Error('Server Error');
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error: error.message }, () => {
          this.showErrorModal();
        });
      });
      
  }

  render() {
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
              secureTextEntry={true}
              onChangeText={(text) => this.setState({ password: text })}
              style={styles.input}
            />
          </View>

          {this.state.error !== '' && (
            <Text style={styles.errorText}>{this.state.error}</Text>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Log In"
              onPress={() => this.login()}
              style={styles.button}
            />

            <Button
              title="Sign Up"
              onPress={() => this.props.navigation.navigate('Signup')}
              style={[styles.button, styles.signUpButton]}
            />
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.errorModalVisible}
          onRequestClose={() => this.hideErrorModal()}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{this.state.error}</Text>
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
          transparent={true}
          visible={this.state.modalVisible}
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
  errorText: {    color: 'red',
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

export default LoginScreen;
