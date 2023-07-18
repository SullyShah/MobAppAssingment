import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicture: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 18,
    marginBottom: 10,
  },
  backButton: {
    width: '20%',
    position: 'absolute',
    bottom: 20,
  },
});

class EditProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        profilePicture: null,
      },
      successMessage: '',
      errorMessage: '',
      showModal: false,
    };
  }

  componentDidMount() {
    this.getCurrentUserInfo();
    this.GPI();
  }

  handleInputChange = (field, value) => {
    this.setState((prevState) => ({
      user: {
        ...prevState.user,
        [field]: value,
      },
    }));
  };

  navigateToCamera = () => {
    const { navigation } = this.props;
    navigation.navigate('Camera');
  };

  showSuccessModal = (message) => {
    this.setState({
      successMessage: message,
      errorMessage: '',
      showModal: true,
    });
  };

  showErrorModal = (message) => {
    this.setState({
      successMessage: '',
      errorMessage: message,
      showModal: true,
    });
  };

  closeSuccessModal = () => {
    const { navigation } = this.props;
    this.setState({
      successMessage: '',
      showModal: false,
    });
    navigation.navigate('Profile');
  };

  closeErrorModal = () => {
    this.setState({
      errorMessage: '',
      showModal: false,
    });
  };

  BackButton = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  getCurrentUserInfo = async () => {
    const user_id = await AsyncStorage.getItem('whatsthat_user_id');
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
      if (response.status === 200) {
        const user = await response.json();
        this.setState({ user });
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      this.showErrorModal(error.toString());
    }
  };

  updateUserInfo = async () => {
    const { user } = this.state;
    const user_id = await AsyncStorage.getItem('whatsthat_user_id');
    const data = {};

    if (!user.first_name || user.first_name.trim() === '') {
      this.showErrorModal('First name is required');
      return;
    }
    data.first_name = user.first_name;

    if (!user.last_name || user.last_name.trim() === '') {
      this.showErrorModal('Last name is required');
      return;
    }
    data.last_name = user.last_name;

    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      this.showErrorModal('Valid email is required');
      return;
    }
    data.email = user.email;

    if (user.password) {
      if (user.password.length < 8) {
        this.showErrorModal('Password should be at least 8 characters long');
        return;
      }

      if (!/\d/.test(user.password)) {
        this.showErrorModal('Password should contain at least one number');
        return;
      }

      if (!/[A-Z]/.test(user.password)) {
        this.showErrorModal('Password should contain at least one uppercase letter');
        return;
      }

      if (user.confirmPassword !== user.password) {
        this.showErrorModal('Confirm password does not match');
        return;
      }

      data.password = user.password;
    }

    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        this.showSuccessModal('User info updated successfully');
        await this.getCurrentUserInfo();
      } else if (response.status === 400) {
        throw new Error('Bad Request');
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
      } else if (response.status === 403) {
        throw new Error('Forbidden');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      this.showErrorModal(error.toString());
    }
  };

  GPI = async () => {
    const user_id = await AsyncStorage.getItem('whatsthat_user_id');

    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/photo`, {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });

      const resBlob = await response.blob();
      const data = URL.createObjectURL(resBlob);

      this.setState((prevState) => ({
        user: {
          ...prevState.user,
          profilePicture: data,
        },
      }));
    } catch (error) {
      this.showErrorModal(error.toString());
    }
  };

  render() {
    const {
      user,
      successMessage,
      errorMessage,
      showModal,
    } = this.state;

    return (
      <View style={styles.container}>
        <Image source={{ uri: user.profilePicture }} style={styles.profilePicture} />
        <Button title="Go to Camera" onPress={this.navigateToCamera} />

        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.input}
          value={user.first_name || ''}
          onChangeText={(text) => this.handleInputChange('first_name', text)}
        />

        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.input}
          value={user.last_name || ''}
          onChangeText={(text) => this.handleInputChange('last_name', text)}
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={user.email || ''}
          onChangeText={(text) => this.handleInputChange('email', text)}
        />

        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          secureTextEntry={false}
          value={user.password || ''}
          onChangeText={(text) => this.handleInputChange('password', text)}
        />

        <Text style={styles.label}>Confirm Password:</Text>
        <TextInput
          style={styles.input}
          secureTextEntry={false}
          value={user.confirmPassword || ''}
          onChangeText={(text) => this.handleInputChange('confirmPassword', text)}
        />

        <Button title="Update Info" onPress={this.updateUserInfo} />

        <View style={styles.backButton}>
          <Button
            title="Back"
            onPress={this.BackButton}
            style={styles.backButton}
          />
        </View>

        <Modal visible={showModal} animationType="fade" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>{successMessage || errorMessage}</Text>
              <Button title="Close" onPress={successMessage ? this.closeSuccessModal : this.closeErrorModal} />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

EditProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditProfileScreen;
