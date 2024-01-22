import React, {useContext, useEffect, useState} from 'react';
import {UserContext} from '../../context';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Title} from './Title';
import {UserTabView} from './TabView';
import {TitleButtons} from './Buttons';
import {CollectionRead, UserRead} from '../../generated/jericho';
import {useApi} from '../../api';

interface ScreenProps {
  user: UserRead;
}

export const Screen = ({user}: ScreenProps) => {
  const {collectionsApi} = useApi();
  const {user: bibliUser} = useContext(UserContext);
  const isCurrentUser = user.id === bibliUser?.id;

  const [collections, setCollections] = useState<CollectionRead[]>([]);

  useEffect(() => {
    const initializeCollections = async () => {
      try {
        const response = await collectionsApi.getCollectionsCollectionsGet(user.id)
        setCollections(response.data);
      } catch (error) {
        console.log('Error fetching collections for user ${user.tag}:', error);
      }
    };
    initializeCollections().catch(error => console.log(error));
  }, [collectionsApi, user.id]);

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
        <Text style={styles.socialText}>27 Followers • 24 Following</Text>
        <TitleButtons style={styles.profileButtons} user={user} />
      </View>
      <UserTabView
        user={user}
        collections={collections}
        setCollections={setCollections}
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
