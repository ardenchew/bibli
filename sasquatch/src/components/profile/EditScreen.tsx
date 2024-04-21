import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {HelperText, Text, TextInput} from 'react-native-paper';
import Button from '../../components/button/Button';
import {ApiContext, UserContext} from '../../context';
import {UserRead} from '../../generated/jericho';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {EditAvatarButton} from './Avatar';

const EqualUsers = (u1: UserRead, u2: UserRead): boolean => {
  return u1.name === u2.name && u1.tag === u2.tag && u1.bio === u2.bio;
};

interface SubmitButtonProps {
  user: UserRead;
  newUser: UserRead;
  disabled: boolean;
  avatar?: string;
}

const SubmitButton = ({user, newUser, disabled, avatar}: SubmitButtonProps) => {
  const {usersApi} = useContext(ApiContext);
  const {setUser: setBibliUser} = useContext(UserContext);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const onPress = async () => {
    try {
      if (avatar) {
        await usersApi.putAvatarUserAvatarUserIdPut(user.id, {
          uri: avatar,
          type: 'image/jpeg',
          name: 'avatar',
        });
      }
      if (!EqualUsers(newUser, user)) {
        await usersApi.putUserUserPut({
          ...user,
          name: newUser.name,
          tag: newUser.tag,
          bio: newUser.bio,
        });
      }
      const userResponse = await usersApi.getUserUserCurrentGet();
      setBibliUser(userResponse.data);
    } catch (e) {
      console.log(e);
    } finally {
      navigation.popToTop();
    }
  };

  return (
    <Button
      onPress={onPress}
      mode="contained"
      disabled={disabled}
      style={styles.submitButton}>
      Save
    </Button>
  );
};

const EditScreen = ({user}: {user: UserRead}) => {
  const {usersApi} = useContext(ApiContext);
  const [newUser, setNewUser] = useState<UserRead>(user);
  const [nameValid, setNameValid] = useState<boolean>(true);
  const [tagValid, setTagValid] = useState(true);
  const [tagWarn, setTagWarn] = useState('');
  const [disabled, setDisabled] = useState<boolean>(true);
  const [avatar, setAvatar] = useState<string>();

  useEffect(() => {
    setDisabled(
      (EqualUsers(user, newUser) && avatar === undefined) ||
        !nameValid ||
        !tagValid,
    );
  }, [avatar, nameValid, newUser, tagValid, user]);

  useEffect(() => {
    setNameValid(newUser.name ? newUser.name.trim() !== '' : false);
  }, [newUser.name]);

  const handleNameChange = (name: string) => {
    setNewUser({...newUser, name: name});
  };

  const handleTagChange = async (tag: string) => {
    if (newUser) {
      setNewUser({...newUser, tag: tag});
      if (tag !== user?.tag) {
        try {
          const response = await usersApi.validateTagUserValidateTagGet(tag);
          setTagValid(response.data.valid);
          setTagWarn(response.data.warning ? response.data.warning : '');
        } catch (error) {
          console.error('Error validating username:', error);
        }
      } else {
        setTagValid(true);
        setTagWarn('');
      }
    }
  };

  const handleBioChange = (bio: string) => {
    setNewUser({...newUser, bio: bio.trim() === '' ? undefined : bio});
  };

  return (
    <ScrollView
      style={styles.container}
      automaticallyAdjustKeyboardInsets={true}
      keyboardShouldPersistTaps={'handled'}>
      <Text variant="headlineSmall">
        Edit Profile
      </Text>
      <EditAvatarButton user={newUser} avatar={avatar} setAvatar={setAvatar} />
      <View style={styles.textInputView}>
        <TextInput
          label={'Username'}
          textContentType="username"
          autoCapitalize="none"
          mode="outlined"
          defaultValue={user?.tag}
          left={<TextInput.Affix text="@" />}
          maxLength={20}
          error={!!tagWarn}
          onChangeText={handleTagChange}
        />
        {tagWarn && (
          <HelperText type="error" visible={!!tagWarn}>
            {tagWarn}
          </HelperText>
        )}
      </View>
      <View style={styles.textInputView}>
        <TextInput
          label={'Name'}
          textContentType="name"
          mode="outlined"
          defaultValue={newUser?.name}
          maxLength={20}
          error={!nameValid}
          onChangeText={handleNameChange}
        />
      </View>
      <View style={styles.textInputView}>
        <TextInput
          label={'Bio'}
          mode="outlined"
          defaultValue={user?.bio}
          maxLength={50}
          onChangeText={handleBioChange}
        />
      </View>
      <SubmitButton
        user={user}
        newUser={newUser}
        disabled={disabled}
        avatar={avatar}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    gap: 10,
  },
  textInputView: {
    marginBottom: 10,
  },
  submitButton: {
    alignSelf: 'center',
  },
});

export default EditScreen;
