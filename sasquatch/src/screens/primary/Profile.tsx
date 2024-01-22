import React, {useContext} from 'react';
import {UserContext} from '../../context';
import {StyleSheet, View} from 'react-native';
import {Screen} from '../../components/profile';
import {SharedNavigator} from './Shared';

const ProfileScreen = () => {
  const {user: bibliUser} = useContext(UserContext);
  return (
    <View style={styles.container}>
      {bibliUser ? <Screen user={bibliUser} /> : <></>}
    </View>
  );
};

const ProfileTab = SharedNavigator(ProfileScreen);

export default ProfileTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
