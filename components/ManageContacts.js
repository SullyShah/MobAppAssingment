import React, { Component } from 'react';
import { Text, View, Button, Alert, StyleSheet } from 'react-native';

class ManageContactScreen extends Component {
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
            onPress={() => this.props.navigation.navigate('Block')}
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
});

export default ManageContactScreen;
