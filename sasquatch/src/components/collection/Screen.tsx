import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Title} from './Title';
import {
  CollectionRead,
  BookPage,
  CollectionUserLinkType,
  UserRead,
} from '../../generated/jericho';
import {List as BooksList} from '../book';
import {Divider} from 'react-native-paper';
import {LightTheme} from '../../styles/themes/LightTheme';
import {ApiContext, UserContext} from '../../context';
import {TitleButtons} from './Buttons';
import {useIsFocused} from '@react-navigation/native';

interface ScreenProps {
  collection: CollectionRead;
}

export const Screen = ({collection}: ScreenProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {booksApi, usersApi} = useContext(ApiContext);
  const [bookPage, setBookPage] = useState<BookPage>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [owner, setOwner] = useState<UserRead>();
  const [ownerBookPage, setOwnerBookPage] = useState<BookPage>();
  const isFocused = useIsFocused();

  const owner_id = collection.user_links.find(
    link => link.type === CollectionUserLinkType.Owner,
  )?.user_id;

  useEffect(() => {
    const fetchUser = async () => {
      if (owner_id) {
        if (owner_id === bibliUser?.id) {
          setOwner(bibliUser);
        } else {
          try {
            const response = await usersApi.getUserByIdUserUserIdGet(owner_id);
            setOwner(response.data);
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        }
      }
    };

    fetchUser().catch(error => console.log(error));
  }, [bibliUser, owner_id, usersApi]);

  const fetchBooks = useCallback(async () => {
    if (bibliUser) {
      try {
        const response = await booksApi.getUserBooksBooksPost({
          user_id: bibliUser?.id,
          collection_ids: [collection.id],
        });
        setBookPage(response.data);
        if (owner && bibliUser?.id !== owner?.id) {
          const response = await booksApi.getUserBooksBooksPost({
            user_id: owner?.id,
            collection_ids: [collection.id],
          });
          setOwnerBookPage(response.data);
        }
        setIsLoaded(true);
      } catch (error) {
        console.log(
          `Error fetching books for collection ${collection.name}:`,
          error,
        );
      }
    }
  }, [bibliUser, booksApi, collection.id, collection.name, owner]);

  useEffect(() => {
    if (isFocused) {
      fetchBooks().catch(error => console.log(error));
    }
  }, [isFocused, fetchBooks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  }, [fetchBooks]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Title
          style={styles.profileBanner}
          collection={collection}
          owner={owner}
        />
        {bibliUser && isLoaded && (
          <TitleButtons collection={collection} bibliUser={bibliUser} />
        )}
        {isLoaded && (
          <Text style={styles.socialText}>
            {bookPage?.books?.length ?? 0} Books •{' '}
            {collection.user_links.length} Followers
          </Text>
        )}
      </View>
      <Divider
        bold={true}
        style={{backgroundColor: LightTheme.colors.onBackground}}
      />
      <ScrollView
        style={styles.routeContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <BooksList
          userBooks={bookPage?.books ?? []}
          currentOwnedCollection={
            owner?.id === bibliUser?.id ? collection : undefined
          }
          owner={owner}
          ownerBooks={ownerBookPage?.books}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: 10,
    paddingBottom: 10,
  },
  socialText: {
    textAlign: 'center',
  },
  profileBanner: {
    paddingTop: 5,
  },
  routeContainer: {
    flex: 1,
  },
});
