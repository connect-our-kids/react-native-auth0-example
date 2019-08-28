import React from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import AuthSessionCustom from './AuthSessionCustom.js';
import jwtDecode from 'jwt-decode';

/*
  You need to swap out the Auth0 client id and domain with
  the one from your Auth0 client.
  In your Auth0 client, you need to also add a url to your authorized redirect urls.
  For this application, I added https://auth.expo.io/@arielweinberger/auth0-example because I am
  signed in as the "community" account on Expo and the slug for this app is "auth0-example" (check out app.json).

  You can open this app in the Expo client and check your logs to find out your redirect URL.
*/
const auth0ClientId = '3dKTXilDyoCV3YP06e90059KI6bPERYQ';
const auth0Domain = 'https://login.connectourkids.org';

/**
 * Converts an object to a query string.
 */
function toQueryString(params) {
  return '?' + Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export default class App extends React.Component {
  state = {
    name: null,
    email: null
  };

  login = async () => {
    // Retrieve the redirect URL, add this to the callback URL list
    // of your Auth0 application.
    const redirectUrl = "exp://127.0.0.1:19000/--/expo-auth-session";//AuthSession.getRedirectUrl();
    console.log(`Redirect URL: ${redirectUrl}`);
    
    // Structure the auth parameters and URL
    const queryParams = toQueryString({
      client_id: auth0ClientId,
      redirect_uri: redirectUrl,
      response_type: 'id_token', // id_token will return a JWT token
      scope: 'openid profile email', // retrieve the user's profile
      nonce: 'nonce', // ideally, this will be a random value
    });
    const authUrl = `${auth0Domain}/authorize` + queryParams;

    // Perform the authentication
    const response = await AuthSessionCustom.startAsync({ authUrl });
    console.log('Authentication response', response);

    if (response.type === 'success') {
      this.handleResponse(response.params);
    }
  };

  handleResponse = (response) => {
    if (response.error) {
      Alert('Authentication error', response.error_description || 'something went wrong');
      return;
    }

    // Retrieve the JWT token and decode it
    const jwtToken = response.id_token;
    const decoded = jwtDecode(jwtToken);

    console.log(decoded);

    const { name,email } = decoded;
    this.setState({ name,email });
  };

  render() {
    const { name,email } = this.state;

    return (
      <View style={styles.container}>
        {
          name ?
          <Text style={styles.title}>You are logged in, {email}!</Text> :
          <Button title="Log in with Auth0" onPress={this.login} />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
});
