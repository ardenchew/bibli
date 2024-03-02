import {Button} from 'react-native-paper';
import * as React from 'react';
import {StyleProp, ViewStyle, View, StyleSheet, TextStyle} from 'react-native';
import {useContext, useState} from 'react';
import {UserLinkPut, UserRead, UsersApi} from '../../generated/jericho';
import {UserContext} from '../../context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

interface ProfileButtonProps {
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  user?: UserRead;
  currentUser?: UserRead;
  usersApi?: UsersApi;
}

const DiscoverButton = ({style, labelStyle}: ProfileButtonProps) => {
  return (
    <Button
      mode={'outlined'}
      compact={true}
      icon={'book-multiple-outline'}
      style={style}
      labelStyle={labelStyle}
      contentStyle={styles.content}
      onPress={() => {}}>
      Discover
    </Button>
  );
};

const EditButton = ({style, labelStyle}: ProfileButtonProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <Button
      mode={'outlined'}
      compact={true}
      icon={'pencil'}
      style={style}
      labelStyle={labelStyle}
      contentStyle={styles.content}
      onPress={() => navigation.push('EditProfile')}>
      Edit
    </Button>
  );
};

const FollowButton = ({
  style,
  labelStyle,
  user,
  currentUser,
  usersApi,
}: ProfileButtonProps) => {
  if (!currentUser || !user || currentUser?.id === user?.id) {
    return null;
  }

  const [active, setActive] = useState<Boolean>(user?.link === 'follow');

  const onPress = async () => {
    if (!usersApi) {
      return null;
    }

    if (active) {
      try {
        await usersApi.deleteUserLinkUsersLinkParentUserIdChildUserIdDelete(
          currentUser?.id,
          user?.id,
        );
        setActive(false);
      } catch (error) {
        console.error('Error deleting user link:', error);
      }
    } else {
      try {
        const userLinkPut: UserLinkPut = {
          parent_id: currentUser.id,
          child_id: user.id,
          type: 'follow',
        };
        await usersApi.putUserLinkUsersLinkPut(userLinkPut);
        setActive(true);
      } catch (error) {
        console.error('Error creating user link:', error);
      }
    }
  };

  return (
    <Button
      mode={active ? 'contained' : 'outlined'}
      compact={true}
      icon={active ? 'account-check-outline' : 'account-plus'}
      style={style}
      labelStyle={labelStyle}
      contentStyle={styles.content}
      onPress={onPress}>
      {active ? 'Following' : 'Follow'}
    </Button>
  );
};

interface Props {
  style: StyleProp<ViewStyle>;
  user: UserRead;
  currentUser: UserRead;
  usersApi: UsersApi;
}

// Profile button container - dynamically allow for different profile buttons.
export const TitleButtons = ({style, user, currentUser, usersApi}: Props) => {
  const {user: bibliUser} = useContext(UserContext);
  const isCurrentUser = bibliUser?.id === user.id;

  return (
    <View style={style}>
      <View style={styles.container}>
        {isCurrentUser ? (
          <>
            <EditButton />
            <DiscoverButton />
          </>
        ) : (
          <>
            <FollowButton
              user={user}
              currentUser={currentUser}
              usersApi={usersApi}
            />
            {/*<BlockButton />*/}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  profileBanner: {
    flex: 1,
  },
  content: {
    marginVertical: -5,
  },
});
