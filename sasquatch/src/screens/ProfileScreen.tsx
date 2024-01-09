import React, {useContext, useEffect} from 'react';
import LogoutButton from '../components/header/Logout';
import {UserContext} from '../context';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

const ProfileScreen = ({navigation}: Props) => {
  const {user: bibliUser} = useContext(UserContext);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <LogoutButton />,
    });
  }, [navigation]);
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.headline}>
        Profile of {bibliUser?.name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  headline: {
    flex: 1,
  },
});

export default ProfileScreen;
