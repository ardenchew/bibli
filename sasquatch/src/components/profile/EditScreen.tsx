import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import LogoutButton from '../../components/header/Logout';
import Button from '../../components/button/Button';
import {useAuth0} from 'react-native-auth0';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserContext} from '../../context';
import {useUsersApi} from '../../api';
import {UserPut, UserRead} from '../../generated/jericho';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

interface SubmitButtonProps {
  updateUser: UserPut;
}

const SubmitButton = ({updateUser}: SubmitButtonProps) => {
  const usersApi = useUsersApi();
  const {user: bibliUser, setUser: setBibliUser} = useContext(UserContext);

  const onPress = async () => {
    usersApi
      .putUserUserPut(updateUser)
      .then(response => {
        const responseUser: UserRead = response.data;
        setBibliUser(responseUser);
        console.log('User updated:', responseUser);
      })
      .catch(createError => {
        console.error('Error creating user:', createError);
      });
  };

  return (
    <Button
      onPress={onPress}
      mode="contained"
      disabled={bibliUser === updateUser}
      style={styles.submitButton}>
      Finish
    </Button>
  );
};

const EditScreen = ({navigation}: Props) => {
  const {user} = useAuth0();
  const {user: bibliUser} = useContext(UserContext);
  const [firstName, setFirstName] = useState(
    user?.givenName ? user.givenName : '',
  );
  const [lastName, setLastName] = useState(
    user?.familyName ? user.familyName : '',
  );
  const [firstNameWarn, setFirstNameWarn] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <LogoutButton />,
    });
  }, [navigation]);

  const handleFirstNameChange = (newFirstName: string) => {
    setFirstName(newFirstName);
    setFirstNameWarn(newFirstName === '');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.headline}>
        Edit Profile
      </Text>
      <View style={styles.textInputView}>
        <Text variant="titleMedium">What shall we call you?</Text>
        <TextInput
          label={'First name*'}
          textContentType="name"
          mode="outlined"
          defaultValue={firstName}
          maxLength={20}
          error={firstNameWarn}
          onChangeText={handleFirstNameChange}
        />
        <TextInput
          label={'Last name'}
          textContentType="name"
          mode="outlined"
          defaultValue={lastName}
          maxLength={20}
          onChangeText={newText => setLastName(newText)}
        />
      </View>
      <SubmitButton firstName={firstName} lastName={lastName} />
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
  submitButton: {
    alignSelf: 'center',
  },
});

export default EditScreen;
