import React, {useContext} from 'react';
import {UserContext} from '../../context';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {ProfileTitle, UserTabView, TitleButtons} from './';
import {UserRead} from '../../generated/jericho';

interface ScreenProps {
  user: UserRead;
}

export const Screen = ({user}: ScreenProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const isCurrentUser = user.id === bibliUser?.id;

  return (
    // TODO use different TabView to enable ScrollView.
    // https://github.com/satya164/react-native-tab-view/issues/1274
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ProfileTitle
          style={styles.profileBanner}
          name={user.name ?? ''}
          tag={`@${user.tag}`}
          id={user.id ?? 0}
          isCurrentUser={isCurrentUser}
        />
        <Text style={styles.socialText}>27 Followers • 24 Following</Text>
        <TitleButtons style={styles.profileButtons} user={user} />
      </View>
      <UserTabView />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: 10,
  },
  socialText: {
    textAlign: 'center',
  },
  profileBanner: {
    padding: 20,
  },
  profileButtons: {
    padding: 10,
  },
});
