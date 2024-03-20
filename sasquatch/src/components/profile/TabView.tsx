import * as React from 'react';
import {
  View,
  useWindowDimensions,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {TabBar, TabView} from 'react-native-tab-view';
import {LightTheme} from '../../styles/themes/LightTheme';
import {SegmentedButtons, Text} from 'react-native-paper';
import {CollectionRead, UserLinkType, UserRead} from '../../generated/jericho';
import {default as CollectionsList} from '../collection/List';
import UserList from '../social/List';
import {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import {useApi} from '../../api';
import {UserContext} from '../../context';
import {NewCollection} from './NewCollection';
import {useIsFocused} from '@react-navigation/native';

interface CollectionsProps {
  user: UserRead;
  collections: CollectionRead[];
  setCollections: Dispatch<SetStateAction<CollectionRead[]>>;
}

const CollectionsRoute = ({
  user,
  collections,
  setCollections,
}: CollectionsProps) => {
  const isFocused = useIsFocused();
  const {user: bibliUser} = useContext(UserContext);
  const {collectionsApi} = useApi();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await collectionsApi.getCollectionsCollectionsGet(
        user.id,
      );
      setCollections(response.data);
    } catch (error) {
      console.log(`Error fetching collections for user ${user.tag}:`, error);
    }
    setRefreshing(false);
  };

  // TODO this is a bandaid for scoped state management.
  useEffect(() => {
    const fetchData = async () => {
      if (isFocused) {
        try {
          const response = await collectionsApi.getCollectionsCollectionsGet(
            user.id,
          );
          setCollections(response.data);
        } catch (error) {
          console.log(
            `Error fetching collections for user ${user.tag}:`,
            error,
          );
        }
      }
    };

    fetchData().catch(e => console.log(e));
  }, [collectionsApi, isFocused, setCollections, user.id, user.tag]);

  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={styles.routeContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <CollectionsList collections={collections} />
      </ScrollView>
      {user.id === bibliUser?.id && (
        <NewCollection
          collections={collections}
          setCollections={setCollections}
        />
      )}
    </View>
  );
};

interface SocialProps {
  user: UserRead;
  following: UserRead[];
  setFollowing: Dispatch<SetStateAction<UserRead[]>>;
  followers: UserRead[];
  setFollowers: Dispatch<SetStateAction<UserRead[]>>;
}

const SocialRoute = ({
  user,
  following,
  setFollowing,
  followers,
  setFollowers,
}: SocialProps) => {
  const {usersApi} = useApi();
  const layout = useWindowDimensions();
  const socialSegments = [
    {
      value: 'following',
      label: 'Following',
    },
    {
      value: 'followers',
      label: 'Followers',
    },
  ];
  const [segment, setSegment] = React.useState(socialSegments[0].value);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const followingResponse = await usersApi.getLinkedUsersUsersLinkedGet(
        UserLinkType.Follow,
        user.id,
      );
      setFollowing(followingResponse.data);
      const followersResponse = await usersApi.getLinkedUsersUsersLinkedGet(
        UserLinkType.Follow,
        undefined,
        user.id,
      );
      setFollowers(followersResponse.data);
    } catch (error) {
      console.log(`Error fetching socials for user ${user.tag}:`, error);
    }
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.routeContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <SafeAreaView style={styles.socialSegmentsContainer}>
        <SegmentedButtons
          density={'small'}
          buttons={socialSegments}
          value={segment}
          onValueChange={setSegment}
          style={{maxWidth: layout.width / 2}}
          theme={{
            colors: {
              secondaryContainer: LightTheme.colors.primaryContainer,
              onSecondaryContainer: LightTheme.colors.onPrimaryContainer,
            },
          }}
        />
      </SafeAreaView>
      {segment === 'following' ? (
        <UserList users={following} />
      ) : (
        <UserList users={followers} />
      )}
    </ScrollView>
  );
};

const ActivityRoute = () => (
  <View style={{backgroundColor: LightTheme.colors.background, flex: 1}} />
);

interface Props {
  user: UserRead;
  collections: CollectionRead[];
  setCollections: Dispatch<SetStateAction<CollectionRead[]>>;
  following: UserRead[];
  setFollowing: Dispatch<SetStateAction<UserRead[]>>;
  followers: UserRead[];
  setFollowers: Dispatch<SetStateAction<UserRead[]>>;
}

export const UserTabView = ({
  user,
  collections,
  setCollections,
  following,
  setFollowing,
  followers,
  setFollowers,
}: Props) => {
  const renderScene = ({route}: {route: {key: string}}) => {
    switch (route.key) {
      case 'first':
        return (
          <CollectionsRoute
            user={user}
            collections={collections}
            setCollections={setCollections}
          />
        );
      case 'second':
        return (
          <SocialRoute
            user={user}
            following={following}
            setFollowing={setFollowing}
            followers={followers}
            setFollowers={setFollowers}
          />
        );
      case 'third':
        return <ActivityRoute />;
      default:
        return null;
    }
  };

  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'Collections'},
    {key: 'second', title: 'Social'},
    {key: 'third', title: 'Activity'},
  ]);

  return (
    <TabView
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{width: layout.width}}
      renderTabBar={props => (
        <TabBar
          {...props}
          style={{
            backgroundColor: LightTheme.colors.background,
            borderBottomColor: LightTheme.colors.outline,
            borderBottomWidth: 1,
          }}
          // tabStyle={{backgroundColor: LightTheme.colors.background}}
          indicatorStyle={styles.indicatorStyle}
          renderLabel={({route, focused}) => (
            <Text
              style={{
                color: focused
                  ? LightTheme.colors.scrim
                  : LightTheme.colors.outline,
                fontWeight: focused ? 'bold' : 'normal',
                paddingHorizontal: 8,
              }}>
              {route.title}
            </Text>
          )}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  indicatorStyle: {
    backgroundColor: LightTheme.colors.scrim,
  },
  routeContainer: {
    flex: 1,
    // position: 'absolute',
  },
  socialSegments: {
    maxWidth: 100,
  },
  socialSegmentsContainer: {
    alignItems: 'center',
    margin: 10,
  },
});
