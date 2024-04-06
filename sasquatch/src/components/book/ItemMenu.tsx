import React, {useState} from 'react';
import {IconButton, Menu} from 'react-native-paper';
import {
  CollectionRead,
  CollectionsApi,
  CollectionType,
  ReviewRead,
  ReviewsApi,
  UserBookRead,
  UserRead,
} from '../../generated/jericho';
import {
  DeleteReviewOnPress,
  IdCollectionOnPress,
  TypedCollectionOnPress,
} from './Indicators';
import {ReviewModal} from './Review';
import {ManageModal} from '../collection/ManageModal';

interface ManageCollectionsItemProps {
  onPress: () => void;
}

const ManageCollectionsItem = ({onPress}: ManageCollectionsItemProps) => {
  return (
    <Menu.Item
      leadingIcon={'plus-box-multiple'}
      onPress={onPress}
      title="Manage collections"
    />
  );
};

interface RemoveCollectionItemProps {
  book: UserBookRead;
  collectionsApi: CollectionsApi;
  closeMenu: () => void;
  refreshBook: () => void;
  removeCollection: CollectionRead;
}

const RemoveCollectionItem = ({
  book,
  collectionsApi,
  closeMenu,
  refreshBook,
  removeCollection,
}: RemoveCollectionItemProps) => {
  const onPress = async () => {
    closeMenu();

    await IdCollectionOnPress(
      collectionsApi,
      book,
      removeCollection.id,
      false,
    )();

    refreshBook();
  };

  return (
    <Menu.Item
      leadingIcon={'minus-circle-outline'}
      onPress={onPress}
      title={`Remove from ${removeCollection.name}`}
    />
  );
};

interface ActiveItemProps {
  bibliUser: UserRead;
  book: UserBookRead;
  collectionsApi: CollectionsApi;
  hasActive: boolean;
  closeMenu: () => void;
  refreshBook: () => void;
}

const ActiveItem = ({
  bibliUser,
  book,
  collectionsApi,
  hasActive,
  closeMenu,
  refreshBook,
}: ActiveItemProps) => {
  const onPress = async () => {
    closeMenu();

    await TypedCollectionOnPress(
      bibliUser,
      collectionsApi,
      book,
      CollectionType.Active,
      !hasActive,
    )();

    refreshBook();
  };

  return (
    <Menu.Item
      leadingIcon={hasActive ? 'eye-off-outline' : 'book-open-variant'}
      onPress={onPress}
      title={hasActive ? 'Remove from reading' : 'Mark as reading'}
    />
  );
};


interface CompleteItemProps {
  bibliUser: UserRead;
  book: UserBookRead;
  collectionsApi: CollectionsApi;
  hasComplete: boolean;
  closeMenu: () => void;
  refreshBook: () => void;
}

const CompleteItem = ({
  bibliUser,
  book,
  collectionsApi,
  hasComplete,
  closeMenu,
  refreshBook,
}: CompleteItemProps) => {
  const onPress = async () => {
    closeMenu();

    await TypedCollectionOnPress(
      bibliUser,
      collectionsApi,
      book,
      CollectionType.Complete,
      !hasComplete,
    )();

    refreshBook();
  };

  return (
    <Menu.Item
      leadingIcon={hasComplete ? 'close' : 'check'}
      onPress={onPress}
      title={hasComplete ? 'Remove from finished' : 'Mark as finished'}
    />
  );
};

interface SavedItemProps {
  bibliUser: UserRead;
  book: UserBookRead;
  collectionsApi: CollectionsApi;
  hasSaved: boolean;
  closeMenu: () => void;
  refreshBook: () => void;
}

const SavedItem = ({
  bibliUser,
  book,
  collectionsApi,
  hasSaved,
  closeMenu,
  refreshBook,
}: SavedItemProps) => {
  const onPress = async () => {
    closeMenu();

    await TypedCollectionOnPress(
      bibliUser,
      collectionsApi,
      book,
      CollectionType.Saved,
      !hasSaved,
    )();

    refreshBook();
  };

  return (
    <Menu.Item
      leadingIcon={hasSaved ? 'bookmark-off-outline' : 'bookmark-outline'}
      onPress={onPress}
      title={hasSaved ? 'Remove bookmark' : 'Bookmark'}
    />
  );
};

