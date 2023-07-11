import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

class CameraScreen1 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasPermission: null,
      type: Camera.Constants.Type.back,
      user_id: null,
      image: null,
    };
  }

  async componentDidMount() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    this.setState({ hasPermission: status === 'granted' });
  }

  handleBackPress = () => {
    this.props.navigation.goBack();
  };

  handleFlipCamera = () => {
    this.setState(prevState => ({
      type:
        prevState.type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back,
    }));
  };

  sendToServer = async (data) => {
    let user_id = await AsyncStorage.getItem('whatsthat_user_id');
    let token = await AsyncStorage.getItem('whatsthat_session_token');

    if (user_id === null || token === null) {
      console.error('user_id or token is null');
      return;
    }

    let res = await fetch(data.base64);
    let blob = await res.blob();

    return fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
      body: blob,
    })
      .then((response) => {
        console.log('Picture added', response);
        this.setState({ image: data.uri });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  takePicture = async () => {
    if (this.camera) {
      const options = {
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      };
      let photo = await this.camera.takePictureAsync(options);
      this.sendToServer(photo);
    }
  };

  render() {
    if (this.state.hasPermission) {
      return (
        <View style={styles.container}>
          <Camera style={styles.camera} type={this.state.type} ref={(ref) => (this.camera = ref)}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={this.handleBackPress}>
                <Text style={styles.text}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={this.handleFlipCamera}>
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={this.takePicture}>
                <Text style={styles.text}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </Camera>
          {this.state.image && <Image source={{ uri: this.state.image }} style={styles.preview} />}
        </View>
      );
    } else {
      return <Text>No access to camera</Text>;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: 'transparent',
    padding: 10,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
  preview: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
});

export default CameraScreen1;
