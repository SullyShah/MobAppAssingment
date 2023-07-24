// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, { Component } from 'react';
// import { Text, View, Button } from 'react-native';


// class MainScreen extends Component{
//   constructor(props) {
//     super(props);
//     this.state = {
//       user_id: '',
//       first_name: '',
//       last_name: '',
//       email: '',
//       password: '',
//       isLoading: true,
//     };

//   }
//   static navigationOptions = {
//     header: null
//   }

//   async componentDidMount() {
//     this.checkLoggedIn();
//     this.unsubscribe = this.props.navigation.addListener('focus', () => {
//       this.checkLoggedIn();
//     });
//   }

//   checkLoggedIn = async () => {
//     const value = await AsyncStorage.getItem('whatsthat_session_token');
//     if (value != null) {
//       this.props.navigation.navigate('MainTabs');
//     } else {
//       this.props.navigation.navigate('Login');
//     }
//   };
  

//   async Logout() {
//     console.log('Logout');
  
//     const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');
  
//     if (!sessionToken) {
//       console.log('No session token found');
//       await AsyncStorage.removeItem('whatsthat_user_id');
//       this.props.navigation.navigate('Login');
//       return;
//     }
  
//     return fetch('http://localhost:3333/api/1.0.0/logout', {
//       method: 'POST',
//       headers: {
//         Authorization: sessionToken,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({}), 
//     })
//       .then(async (Response) => {
//         if (Response.status === 200) {
//           await AsyncStorage.removeItem('whatsthat_session_token');
//           await AsyncStorage.removeItem('wahtsthat_user_id');
//           this.props.navigation.navigate('Login');
//         } else if (Response.status === 401) {
//           console.log('Unauthorized');
//           await AsyncStorage.removeItem('whatsthat_session_token');
//           await AsyncStorage.removeItem('whatsthat_user_id');
//           this.props.navigation.navigate('Login');
//         } else {
//           throw 'Something Went Wrong';
//         }
//       })
//       .catch((error) => {
//         this.setState({ error: error });
//         this.setState({ Submitted: false });
//       });
//   }
  
  

//   async GetUserId(){
//     console.log("Logout")

//     return fetch("http://localhost:3333/+id",{
//       method: "GET",
//       headers: {
//         "X-Authorisation": await AsyncStorage.getItem("whatsthat_user_id")
//       }
//     })
//   }

//   async UpdateUserId(){
//     console.log("Logout")

//     return fetch("http://localhost:3333/+id",{
//       method: "PATCH",
//       headers: {
//         "X-Authorisation": await AsyncStorage.getItem("whatsthat_user_id"),
//         body: JSON.stringify({
//           "first_name": this.state.first_name,
//           "last_name": this.state.last_name,
//           "email": this.state.email,
//           "password": this.state.password
//           })
//       }
//     })
//   }


//   async GetProfilePhoto() {
//     return fetch('http://localhost:3333/api/1.0.0/user/photo', {
//       method: 'GET',
//       headers: {
//         'X-Authorisation': await AsyncStorage.getItem('whatsthat_session_token'),
//       },
//     })
//       .then(async (response) => {
//         if (response.status === 200) {
//           await AsyncStorage.removeItem('whatsthat_session_token');
//           await AsyncStorage.removeItem('wahtsthat_user_id');
//           this.props.navigation.navigate('Login');
//         } else if (response.status === 401) {
//           console.log('Unauthorized');
//           await AsyncStorage.removeItem('whatsthat_session_token');
//           await AsyncStorage.removeItem('whatsthat_user_id');
//           this.props.navigation.navigate('Login');
//         } else if (response.status === 404) {
//           console.log('Not Found');
//         } else {
//           throw 'Server Error';
//         }
//       })
//       .catch((error) => {
//         this.setState({ error: error });
//         this.setState({ Submitted: false });
//       });
//   }
  

//   async GetProfilePhoto() {
//     return fetch('http://localhost:3333/api/1.0.0/user/photo', {
//       method: 'GET',
//       headers: {
//         'X-Authorisation': await AsyncStorage.getItem('whatsthat_session_token'),
//       },
//     })
//       .then(async (response) => {
//         if (response.status === 200) {
//           await AsyncStorage.removeItem('whatsthat_session_token');
//           await AsyncStorage.removeItem('wahtsthat_user_id');
//           this.props.navigation.navigate('Login');
//         } else if (response.status === 401) {
//           console.log('Unauthorized');
//           await AsyncStorage.removeItem('whatsthat_session_token');
//           await AsyncStorage.removeItem('whatsthat_user_id');
//           this.props.navigation.navigate('Login');
//         } else if (response.status === 401) {
//           console.log('Unauthorized');
//         } else if (response.status === 403) {
//           console.log('Forbidden');
//         } else if (response.status === 404) {
//           console.log('Not Found');
//           } else {
//           throw 'Server Error';
//         }
//       })
//       .catch((error) => {
//         this.setState({ error: error });
//         this.setState({ Submitted: false });
//       });
//   }
  
//   async SearchForUsers(searchTerm) {
//     return fetch("http://localhost:3333/api/1.0.0/search_user?q=${searchTerm}", {
//       method: 'GET',
//       headers: {
//         'X-Authorisation': await AsyncStorage.getItem('whatsthat_session_token'),
//         'Content-Type': 'application/json',
//       },
//     })
//       .then(async (response) => {
//         if (response.status === 200) {
//           return response.json();
//         } else if (response.status === 401) {
//           console.log('Unauthorized');
//           await AsyncStorage.removeItem('whatsthat_session_token');
//           await AsyncStorage.removeItem('whatsthat_user_id');
//           this.props.navigation.navigate('Login');
//         } else if (response.status === 404) {
//           console.log('Not Found');
//         } else {
//           throw 'Server Error';
//         }
//       })
//       .catch((error) => {
//         this.setState({ error: error });
//         this.setState({ Submitted: false });
//       });
//   }
  


//   render(){

//     const navigation = this.props.navigation;
//     return(
//         <View>
//           <Text>This is the page you will see when you log in</Text>
//           <Button 
//             title='Back'
//             onPress={() => this.props.navigation.goBack()} />
//             <Button 
//             title='Logout'
//             onPress={() => this.Logout('Login')} />
//         </View>
//     );
//   }
// }

// export default MainScreen;
