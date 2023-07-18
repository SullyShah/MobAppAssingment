import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

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

class CameraScreen1 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasPermission: null,
      type: Camera.Constants.Type.back,
      image: null,
    };
  }

  async componentDidMount() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    this.setState({ hasPermission: status === 'granted' });
  }

  handleBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  handleFlipCamera = () => {
    this.setState((prevState) => ({
      type:
        prevState.type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back,
    }));
  };

  sendToServer = async (data) => {
    const user_id = await AsyncStorage.getItem('whatsthat_user_id');
    const token = await AsyncStorage.getItem('whatsthat_session_token');

    if (user_id === null || token === null) {
      return;
    }

    const res = await fetch(data.base64);
    const blob = await res.blob();

    fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
      body: blob,
    })
      .then(() => {
        this.setState({ image: data.uri });
      })
      .catch((err) => {
        throw new Error(err);
      });
  };

  takePicture = async () => {
    if (this.camera) {
      const options = {
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      };
      const photo = await this.camera.takePictureAsync(options);
      this.sendToServer(photo);
    }
  };

  render() {
    const { hasPermission, type, image } = this.state;

    if (hasPermission) {
      return (
        <View style={styles.container}>
          <Camera style={styles.camera} type={type} ref={(ref) => (this.camera = ref)}>
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
          {image && (
            <Image source={{ uri: image }} style={styles.preview} />
          )}
        </View>
      );
    }
    return <Text>No access to camera</Text>;
  }
}

CameraScreen1.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default CameraScreen1;
