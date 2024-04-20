import React, {useContext, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Card, Avatar, Button} from 'react-native-paper';
import {
  UserLinkPut,
  UserLinkType,
  UserRead,
} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ApiContext} from '../../context';
import {UserAvatarCallback} from '../profile/Avatar';

interface UserItemProps {
  user: UserRead;
  currentUser: UserRead;
}

const CardPress = (user: UserRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Profile', {
      profile: user,
    });
  };
};

export const UserItem = ({user, currentUser}: UserItemProps) => {
  const {usersApi} = useContext(ApiContext);
  const [userLink, setUserLink] = useState<UserLinkType | null>(
    user.link ?? null,
  );

  const handleFollowPress = async () => {
    try {
      const userLinkPut: UserLinkPut = {
        parent_id: currentUser.id,
        child_id: user.id,
        type: 'follow',
      };
      const response = await usersApi.putUserLinkUsersLinkPut(userLinkPut);
      setUserLink(response.data.type);
    } catch (error) {
      console.error('Error creating user link:', error);
    }
  };

  const handleUnlinkPress = async () => {
    try {
      await usersApi.deleteUserLinkUsersLinkParentUserIdChildUserIdDelete(
        currentUser.id,
        user.id,
      );
      setUserLink(null);
    } catch (error) {
      console.error('Error deleting user link:', error);
    }
  };

  const renderRightButton = () => {
    if (user.id === currentUser.id) {
      return null;
    }
    switch (userLink) {
      case null:
        return (
          <Button
            mode="text"
            icon={'account-plus-outline'}
            onPress={handleFollowPress}
            style={styles.rightButton}
            labelStyle={[styles.rightButtonLabel, {marginHorizontal: 15}]}>
            Follow
          </Button>
        );
      case 'follow':
        return (
          <Button
            mode="elevated"
            icon={'account-check'}
            onPress={handleUnlinkPress}
            style={styles.rightButton}
            labelStyle={styles.rightButtonLabel}>
            Following
          </Button>
        );
      case 'block':
        return (
          <Button
            mode="text"
            icon={'account-off'}
            theme={{
              colors: {
                primary: LightTheme.colors.error,
                onPrimary: LightTheme.colors.onError,
                primaryContainer: LightTheme.colors.errorContainer,
                onPrimaryContainer: LightTheme.colors.onErrorContainer,
                outline: LightTheme.colors.onErrorContainer,
                elevation: {
                  level1: LightTheme.colors.errorContainer,
                },
              },
            }}
            style={styles.rightButton}
            labelStyle={styles.rightButtonLabel}>
            Blocked
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      mode={'contained'}
      style={styles.container}
      onPress={CardPress(user)}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}>
      <Card.Title
        title={user.name}
        subtitle={`@${user.tag}`}
        left={UserAvatarCallback({user})}
        right={renderRightButton}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 10,
    elevation: 2,
  },
  rightButton: {
    width: 120,
    height: 30,
    // justifyContent: 'center',
    marginHorizontal: 0,
  },
  rightButtonLabel: {
    fontSize: 15,
    marginHorizontal: 20,
    marginVertical: 0,
    paddingVertical: 5,
  },
});

export default UserItem;
