import {Button} from 'react-native-paper';
import * as React from 'react';
import {StyleProp, ViewStyle, View, StyleSheet, TextStyle} from 'react-native';
import {useContext, useState} from 'react';
import {UserLinkRead, UserRead} from '../../generated/jericho';
import {UserContext} from '../../context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

interface ProfileButtonProps {
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  link?: UserLinkRead;
}

const DiscoverButton = ({style, labelStyle}: ProfileButtonProps) => {
  return (
    <Button
      mode={'outlined'}
      compact={true}
      icon={'book-multiple-outline'}
      style={style}
      labelStyle={labelStyle}
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
      onPress={() => navigation.push('EditProfile')}>
      Edit
    </Button>
  );
};

const FollowButton = ({style, labelStyle, link}: ProfileButtonProps) => {
  const [active, setActive] = useState<Boolean>(link?.type === 'follow');

  return (
    <Button
      mode={active ? 'contained' : 'outlined'}
      compact={true}
      icon={active ? 'account-check-outline' : 'account-plus'}
      style={style}
      labelStyle={labelStyle}
      onPress={() => {
        setActive(!active);
      }}>
      {active ? 'Following' : 'Follow'}
    </Button>
  );
};

const BlockButton = ({style, labelStyle, link}: ProfileButtonProps) => {
  const [active, setActive] = useState<Boolean>(link?.type === 'block');

  return (
    <Button
      mode={active ? 'contained' : 'outlined'}
      compact={true}
      icon={active ? 'account-off-outline' : 'account-off'}
      style={style}
      labelStyle={labelStyle}
      onPress={() => {
        setActive(!active);
      }}>
      {active ? 'Blocked' : 'Block'}
    </Button>
  );
};

interface Props {
  style: StyleProp<ViewStyle>;
  user: UserRead;
  link?: UserLinkRead;
}

// Profile button container - dynamically allow for different profile buttons.
export const TitleButtons = ({user, style, link}: Props) => {
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
            <FollowButton link={link} />
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
});
