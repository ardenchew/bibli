import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import {StyleSheet, Image, Text, View} from 'react-native';
import {Card, Avatar, IconButton, Menu} from 'react-native-paper';
import {
  BooksApi,
  CollectionBookLink,
  CollectionRead,
  CollectionsApi,
  CollectionType,
  Reaction,
  ReviewRead,
  ReviewsApi,
  UserBookRead,
  UserRead,
} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme';
import {ApiContext, UserContext} from '../../context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ReviewModal} from './Review';
import {
  ActiveIndicator,
  CompleteIndicator,
  RateIndicator,
  ReviewIndicator, ReviewIndicatorText,
  SavedIndicator,
} from './Indicators';
import {MenuButton} from './ItemMenu';
import CardContent from 'react-native-paper/lib/typescript/components/Card/CardContent';

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
          collection => collection.type === CollectionType.Active,
        )
      : false,
  );
  const [hasSaved, setHasSaved] = useState<boolean>(() =>
    userBook.collections
      ? userBook.collections.some(
          collection => collection.type === CollectionType.Saved,
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

interface OwnerContentProps {
  owner: UserRead;
  ownerBook: UserBookRead;
}

const OwnerContent = ({owner, ownerBook}: OwnerContentProps) => {
  // const {hasComplete, hasActive, hasSaved} = useHasCollections(ownerBook);
  const [contentText, setContentText] = useState<string>();

  useEffect(() => {
    if (ownerBook.review && !ownerBook.review?.hide_rank) {
      setContentText(`${owner.name} awarded a `);
      // } else if (hasComplete || hasActive || hasSaved) {
      //   const statuses: string[] = [];
      //
      //   if (hasActive) {
      //     statuses.push('Reading');
      //   }
      //   if (hasComplete) {
      //     statuses.push('Finished');
      //   }
      //   if (hasSaved) {
      //     statuses.push('Bookmarked');
      //   }
      //
      //   setContentText(`${owner.name} marked as ${statuses.join(', ')}`);
    }
  }, [
    // hasActive,
    // hasComplete,
    // hasSaved,
    owner.name,
    ownerBook.review,
    ownerBook.review?.hide_rank,
  ]);

  return contentText ? (
    <Card.Content style={{flexDirection: 'row', alignItems: 'center'}}>
      <IconButton
        icon={'account-circle-outline'}
        size={16}
        style={{marginHorizontal: -5}}
      />
      <Text>{contentText}</Text>
      {!ownerBook.review?.hide_rank && (
        <ReviewIndicatorText review={ownerBook.review} />
      )}
    </Card.Content>
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
  owner?: UserRead;
  ownerBook?: UserBookRead;
  mode?: 'elevated' | 'outlined' | 'contained';
}

export const Item = ({
  userBook,
  currentOwnedCollection,
  owner,
  ownerBook,
  mode,
}: Props) => {
  const {booksApi} = useContext(ApiContext);
  const [book, setBook] = useState<UserBookRead>(userBook);
  const refreshBook = RefreshBook(booksApi, book, setBook);
  const title = userBook.book.subtitle
    ? `${userBook.book.title}: ${userBook.book.subtitle}`
    : userBook.book.title;

  return (
    <Card
      mode={mode ?? 'contained'}
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
      {owner && ownerBook && (
        <OwnerContent owner={owner} ownerBook={ownerBook} />
      )}
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
