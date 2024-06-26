import {Button} from 'react-native-paper';
import * as React from 'react';
import {StyleProp, ViewStyle, View, StyleSheet, TextStyle} from 'react-native';
import {useContext, useEffect, useState} from 'react';
import {UserLinkPut, UserRead} from '../../generated/jericho';
import {ApiContext, UserContext} from '../../context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

interface ProfileButtonProps {
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  user?: UserRead;
  currentUser?: UserRead;
}

const FeedbackButton = ({style, labelStyle}: ProfileButtonProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <Button
      mode={'outlined'}
      compact={true}
      icon={'message-text'}
      style={style}
      labelStyle={labelStyle}
      contentStyle={styles.content}
      onPress={() => navigation.push('SubmitFeedback')}>
      Feedback
    </Button>
  );
};

const EditButton = ({style, labelStyle}: ProfileButtonProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const onPress = () => {
    if (bibliUser) {
      navigation.push('EditProfile', {
        user: bibliUser,
      });
    }
  };

  return (
    <Button
      mode={'outlined'}
      compact={true}
      icon={'pencil'}
      style={style}
      labelStyle={labelStyle}
      contentStyle={styles.content}
      onPress={onPress}>
      Edit
    </Button>
  );
};

interface FollowButtonProps {
  user: UserRead;
  currentUser: UserRead;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const FollowButton = ({
  user,
  currentUser,
  style,
  labelStyle,
}: FollowButtonProps) => {
  const {usersApi} = useContext(ApiContext);
  const [active, setActive] = useState<Boolean>();

  useEffect(() => {
    setActive(user?.link === 'follow');
  }, [user?.link]);

  const onPress = async () => {
    if (!usersApi) {
      return null;
    }

    if (active) {
      try {
        await usersApi.deleteUserLinkUsersLinkParentUserIdChildUserIdDelete(
          currentUser.id,
          user.id,
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

  return active !== undefined ? (
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
  ) : null;
};

interface Props {
  style: StyleProp<ViewStyle>;
  user: UserRead;
  currentUser: UserRead;
}

// Profile button container - dynamically allow for different profile buttons.
export const TitleButtons = ({style, user, currentUser}: Props) => {
  const {user: bibliUser} = useContext(UserContext);
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(
    bibliUser?.id === user.id,
  );

  useEffect(() => {
    setIsCurrentUser(bibliUser?.id === user.id);
  }, [bibliUser?.id, user.id]);

  return (
    <View style={style}>
      <View style={styles.container}>
        {isCurrentUser ? (
          <>
            <EditButton />
            <FeedbackButton />
          </>
        ) : (
          <>
            <FollowButton user={user} currentUser={currentUser} />
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
