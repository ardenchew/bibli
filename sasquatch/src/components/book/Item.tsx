import React, {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import {StyleSheet, Image, Text, View} from 'react-native';
import {Card, Avatar, IconButton, Menu} from 'react-native-paper';
import {
  BooksApi,
  CollectionBookLink, CollectionRead,
  CollectionsApi,
  CollectionType,
  Reaction,
  ReviewRead, ReviewsApi,
  UserBookRead, UserRead,
} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme';
import {ApiContext, UserContext} from '../../context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ReviewModal} from './Review';
import {ActiveIndicator, CompleteIndicator, RateIndicator, ReviewIndicator, SavedIndicator} from './Indicators';
import {MenuButton} from './ItemMenu';

interface HasCollections {
  hasComplete: boolean;
  hasActive: boolean;
  hasSaved: boolean;
}

export const useHasCollections = (userBook: UserBookRead): HasCollections => {
  const [hasComplete, setHasComplete] = useState<boolean>(() =>
    userBook.collections
      ? userBook.collections.some(
          collection => collection.type === CollectionType.Complete,
        )
      : false,
  );
  const [hasActive, setHasActive] = useState<boolean>(() =>
    userBook.collections
      ? userBook.collections.some(
          collection => collection.type === CollectionType.Active
        )
      : false,
  );
  const [hasSaved, setHasSaved] = useState<boolean>(() =>
    userBook.collections
      ? userBook.collections.some(
          collection => collection.type === CollectionType.Saved
        )
      : false,
  );

  useEffect(() => {
    if (userBook.collections) {
      const complete = userBook.collections.some(
        collection => collection.type === CollectionType.Complete,
      );
      const active = userBook.collections.some(
        collection => collection.type === CollectionType.Active,
      );
      const saved = userBook.collections.some(
        collection => collection.type === CollectionType.Saved,
      );

      setHasComplete(complete);
      setHasActive(active);
      setHasSaved(saved);
    } else {
      setHasComplete(false);
      setHasActive(false);
      setHasSaved(false);
    }
  }, [userBook.collections]);

  return {
    hasComplete,
    hasActive,
    hasSaved,
  };
};

export const RefreshBook = (
  booksApi: BooksApi,
  book: UserBookRead,
  setBook: Dispatch<SetStateAction<UserBookRead>>,
) => {
  return async () => {
    try {
      const response = await booksApi.getBookBookBookIdGet(book.book.id);
      setBook(response.data);
    } catch (e) {
      console.log(`Error fetching book ${book.book.id}: ${e}`);
    }
  };
};

interface IndicatorsProps {
  book: UserBookRead;
  refreshBook: () => void;
  currentOwnedCollection?: CollectionRead;
}

export const Indicators = ({
  book,
  refreshBook,
  currentOwnedCollection,
}: IndicatorsProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {hasComplete, hasActive, hasSaved} = useHasCollections(book);

  return bibliUser ? (
    <View style={styles.rightContainer}>
      {book.review ? (
        <ReviewIndicator review={book.review} />
      ) : hasComplete ? (
        <CompleteIndicator hasComplete={hasComplete} />
      ) : (
        <>
          <RateIndicator book={book} refreshBook={refreshBook} />
          {hasActive ? (
            <ActiveIndicator hasActive={hasActive} />
          ) : (
            <SavedIndicator
              bibliUser={bibliUser}
              book={book}
              refreshBook={refreshBook}
              hasSaved={hasSaved}
            />
          )}
        </>
      )}
      <MenuButton
        bibliUser={bibliUser}
        book={book}
        hasComplete={hasComplete}
        hasSaved={hasSaved}
        hasActive={hasActive}
        refreshBook={refreshBook}
        removeCollection={
          currentOwnedCollection?.type ? undefined : currentOwnedCollection
        }
      />
    </View>
  ) : null;
};

const CardPress = (userBook: UserBookRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Book', {
      userBook: userBook,
    });
  };
};

interface Props {
  userBook: UserBookRead;
  currentOwnedCollection?: CollectionRead;
}

export const Item = ({userBook, currentOwnedCollection}: Props) => {
  const {booksApi} = useContext(ApiContext);
  const [book, setBook] = useState<UserBookRead>(userBook);
  const refreshBook = RefreshBook(booksApi, book, setBook);
  const title = userBook.book.subtitle
    ? `${userBook.book.title}: ${userBook.book.subtitle}`
    : userBook.book.title;

  return (
    <Card
      mode={'contained'}
      style={styles.container}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}
      onPress={CardPress(userBook)}>
      {/*TODO Hold for book blurb would be so cool*/}
      <Card.Title
        title={title}
        subtitle={userBook.authors?.map(author => author.name).join(', ')}
        left={props =>
          userBook.book.cover_link ? (
            <Image
              source={{uri: userBook.book.cover_link}}
              style={styles.bookImage}
            />
          ) : (
            <Avatar.Icon {...props} icon="book" />
          )
        }
        right={() => (
          <Indicators
            book={book}
            refreshBook={refreshBook}
            currentOwnedCollection={currentOwnedCollection}
          />
        )}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    elevation: 2,
  },
  bookImage: {
    height: 70,
    resizeMode: 'contain',
  },
  rightContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: -10,
  },
  rightIcon: {
    margin: 0,
    padding: 0,
    alignSelf: 'center',
  },
});
