import * as React from 'react';
import {Avatar, Button, Card, IconButton, Menu, Modal, Portal, TextInput} from 'react-native-paper';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {CollectionPut, CollectionRead, CollectionType, UserRead} from '../../generated/jericho';
import {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import {UserContext} from '../../context';
import {useNavigation} from '@react-navigation/native';
import {useApi} from '../../api';
import {LightTheme} from '../../styles/themes/LightTheme';

const nonEditableCollectionTypes: CollectionType[] = [
  CollectionType.Saved,
  CollectionType.Active,
  CollectionType.Complete,
];

interface MenuButtonProps {
  collection: CollectionRead;
  setCollection: Dispatch<SetStateAction<CollectionRead>>;
  owner?: UserRead;
}

const MenuButton = ({collection, setCollection, owner}: MenuButtonProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const navigation = useNavigation();
  const {collectionsApi} = useApi();
  const [visible, setVisible] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [collectionPut, setCollectionPut] = useState<CollectionPut>();

  const isOwner = owner?.id === bibliUser?.id;
  const editable =
    isOwner &&
    (!collection?.type ||
      !nonEditableCollectionTypes.includes(collection?.type));

  useEffect(() => {
    if (editable) {
      setCollectionPut({
        id: collection.id,
        name: collection.name,
      });
    }
  }, [collection.id, collection.name, editable]);

  if (!editable) {
    return null;
  }

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const deletePress = async () => {
    try {
      await collectionsApi.deleteCollectionCollectionCollectionIdDelete(
        collection.id,
      );
    } catch (error) {
      console.error('Error creating collection:', error);
    }
    navigation.goBack();
  };

  const editPress = () => {
    closeMenu();
    setEditMode(true);
  };

  const onEditSubmit = async () => {
    if (collectionPut) {
      try {
        const result = await collectionsApi.putCollectionCollectionPut(
          collectionPut,
        );
        setCollection(result.data);
      } catch (e) {
        console.log(e);
      }
    }
    setEditMode(false);
  };

  const clearModal = () => {
    setEditMode(false);
  };

  return (
    <>
      <Portal>
        <Modal visible={editMode} onDismiss={clearModal}>
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              autoFocus={true}
              label="Collection Name"
              value={collectionPut?.name}
              onChangeText={name =>
                setCollectionPut({...collectionPut, name: name})
              }
            />
            <Button mode="contained" onPress={onEditSubmit}>
              Submit
            </Button>
            <IconButton
              style={styles.closeButton}
              icon="close"
              iconColor={LightTheme.colors.outline}
              onPress={clearModal}
            />
          </View>
        </Modal>
      </Portal>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            icon="dots-horizontal"
            onPress={openMenu}
            // disabled={disabled ?? true}
          />
        }>
        {editable && (
          <>
            <Menu.Item
              leadingIcon={'pencil'}
              onPress={editPress}
              title="Rename"
            />
            <Menu.Item
              leadingIcon={'trash-can-outline'}
              onPress={deletePress}
              title="Delete"
              theme={{
                colors: {
                  onSurface: 'red',
                  onSurfaceVariant: 'red',
                },
              }}
            />
          </>
        )}
      </Menu>
    </>
  );
};

interface Props {
  style: StyleProp<ViewStyle>;
  collection: CollectionRead;
  owner?: UserRead;
}

export const Title = ({style, collection: initialCollection, owner}: Props) => {
  const [collection, setCollection] =
    useState<CollectionRead>(initialCollection);

  useEffect(() => {
    setCollection(initialCollection);
  }, [initialCollection]);

  return (
    <Card.Title
      style={style}
      title={collection.name}
      titleVariant={'headlineMedium'}
      subtitle={owner ? `Owned by @${owner.tag}` : null}
      subtitleVariant={'labelLarge'}
      left={props => <Avatar.Icon {...props} icon="book" />}
      right={() => (
        <MenuButton
          collection={collection}
          setCollection={setCollection}
          owner={owner}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: LightTheme.colors.surface,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    padding: 15,
    borderRadius: 20,
    shadowRadius: 4,
    elevation: 5,
    gap: 10,
  },
  input: {
    marginHorizontal: 20,
    width: 200,
  },
  closeButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: -5,
  },
  addButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 20,
  },
});
