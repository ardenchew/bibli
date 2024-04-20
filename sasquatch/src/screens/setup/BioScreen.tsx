import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import LogoutButton from '../../components/header/Logout';
import Button from '../../components/button/Button';
import {useAuth0} from 'react-native-auth0';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ApiContext, UserContext} from '../../context';
import Toast from 'react-native-simple-toast';
import {EditAvatarButton} from '../../components/profile/Avatar';
import {UserRead} from '../../generated/jericho';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

interface FinishButtonProps {
  firstName: string;
  lastName: string;
  avatar?: string;
}

function displayName(first: string, last: string): string {
  return `${first.trim()} ${last.trim()}`.trim();
}

const FinishButton = ({firstName, lastName, avatar}: FinishButtonProps) => {
  const {usersApi} = useContext(ApiContext);
  const {user: bibliUser, setUser: setBibliUser} = useContext(UserContext);
  const [name, setName] = useState<string>(displayName(firstName, lastName));

  useEffect(() => {
    setName(displayName(firstName, lastName));
  }, [firstName, lastName]);

  const onPress = async () => {
    if (!bibliUser || name === '') {
      return;
    }
    try {
      if (avatar) {
        await usersApi.putAvatarUserAvatarUserIdPut(bibliUser.id, {
          uri: avatar,
          type: 'image/jpeg',
          name: 'avatar',
        });
      }
      const response = await usersApi.putUserUserPut({
        ...bibliUser,
        name: name,
      });
      setBibliUser(response.data);
    } catch (e) {
      console.log(e);
    } finally {
      Toast.showWithGravityAndOffset(
        'A warm welcome awaits you\n- J.R.R. Tolkien, The Hobbit',
        Toast.LONG,
        Toast.BOTTOM,
        0,
        -98,
      );
    }
  };

  return (
    <Button
      onPress={onPress}
      mode="contained"
      disabled={firstName.trim() === ''}
      style={{alignSelf: 'center'}}>
      Finish
    </Button>
  );
};

const BioScreen = ({navigation}: Props) => {
  const {user: auth0User} = useAuth0();
  const {user: bibliUser} = useContext(UserContext);
  const [firstName, setFirstName] = useState(auth0User?.givenName ?? '');
  const [lastName, setLastName] = useState(auth0User?.familyName ?? '');
  const [firstNameWarn, setFirstNameWarn] = useState(false);
  const [avatar, setAvatar] = useState<string>();
  const [avatarUser, setAvatarUser] = useState<UserRead | null>(bibliUser);

  useEffect(() => {
    const headerLeft = () => <LogoutButton />;
    navigation.setOptions({
      headerLeft: headerLeft,
    });
  }, [navigation]);

  const onFirstNameChange = (newFirstName: string) => {
    setFirstName(newFirstName);
    setFirstNameWarn(newFirstName.trim() === '');
  };

  useEffect(() => {
    setAvatarUser((u: UserRead | null) => {
      console.log(u);
      console.log(displayName(firstName, lastName));
      return u ? {...u, name: displayName(firstName, lastName)} : null;
    });
  }, [firstName, lastName]);

  return (
    <SafeAreaView style={{margin: 20, flex: 1}}>
      <ScrollView
        contentContainerStyle={{gap: 20}}
        bounces={false}
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps={'handled'}>
        <Text variant="headlineSmall">
          Hey there @{bibliUser?.tag}
        </Text>
        {avatarUser && (
          <View>
            <Text variant="titleMedium" style={{alignSelf: 'center'}}>Profile Picture</Text>
            <EditAvatarButton
              user={avatarUser}
              avatar={avatar}
              setAvatar={setAvatar}
              size={100}
            />
          </View>
        )}
        <View>
          <Text variant="titleMedium">What shall we call you?</Text>
          <TextInput
            label={'First name*'}
            textContentType="name"
            mode="outlined"
            defaultValue={firstName}
            maxLength={20}
            error={firstNameWarn}
            onChangeText={onFirstNameChange}
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
        <FinishButton
          firstName={firstName}
          lastName={lastName}
          avatar={avatar}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default BioScreen;
