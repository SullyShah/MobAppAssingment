import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';

class ManageContactScreen extends Component {
  handleGoBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button
            title="Add Contact"
            onPress={() =>
              this.props.navigation.navigate('AddContact', {
                onRefreshContacts: this.refreshContactsList,
              })
            }
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Unblock Contact"
            onPress={() => this.props.navigation.navigate('BlockList')}
          />
        </View>

        <View style={styles.backButton}>
          <Button
            title="Back"
            onPress={this.handleGoBack}
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 20,
  },
  backButton: {
    width: '30%',
    position: 'absolute',
    bottom: 20,
  },  
});

export default ManageContactScreen;
