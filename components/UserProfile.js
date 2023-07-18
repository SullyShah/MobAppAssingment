import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 50,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
});

class UserProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        first_name: '',
        last_name: '',
        email: '',
        user_id: '',
        profilePicture: '',
      },
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener('focus', () => {
      this.getCurrentUserInfo();
      this.GPI();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleEditProfile = () => {
    const { navigation } = this.props;
    navigation.navigate('EditProfile');
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
      throw new Error('Error');
    }
  };

  LogOut = async () => {
    const { navigation } = this.props;
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });

      if (response.status === 200) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('Login');
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      throw new Error(error.toString());
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
    } catch (err) {
      throw new Error('error', err);
    }
  };

  render() {
    const { user } = this.state;

    return (
      <View style={styles.container}>
        <Image source={{ uri: user.profilePicture }} style={styles.profilePicture} />
        <Text style={styles.label}>First Name:</Text>
        <Text style={styles.text}>{user.first_name}</Text>
        <Text style={styles.label}>Last Name:</Text>
        <Text style={styles.text}>{user.last_name}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.text}>{user.email}</Text>
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.text}>{user.user_id}</Text>
        <Button title="Edit Profile" onPress={this.handleEditProfile} />
        <TouchableOpacity style={styles.logoutButton} onPress={this.LogOut}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

UserProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};

export default UserProfileScreen;
