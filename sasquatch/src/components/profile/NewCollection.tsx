import React, {useContext, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, IconButton, Modal, Portal, TextInput} from 'react-native-paper';
import {
  CollectionPut,
  CollectionRead,
  CollectionUserLinkPut,
  CollectionUserLinkType,
} from '../../generated/jericho';
import {Dispatch, SetStateAction} from 'react';
import {ApiContext, UserContext} from '../../context';
import {LightTheme} from '../../styles/themes/LightTheme';

interface CollectionsProps {
  collections: CollectionRead[];
  setCollections: Dispatch<SetStateAction<CollectionRead[]>>;
}

export const NewCollection = ({
  collections,
  setCollections,
}: CollectionsProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {collectionsApi} = useContext(ApiContext);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newCollectionName, setNewCollectionName] = useState<string>('');

  const clearModal = () => {
    setNewCollectionName('');
    setModalVisible(false);
  };

  const createCollection = async () => {
    if (!bibliUser?.id) {
      return null;
    }
    clearModal();
    try {
      const collectionPut: CollectionPut = {
        name: newCollectionName,
      };
      const collectionResponse =
        await collectionsApi.putCollectionCollectionPut(collectionPut);
      const newCollection = collectionResponse.data;

      const collectionUserLinkPut: CollectionUserLinkPut = {
        collection_id: newCollection.id,
        user_id: bibliUser?.id,
        type: CollectionUserLinkType.Owner,
      };
      const linkResponse =
        await collectionsApi.putCollectionUserLinkCollectionUserLinkPut(
          collectionUserLinkPut,
        );

      newCollection.user_links = [linkResponse.data];
      const updatedCollections = [...collections, newCollection];
      setCollections(updatedCollections);
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  return (
    <>
      <Portal>
        <Modal visible={modalVisible} onDismiss={clearModal}>
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              autoFocus={true}
              label="Collection Name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
            />
            <Button
              mode="contained"
              disabled={newCollectionName === ''}
              onPress={createCollection}>
              Create
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
      <Button
        compact={true}
        icon="plus"
        onPress={() => setModalVisible(true)}
        mode="elevated"
        children="New Collection"
        style={styles.addButton}
      />
    </>
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
