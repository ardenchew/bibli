import React from 'react';
import Button from '../components/Button/Button';
import {StyleSheet, View} from 'react-native';
import {useAuth0} from 'react-native-auth0';
import {Text, TextInput} from 'react-native-paper';
import {Button as NativeButton} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

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
