import React, {useContext, useEffect, useState} from 'react';
import {ApiContext, UserContext} from '../../context';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Title} from './Title';
import {UserTabView} from './TabView';
import {TitleButtons} from './Buttons';
import {CollectionRead, UserLinkType, UserRead} from '../../generated/jericho';

interface ScreenProps {
  user: UserRead;
}

export const Screen = ({user: defaultUser}: ScreenProps) => {
  const {collectionsApi, usersApi} = useContext(ApiContext);
  const {user: bibliUser} = useContext(UserContext);
  const [user, setUser] = useState<UserRead>(defaultUser);
  const isCurrentUser = user.id === bibliUser?.id;

  const [collections, setCollections] = useState<CollectionRead[]>([]);
  const [following, setFollowing] = useState<UserRead[]>([]);
  const [followers, setFollowers] = useState<UserRead[]>([]);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await usersApi.getUserByIdUserUserIdGet(
          defaultUser.id,
        );
        setUser(response.data);
      } catch (error) {
        console.log(`Error fetching user ${defaultUser.id}:`, error);
      }
    };
    initializeUser().catch(error => console.log(error));
  }, [defaultUser.id, usersApi]);

  useEffect(() => {
    const initializeCollections = async () => {
      try {
        const response = await collectionsApi.getCollectionsCollectionsGet(
          user.id,
        );
        setCollections(response.data);
      } catch (error) {
        console.log(`Error fetching collections for user ${user.tag}:`, error);
      }
    };
    initializeCollections().catch(error => console.log(error));
  }, [collectionsApi, user.id, user.tag]);

  useEffect(() => {
    const initializeFollowing = async () => {
      try {
        const response = await usersApi.getLinkedUsersUsersLinkedGet(
          UserLinkType.Follow,
          user.id,
        );
        setFollowing(response.data);
      } catch (error) {
        console.log(`Error fetching following for user ${user.tag}:`, error);
      }
    };
    initializeFollowing().catch(error => console.log(error));
  }, [usersApi, user.id, user.tag]);

  useEffect(() => {
    const initializeFollowers = async () => {
      try {
        const response = await usersApi.getLinkedUsersUsersLinkedGet(
          UserLinkType.Follow,
          undefined,
          user.id,
        );
        setFollowers(response.data);
      } catch (error) {
        console.log(`Error fetching followers for user ${user.tag}:`, error);
      }
    };
    initializeFollowers().catch(error => console.log(error));
  }, [usersApi, user.id, user.tag]);

  const [socialText, setSocialText] = useState<string>('');
  useEffect(() => {
    setSocialText(
      `${following.length} Following • ${followers.length} Followers`,
    );
  }, [followers, following]);

  return (
    // TODO use different TabView to enable ScrollView.
    // https://github.com/satya164/react-native-tab-view/issues/1274
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Title
          style={styles.profileBanner}
          user={user}
          isCurrentUser={isCurrentUser}
        />
        {user.bio ? <Text style={styles.bioText}>{user.bio}</Text> : null}
        <Text style={styles.socialText}>{socialText}</Text>
        {bibliUser && (
          <TitleButtons
            style={styles.profileButtons}
            user={user}
            currentUser={bibliUser}
          />
        )}
      </View>
      <UserTabView
        user={user}
        collections={collections}
        setCollections={setCollections}
        following={following}
        setFollowing={setFollowing}
        followers={followers}
        setFollowers={setFollowers}
      />
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
  bioText: {
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 5,
    alignSelf: 'center',
    width: 200,
  },
  socialText: {
    textAlign: 'center',
  },
  profileBanner: {
    paddingTop: 5,
  },
  profileButtons: {
    padding: 10,
  },
});
