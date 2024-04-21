import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {UserRead} from '../../generated/jericho';
import {Avatar, IconButton, TouchableRipple} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import ImagePicker from 'react-native-image-crop-picker';

function getInitials(str: string): string {
  // Split the string into words
  const words = str.split(/\s+/);

  // Map over each word and extract the first letter
  const firstLetters = words.map(word => word.charAt(0));

  // Join the first letters back into a string
  return firstLetters.join('');
}

interface UserAvatarProps {
  user?: UserRead;
  size?: number;
  pressable?: boolean;
}

export const UserAvatar = ({
  user,
  size: defaultSize,
  pressable,
}: UserAvatarProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const size = defaultSize ?? 48;
  const onPress = pressable
    ? () => navigation.push('Profile', {profile: user})
    : undefined;

  return (
    <TouchableRipple
      onPress={onPress}
      borderless={true}
      style={{borderRadius: 100, alignSelf: 'center'}}>
      {user?.avatar_filepath ? (
        <Avatar.Image
          style={styles.avatar}
          size={size}
          source={{uri: user.avatar_filepath}}
        />
      ) : user?.name ? (
        <Avatar.Text
          style={styles.avatar}
          labelStyle={{
            fontWeight: '300',
            fontSize: size * 0.3,
            textTransform: 'uppercase',
          }}
          size={size}
          label={getInitials(user.name)}
        />
      ) : (
        <Avatar.Icon
          style={styles.avatar}
          size={size}
          icon="account-outline"
        />
      )}
    </TouchableRipple>
  );
};

export const UserAvatarCallback = (props: UserAvatarProps) => {
  return () => <UserAvatar {...props} />;
};

interface EditAvatarButtonProps {
  user: UserRead;
  avatar: string | undefined;
  setAvatar: Dispatch<SetStateAction<string | undefined>>;
  size?: number;
}

export const EditAvatarButton = ({
  user: defaultUser,
  avatar,
  setAvatar,
  size: defaultSize,
}: EditAvatarButtonProps) => {
  const size = defaultSize ?? 120;
  const pencilOffset = size / 10;
  const [user, setUser] = useState<UserRead>(defaultUser);

  useEffect(() => {
    setUser({
      ...defaultUser,
      avatar_filepath: avatar ?? defaultUser.avatar_filepath,
    });
  }, [avatar, defaultUser, defaultUser.avatar_filepath]);

  const onPress = () => {
    ImagePicker.openPicker({
      cropping: true,
      width: 400,
      height: 400,
      cropperCircleOverlay: true,
      // compressImageQuality: 0.4,
      mediaType: 'photo',
      // includeBase64: true,
    })
      .then(pi => setAvatar(pi.path))
      .catch(e => console.log(e));
  };

  return (
    <View style={{margin: size / 10}}>
      <TouchableRipple
        onPress={onPress}
        rippleColor={'transparent'}
        style={{
          alignSelf: 'center',
          width: size + pencilOffset,
          height: size + pencilOffset,
        }}>
        <View style={{width: '100%', height: '100%', justifyContent: 'center'}}>
          <UserAvatar user={user} size={size} />
          <IconButton
            icon={user.avatar_filepath ? 'pencil' : 'plus'}
            mode={'contained-tonal'}
            style={{
              position: 'absolute',
              bottom: -pencilOffset,
              right: -pencilOffset,
            }}
            size={size / 4}
          />
        </View>
      </TouchableRipple>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'center',
  },
});
