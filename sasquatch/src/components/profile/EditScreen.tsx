import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {HelperText, Text, TextInput} from 'react-native-paper';
import Button from '../../components/button/Button';
import {ApiContext, UserContext} from '../../context';
import {UserPut, UserRead} from '../../generated/jericho';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface SubmitButtonProps {
  updateUser: UserPut;
  disabled: boolean;
}

const SubmitButton = ({updateUser, disabled}: SubmitButtonProps) => {
  const {usersApi} = useContext(ApiContext);
  const {setUser: setBibliUser} = useContext(UserContext);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

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
    navigation.popToTop();
  };

  return (
    <Button
      onPress={onPress}
      mode="contained"
      disabled={disabled}
      style={styles.submitButton}>
      Submit
    </Button>
  );
};

const EditScreen = () => {
  const {usersApi} = useContext(ApiContext);
  const {user: bibliUser} = useContext(UserContext);

  const [updateUser, setUpdateUser] = useState<UserPut>({
    id: bibliUser?.id,
    name: bibliUser?.name,
    tag: bibliUser?.tag,
    bio: bibliUser?.bio,
  });
  const [nameValid, setNameValid] = useState(true);
  const [tagValid, setTagValid] = useState(true);
  const [tagWarn, setTagWarn] = useState('');
  const [disableSubmit, setDisableSubmit] = useState(true);

  useEffect(() => {
    const isSameUser =
      bibliUser?.tag === updateUser?.tag &&
      bibliUser?.name === updateUser?.name &&
      bibliUser?.bio === updateUser?.bio;

    setDisableSubmit(isSameUser || !tagValid || !nameValid);
  }, [bibliUser, updateUser, tagValid, nameValid]);

  const handleNameChange = (name: string) => {
    setUpdateUser({...updateUser, name: name});
    setNameValid(name.trim() !== '');
  };

  const handleTagChange = async (tag: string) => {
    setUpdateUser({...updateUser, tag: tag});
    if (tag !== bibliUser?.tag) {
      try {
        const response = await usersApi.validateTagUserValidateTagGet(
          tag,
        );
        setTagValid(response.data.valid);
        setTagWarn(response.data.warning ? response.data.warning : '');
      } catch (error) {
        console.error('Error validating username:', error);
        // Handle error (e.g., show an error message)
      }
    } else {
      setTagValid(true);
      setTagWarn('');
    }
  };

  const handleBioChange = (bio: string) => {
    // @ts-ignore
    setUpdateUser({...updateUser, bio: bio.trim() === '' ? null : bio});
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.headline}>
        Edit Profile
      </Text>
      <View style={styles.textInputView}>
        <TextInput
          label={'Username'}
          textContentType="username"
          autoCapitalize="none"
          mode="outlined"
          defaultValue={bibliUser?.tag}
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
          defaultValue={bibliUser?.name}
          maxLength={20}
          error={!nameValid}
          onChangeText={handleNameChange}
        />
      </View>
      <View style={styles.textInputView}>
        <TextInput
          label={'Bio'}
          mode="outlined"
          defaultValue={bibliUser?.bio}
          maxLength={50}
          onChangeText={handleBioChange}
        />
      </View>
      <SubmitButton updateUser={updateUser} disabled={disableSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  headline: {
    marginVertical: 10,
  },
  textInputView: {
    marginBottom: 10,
  },
  submitButton: {
    alignSelf: 'center',
  },
});

export default EditScreen;
