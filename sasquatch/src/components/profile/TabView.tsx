import * as React from 'react';
import {
  View,
  useWindowDimensions,
  StyleSheet,
  SafeAreaView,
  ScrollView, RefreshControl,
} from 'react-native';
import {TabBar, TabView} from 'react-native-tab-view';
import {LightTheme} from '../../styles/themes/LightTheme';
import {Button, SegmentedButtons, Text} from 'react-native-paper';
import {CollectionRead, UserLinkType, UserRead} from '../../generated/jericho';
import {default as CollectionsList} from '../collection/List';
import UserList from '../social/List';
import {Dispatch, SetStateAction, useState} from 'react';
import {useApi} from '../../api';

const mockCollections: CollectionRead[] = [
  {
    name: 'Reviewed',
    id: 1,
    type: '57 books',
  },
  {
    name: 'Bookmarked',
    id: 2,
    type: '142 books',
  },
  {
    name: 'Checked Out',
    id: 3,
    type: '21 books',
  },
  {
    name: 'Custom bookshelf',
    id: 4,
    type: '4 books',
  },
];

const mockFollowing: UserRead[] = [
  {
    name: 'Emily',
    id: 8,
    tag: 'emily',
  },
  {
    name: 'Mesther',
    id: 9,
    tag: 'cat_in_the_hat_enthusiast',
  },
  {
    name: 'Adam Grail',
    id: 10,
    tag: 'builtdifferent',
  },
  {
    name: 'Michelle',
    id: 11,
    tag: 'pursegorl',
  },
  {
    name: 'Drew Leonard',
    id: 12,
    tag: 'chef-welly',
  },
  {
    name: 'George William Peter Horrell The Fifth',
    id: 13,
    tag: 'brit',
  },
  {
    name: 'Arielle Grail',
    id: 14,
    tag: 'taylorswiftmegafan69420',
  },
];

const mockFollowers: UserRead[] = [
  {
    name: 'Joe',
    id: 1,
    tag: 'mama',
  },
];

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

  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={styles.routeContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <CollectionsList collections={collections} />
      </ScrollView>
      <Button
        compact={true}
        icon={'plus'}
        onPress={() => {}}
        mode={'elevated'}
        children={'New Collection'}
        style={{
          position: 'absolute',
          alignSelf: 'center',
          bottom: 20,
        }}
      />
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
      console.log('Error fetching socials for user ${user.tag}:', error);
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
        <>
          <UserList users={following} />
        </>
      ) : (
        <>
          <UserList users={followers} />
        </>
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
