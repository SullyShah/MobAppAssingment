import React, { Component } from 'react';
import { Text, View, Image, Button, StyleSheet, data } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        first_name: '',
        last_name: '',
        email: '',
        user_id: '',
        profilePicture: data
      },
      isLoading: false
    };
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.getCurrentUserInfo();
      this.GPI();
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }  
  

  handleEditProfile = () => {
    this.props.navigation.navigate('EditProfile');
  };


  getCurrentUserInfo = async () => {
    const user_id = await AsyncStorage.getItem('whatsthat_user_id');
    const session_token = await AsyncStorage.getItem('whatsthat_session_token');
    console.log("Session token:", session_token);

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
        throw 'Unauthorised';
      } else if (response.status === 404) {
        throw 'Not Found';
      } else {
        throw 'Server Error';
      }
    } catch (error) {
      Alert.alert('Error', error.toString());
    }
  };

  LogOut = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });
  
      if (response.status === 200) {
        // Clear user-related data from AsyncStorage or perform any necessary cleanup
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
  
        // Redirect to login or initial screen
        this.props.navigation.navigate('Login');
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
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
      let response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/photo`, {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        }
      });
  
      let resBlob = await response.blob();
      let data = URL.createObjectURL(resBlob);
  
      this.setState(prevState => ({
        user: {
          ...prevState.user,
          profilePicture: data
        },
        isLoading: false
      }));
    } catch(err) {
      console.log("error", err);
    }
  };
  

  handleEditProfile = () => {
    this.props.navigation.navigate('EditProfile');
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
        <Button title="Log Out" onPress={this.LogOut} />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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

export default ProfileScreen;