import React, {useContext} from 'react';
import {UserContext} from '../../context';
import {StyleSheet, View} from 'react-native';
import {Screen} from '../../components/profile';

const ProfileScreen = () => {
  const {user: bibliUser} = useContext(UserContext);

  return (
    <View style={styles.container}>
      {bibliUser ? <Screen profile={bibliUser} /> : <></>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ProfileScreen;
