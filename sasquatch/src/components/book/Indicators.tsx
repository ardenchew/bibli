import React from 'react';
import {
  CollectionBookLink,
  CollectionsApi,
  CollectionType,
  UserBookRead,
  UserRead,
} from '../../generated/jericho';
import {IconButton} from 'react-native-paper';
import {StyleSheet} from 'react-native';

interface ActiveIndicatorProps {
  hasActive: boolean;
}

export const ActiveIndicator = ({hasActive}: ActiveIndicatorProps) => {
  return hasActive ? (
    <IconButton
      style={{
        margin: 0,
        padding: 0,
        alignSelf: 'center',
      }}
      icon={'book-open-variant-outline'}
    />
  ) : null;
};

export const SavedOnPress = (
  bibliUser: UserRead | null,
  collectionsApi: CollectionsApi,
  book: UserBookRead,
  refreshBook: () => void,
  isSaved: boolean,
) => {
  return async () => {
    try {
      const response = await collectionsApi.getCollectionsCollectionsGet(
        bibliUser?.id,
        CollectionType.Saved,
      );
      const collectionId = response.data[0]?.id;

      if (!collectionId) {
        throw new Error('Saved collection does not exist.');
      }

      const collectionBookLink: CollectionBookLink = {
        collection_id: collectionId,
        book_id: book.book.id,
      };

      if (isSaved) {
        await collectionsApi.deleteCollectionBookLinkCollectionBookLinkDelete(
          collectionBookLink,
        );
      } else {
        await collectionsApi.postCollectionBookLinkCollectionBookLinkPost(
          collectionBookLink,
        );
      }
    } catch (e) {
      console.log(e);
    }
    refreshBook();
  };
};

interface SavedIndicatorProps {
  bibliUser: UserRead | null;
  collectionsApi: CollectionsApi;
  book: UserBookRead;
  hasSaved: boolean;
  refreshBook: () => void;
}

export const SavedIndicator = ({
  bibliUser,
  collectionsApi,
  book,
  refreshBook,
  hasSaved,
}: SavedIndicatorProps) => {
  return (
    <IconButton
      style={styles.icon}
      icon={hasSaved ? 'bookmark' : 'bookmark-outline'}
      onPress={SavedOnPress(
        bibliUser,
        collectionsApi,
        book,
        refreshBook,
        hasSaved,
      )}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    margin: 0,
    padding: 0,
    alignSelf: 'center',
  },
});
