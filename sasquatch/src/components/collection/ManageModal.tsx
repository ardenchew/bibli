import {
  CollectionBookLink,
  CollectionRead,
  CollectionUserLinkType,
  UserBookRead,
} from '../../generated/jericho';
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import {ApiContext, UserContext} from '../../context';
import {Dimensions, Image, ScrollView, StyleSheet, View} from 'react-native';
import {LightTheme} from '../../styles/themes/LightTheme';
import {
  Button,
  Card,
  Divider,
  IconButton,
  Modal,
  Portal,
} from 'react-native-paper';

const {width, height} = Dimensions.get('window');

interface ItemProps {
  collection: CollectionRead;
  selected: boolean;
  onPress: () => void;
}

const Item = ({collection, selected, onPress}: ItemProps) => {
  return (
    <Card
      mode={'contained'}
      style={styles.item}
      onPress={onPress}
      theme={{
        colors: {surfaceVariant: 'transparent'},
      }}>
      <Card.Title
        title={collection.name}
        right={() => (
          <IconButton
            icon={selected ? 'check-circle' : 'circle-outline'}
            onPress={onPress}
          />
        )}
      />
    </Card>
  );
};

interface ManageModalProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  userBook: UserBookRead;
  onSubmit?: () => void;
}

interface CollectionState {
  initial: boolean;
  current: boolean;
}

export const ManageModal = ({
  visible,
  setVisible,
  userBook,
  onSubmit,
}: ManageModalProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {collectionsApi} = useContext(ApiContext);
  const [collections, setCollections] = useState<CollectionRead[]>();
  const [collectionStates, setCollectionStates] =
    useState<Record<number, CollectionState>>();

  useEffect(() => {
    const initCollections = async () => {
      const response = await collectionsApi.getCollectionsCollectionsGet(
        bibliUser?.id,
      );
      // Filter out results that bibliUser does not own.
      // TODO use api filter for this logic.
      const ownedCollections = response.data.filter(collection => {
        if (collection.user_links && collection.user_links.length > 0) {
          return collection.user_links.some(
            link =>
              link.user_id === bibliUser?.id &&
              link.type === CollectionUserLinkType.Owner,
          );
        }
        return false;
      });
      setCollections(ownedCollections);
    };
    initCollections().catch(e => console.log(e));
  }, [bibliUser?.id, collectionsApi]);

  useEffect(() => {
    let initStates: Record<number, CollectionState> = {};
    collections?.forEach(collection => {
      const initial =
        userBook.collections?.some(c => c.id === collection.id) ?? false;
      initStates[collection.id] = {
        initial: initial,
        current: initial,
      };
    });
    setCollectionStates(initStates);
  }, [collections, userBook.collections]);

  const onDismiss = () => {
    setCollections(undefined);
    setCollectionStates(undefined);
    setVisible(false);
  };

  const getOnItemPress = (id: number) => {
    return () => {
      setCollectionStates(prevStates => {
        if (!prevStates) {
          return prevStates;
        }
        const currentState = prevStates[id];
        if (!currentState) {
          return prevStates;
        }

        // Update the "current" value to its opposite
        return {
          ...prevStates,
          [id]: {
            ...currentState,
            current: !currentState.current,
          },
        };
      });
    };
  };

  const onSave = async () => {
    if (collectionStates) {
      for (const id in collectionStates) {
        if (collectionStates[id].initial !== collectionStates[id].current) {
          const link: CollectionBookLink = {
            book_id: userBook.book.id,
            collection_id: parseInt(id, 10),
          };
          if (collectionStates[id].current) {
            await collectionsApi.postCollectionBookLinkCollectionBookLinkPost(
              link,
            );
          } else {
            await collectionsApi.deleteCollectionBookLinkCollectionBookLinkDelete(
              link,
            );
          }
        }
      }
    }
    onDismiss();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss}>
        {collections &&
          collectionStates &&
          collections.length === Object.keys(collectionStates).length && (
            <View style={styles.modalContainer}>
              <View style={styles.foregroundContainer}>
                <View style={styles.bookDetail}>
                  <Card>
                    <Card.Title
                      title={userBook.book.title}
                      subtitle={userBook.authors
                        ?.map(author => author.name)
                        .join(', ')}
                      left={() =>
                        userBook.book.cover_link && (
                          <Image
                            source={{uri: userBook.book.cover_link}}
                            style={styles.bookImage}
                          />
                        )
                      }
                      right={() => (
                        <IconButton icon={'close'} onPress={onDismiss} />
                      )}
                    />
                  </Card>
                </View>
                <ScrollView style={{width: '95%', maxHeight: height / 3}}>
                  {collections.map((item, index) => (
                    <View key={item.id.toString()}>
                      <Item
                        collection={item}
                        selected={collectionStates[item.id].current}
                        onPress={getOnItemPress(item.id)}
                      />
                      {index !== collections.length - 1 && (
                        <Divider bold={true} />
                      )}
                    </View>
                  ))}
                </ScrollView>
                <Button mode={'contained'} onPress={onSave}>
                  Save
                </Button>
              </View>
            </View>
          )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  item: {
    marginVertical: -10,
  },
  modalContainer: {
    // backgroundColor: LightTheme.colors.surfaceDisabled,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  foregroundContainer: {
    backgroundColor: LightTheme.colors.surface,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'flex-start',
    width: width - 20,
    padding: 10,
    borderRadius: 20,
    gap: 10,
    marginTop: -(height / 3),
  },
  bookDetail: {
    width: '100%',
  },
  bookImage: {
    height: '200%',
    resizeMode: 'contain',
  },
});
