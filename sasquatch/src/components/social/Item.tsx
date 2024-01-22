import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Avatar} from 'react-native-paper';
import {UserRead} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack'; // Adjust the import path

interface UserItemProps {
  user: UserRead;
}

const CardPress = (user: UserRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Profile', {
      profile: user,
    });
  };
};

const UserItem = ({user}: UserItemProps) => {
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
        left={props => <Avatar.Icon {...props} icon="account-outline" />}
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
});

export default UserItem;
