import React, {useContext} from 'react';
import {UserContext} from '../../context';
import {StyleSheet, Text, View} from 'react-native';
import {
  ProfileTitle,
  UserTabView,
  TitleButtons,
} from './';
import {UserRead} from '../../generated/jericho';

interface ScreenProps {
  profile: UserRead;
}

export const Screen = ({profile}: ScreenProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const isCurrentUser = profile.id === bibliUser?.id;

  return (
    // TODO use different TabView to enable ScrollView.
    // https://github.com/satya164/react-native-tab-view/issues/1274
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ProfileTitle
          style={styles.profileBanner}
          name={profile.name ?? ''}
          tag={`@${profile.tag}`}
          id={profile.id ?? 0}
          isCurrentUser={isCurrentUser}
        />
        <Text style={styles.socialText}>27 Followers • 24 Following</Text>
        <TitleButtons style={styles.profileButtons} profile={profile} />
      </View>
      <UserTabView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
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
