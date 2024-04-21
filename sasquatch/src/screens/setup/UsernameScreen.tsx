import React, {useContext, useEffect, useState} from 'react';
import Button from '../../components/button/Button';
import LogoutButton from '../../components/header/Logout';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
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
      style={{alignSelf: 'center'}}>
      Continue
    </Button>
  );
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
    <SafeAreaView style={{margin: 20, flex: 1}}>
      <ScrollView
        contentContainerStyle={{gap: 20}}
        bounces={false}
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps={'handled'}>
        <Text variant="headlineSmall" style={{paddingBottom: 20}}>
          Welcome to Bibli{user?.givenName && <Text>, {user.givenName}</Text>}
        </Text>
        <Text variant="titleMedium">Provide a username to get started</Text>
        <View>
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
        <ContinueButton username={username} valid={valid} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UsernameScreen;
