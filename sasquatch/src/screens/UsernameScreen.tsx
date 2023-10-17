import React, {useEffect, useState} from 'react';
import Button from '../components/Button/Button';
import {StyleSheet, View} from 'react-native';
import {useAuth0} from 'react-native-auth0';
import {Text, TextInput} from 'react-native-paper';
import {Button as NativeButton} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {apiConfig, usersApi} from '../api';
import {UserRead} from '../generated/jericho';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

const LogoutButton = () => {
  const {clearCredentials} = useAuth0();

  const onPress = async () => {
    try {
      await clearCredentials();
    } catch (e) {
      console.log(e);
    }
  };

  return <NativeButton title="Log out" onPress={onPress} />;
};

const ContinueButton = ({navigation}: Props) => {
  const onPress = () => {
    navigation.navigate('Biography');
  };

  return (
    <Button onPress={onPress} mode="contained" style={styles.continueButton}>
      Continue
    </Button>
  );
};

const UserText = () => {
  const {getCredentials, user} = useAuth0();
  const [bibliUser, setBibliUser] = useState<UserRead | null>(null);

  useEffect(() => {
    if (user) {
      // Fetch access token using Auth0's getCredentials function
      getCredentials().then(credentials => {
        // Update the accessToken property in apiConfig with the fetched token
        apiConfig.accessToken = credentials?.accessToken;
      });
    }
  }, [getCredentials, user]);

  useEffect(() => {
    console.log('this is my api', usersApi);
    usersApi
      .getUserUserTagGet('ardenchew')
      .then(response => {
        const userData: UserRead = response.data;
        setBibliUser(userData);
      })
      .catch(error => console.log(error));
  }, []);

  console.log(apiConfig.accessToken);
  console.log(bibliUser?.tag);

  return <Text>{bibliUser?.tag}</Text>;
};

const UsernameScreen = ({navigation}: Props) => {
  const {user} = useAuth0();
  navigation.setOptions({
    headerLeft: () => <LogoutButton />,
  });
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.headline}>
        Welcome to Bibli{user?.givenName && <Text>, {user.givenName}</Text>}
      </Text>
      <View style={styles.textInputView}>
        <Text variant="titleMedium">Provide a username to get started</Text>
        <TextInput
          label={'Username'}
          textContentType="username"
          autoCapitalize="none"
          mode="outlined"
          left={<TextInput.Affix text="@" />}
          maxLength={20}
        />
      </View>
      <UserText />
      <ContinueButton navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  headline: {
    flex: 1,
  },
  textInputView: {
    flex: 5,
    justifyContent: 'flex-start',
  },
  continueButton: {
    alignSelf: 'center',
  },
});

export default UsernameScreen;