interface AddReviewItemProps {
  onPress: () => void;
}

const AddReviewItem = ({onPress}: AddReviewItemProps) => {
  return (
    <Menu.Item
      leadingIcon={'star-plus-outline'}
      onPress={onPress}
      title={'Add review'}
    />
  );
};

interface DeleteReviewItemProps {
  reviewsApi: ReviewsApi;
  review: ReviewRead;
  closeMenu: () => void;
  refreshBook: () => void;
}

const DeleteReviewItem = ({
  reviewsApi,
  review,
  closeMenu,
  refreshBook,
}: DeleteReviewItemProps) => {
  const onPress = async () => {
    closeMenu();

    await DeleteReviewOnPress(reviewsApi, review)();

    refreshBook();
  };

  return (
    <Menu.Item
      leadingIcon={'delete-outline'}
      onPress={onPress}
      title={'Delete review'}
    />
  );
};

interface MenuButtonProps {
  bibliUser: UserRead;
  book: UserBookRead;
  collectionsApi: CollectionsApi;
  reviewsApi: ReviewsApi;
  refreshBook: () => void;
  hasComplete: boolean;
  hasSaved: boolean;
  hasActive: boolean;
  removeCollection?: CollectionRead;
}

export const MenuButton = ({
  bibliUser,
  book,
  collectionsApi,
  reviewsApi,
  refreshBook,
  hasComplete,
  hasSaved,
  hasActive,
  removeCollection,
}: MenuButtonProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
  const [collectionsModalVisible, setCollectionsModalVisible] = useState<boolean>(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            style={{
              margin: 0,
              padding: 0,
              alignSelf: 'center',
            }}
            icon="dots-vertical"
            onPress={openMenu}
          />
        }>
        {removeCollection && (
          <RemoveCollectionItem
            book={book}
            collectionsApi={collectionsApi}
            closeMenu={closeMenu}
            refreshBook={refreshBook}
            removeCollection={removeCollection}
          />
        )}
        <ManageCollectionsItem
          onPress={() => {
            closeMenu();
            setCollectionsModalVisible(true);
          }}
        />
        {!book.review ? (
          <>
            {!hasComplete && (
              <>
                <ActiveItem
                  bibliUser={bibliUser}
                  book={book}
                  collectionsApi={collectionsApi}
                  hasActive={hasActive}
                  closeMenu={closeMenu}
                  refreshBook={refreshBook}
                />
                <SavedItem
                  bibliUser={bibliUser}
                  book={book}
                  collectionsApi={collectionsApi}
                  hasSaved={hasSaved}
                  closeMenu={closeMenu}
                  refreshBook={refreshBook}
                />
              </>
            )}
            <CompleteItem
              bibliUser={bibliUser}
              book={book}
              collectionsApi={collectionsApi}
              hasComplete={hasComplete}
              closeMenu={closeMenu}
              refreshBook={refreshBook}
            />
            <AddReviewItem
              onPress={() => {
                closeMenu();
                setReviewModalVisible(true);
              }}
            />
          </>
        ) : (
          // TODO add EditReviewItem
          <DeleteReviewItem
            reviewsApi={reviewsApi}
            review={book.review}
            closeMenu={closeMenu}
            refreshBook={refreshBook}
          />
        )}
      </Menu>
      {reviewModalVisible && (
        <ReviewModal
          visible={reviewModalVisible}
          setVisible={setReviewModalVisible}
          userBook={book}
          onSubmit={refreshBook}
        />
      )}
      {collectionsModalVisible && (
        <ManageModal
          visible={collectionsModalVisible}
          setVisible={setCollectionsModalVisible}
          userBook={book}
          onSubmit={refreshBook}
        />
      )}
    </>
  );
};
