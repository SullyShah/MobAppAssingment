import React, { Component } from 'react';
import { Text, View, Button, TextInput, Modal, TouchableOpacity } from 'react-native';

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
    this.setState({ modalVisible: false });
    this.props.navigation.navigate('Login');
  };

  Signup = async () => {
    return fetch('http://localhost:3333/api/1.0.0/user', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
        password: this.state.password,
      }),
    })
      .then(async (response) => {
        if (response.status === 201) {
          const responseJson = await response.json();
          console.log('User Created With ID', responseJson);
          this.setState({ modalVisible: true }); // Show success modal
        await AsyncStorage.setItem('whatsthat_user_id', responseJson.id.toString());
        await AsyncStorage.setItem('whatsthat_session_token', responseJson.token); // Assuming the token is returned in the response as `responseJson.token`
        this.props.navigation.navigate("Login");
      }else if(response.status === 400){
        throw 'Bad Request';
      }else{
        throw 'Something Went Wrong';
      }
    })
  .catch((error) => {
    console.log(error);
  })
}


render() {
  return (
    <View>
      <Text style={{ fontSize: 20, padding: 10 }}>
        To Register enter your details below:
      </Text>


          <TextInput
              placeholder="Enter Your First Name:"
              onChangeText={(first_name) => this.setState({first_name})}
              value={this.state.first_name}
              style={{padding:10, borderWidth:2, borderRadius: 5, margin:10}}

          />


          <TextInput
              placeholder="Enter Your Last Name:"
              onChangeText={(last_name) => this.setState({last_name})}
              value={this.state.last_name}
              style={{padding:10, borderWidth:2, borderRadius: 5, margin:10}}

          />

          <TextInput
              placeholder="Enter Your Email:"
              onChangeText={(email) => this.setState({email})}
              value={this.state.email}
              style={{padding:10, borderWidth:2, borderRadius: 5, margin:10}}

          />


          <TextInput
              placeholder="Enter Your Password:"
              onChangeText={(password) => this.setState({password})}
              value={this.state.password}
              style={{padding:10, borderWidth:2, borderRadius: 5, margin:10}}
          />
          <TextInput
              placeholder="Enter Your Password Again:"
              onChangeText={(confirmPassword) => this.setState({confirmPassword})}
              value={this.state.confirmPassword}
              style={{padding:10, borderWidth:2, borderRadius: 5, margin:10}}

          />
 <Button title="Register" onPress={() => this.Signup()} />

<Button title="Back" onPress={() => this.props.navigation.goBack()} />

<Modal
  animationType="slide"
  transparent={true}
  visible={this.state.modalVisible}
  onRequestClose={() => this.closeModal()}
>
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 18 }}>Account created successfully!</Text>
      <TouchableOpacity
        style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5, marginTop: 10 }}
        onPress={() => this.closeModal()}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
</View>
);
}
}

export default SignupScreen;