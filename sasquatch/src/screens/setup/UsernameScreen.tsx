import React, {useContext, useEffect, useState} from 'react';
import Button from '../../components/button/Button';
import LogoutButton from '../../components/header/Logout';
import {StyleSheet, View} from 'react-native';
import {useAuth0} from 'react-native-auth0';
import {Text, TextInput, HelperText} from 'react-native-paper';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserPut, UserRead} from '../../generated/jericho';
import {ApiContext, UserContext} from '../../context';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

interface ContinueButtonProps {
  username: string;
  valid: boolean;
}

const ContinueButton = ({username, valid}: ContinueButtonProps) => {
  const {usersApi} = useContext(ApiContext);
  const {user: bibliUser, setUser: setBibliUser} = useContext(UserContext);

  const fetchUser = async () => {
    try {
      const response = await usersApi.getUserUserCurrentGet();
      setBibliUser(response.data);
    } catch (error) {
      console.log('No user found:', error);
    }
  };

  const setUsername = async (tag: string) => {
    const updatedUser: UserPut = {
      name: bibliUser?.name,
      tag: tag,
      id: bibliUser?.id,
    };
    usersApi
      .putUserUserPut(updatedUser)
      .then(response => {
        const responseUser: UserRead = response.data;
        setBibliUser(responseUser);
        console.log('User updated:', responseUser);
      })
      .catch(createError => {
        console.error('Error creating user:', createError);
      });
  };

  const onPress = async () => {
    await fetchUser().catch(error => console.log(error));
    await setUsername(username).catch(error => console.log(error));
  };

  return (
    <Button
      onPress={onPress}
      mode="contained"
      disabled={!valid}
      style={styles.continueButton}>
      Continue
    </Button>
  );
};

const UserText = () => {
  const {usersApi} = useContext(ApiContext);
  const [bibliUser, setBibliUser] = useState<UserRead | null>(null);

  useEffect(() => {
    usersApi
      .getUserUserCurrentGet()
      .then(response => {
        const userData: UserRead = response.data;
        setBibliUser(userData);
      })
      .catch(error => console.log(error));
  }, [usersApi]);

  return <Text>{bibliUser?.tag}</Text>;
};

const UsernameScreen = ({navigation}: Props) => {
  const {user} = useAuth0();
  const {usersApi} = useContext(ApiContext);
  const [username, setUsername] = useState('');
  const [valid, setValid] = useState(false);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <LogoutButton />,
    });
  }, [navigation]);

  const handleUsernameChange = async (newUsername: string) => {
    setUsername(newUsername);
    try {
      const response = await usersApi.validateTagUserValidateTagGet(
        newUsername,
      );
      setValid(response.data.valid);
      setWarning(response.data.warning ? response.data.warning : '');
    } catch (error) {
      console.error('Error validating username:', error);
      // Handle error (e.g., show an error message)
    }
  };

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
          error={!!warning}
          onChangeText={handleUsernameChange}
          autoFocus={true}
        />
        {warning && (
          <HelperText type="error" visible={!!warning}>
            {warning}
          </HelperText>
        )}
      </View>
      <UserText />
      <ContinueButton username={username} valid={valid} />
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
