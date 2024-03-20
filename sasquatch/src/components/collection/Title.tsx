import * as React from 'react';
import {Avatar, Card, IconButton, Menu, TextInput} from 'react-native-paper';
import {StyleProp, View, ViewStyle} from 'react-native';
import {CollectionRead, CollectionType, UserRead} from '../../generated/jericho';
import {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import {UserContext} from '../../context';
import {useNavigation} from '@react-navigation/native';
import {useApi} from '../../api';

const excludeCollectionDeletionTypes: CollectionType[] = [
  CollectionType.Saved,
  CollectionType.Active,
  CollectionType.Complete,
];

interface MenuButtonProps {
  collection: CollectionRead;
  owner?: UserRead;
  currentUser: UserRead;
  onEditPress: () => void;
}

const MenuButton = ({collection, owner, currentUser, onEditPress}: MenuButtonProps) => {
  const navigation = useNavigation();
  const {collectionsApi} = useApi();
  const [visible, setVisible] = useState<boolean>(false);

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
    setVisible(false);
    onEditPress();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<IconButton icon="dots-horizontal" onPress={openMenu} />}>
      <Menu.Item leadingIcon={'pencil'} onPress={editPress} title="Rename" />
      {(!collection.type ||
        !excludeCollectionDeletionTypes.includes(collection.type)) && (
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
      )}
    </Menu>
  );
};

type TitleEditProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
};

const TitleEdit = ({value, onChangeText, onSubmitEditing}: TitleEditProps) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      mode={'outlined'}
      style={{
        width: '100%',
      }}
    />
  );
};

interface Props {
  style: StyleProp<ViewStyle>;
  collection: CollectionRead;
  owner?: UserRead;
}

export const Title = ({style, collection, owner}: Props) => {
  // TODO replace owner tagline with clickable profile picture
  const {user: bibliUser} = useContext(UserContext);
  const isCurrentUser = bibliUser && owner?.id === bibliUser?.id;
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(collection.name);

  const onEditPress = () => {
    setEditMode(!editMode);
  };

  useEffect(() => {
    console.log(editMode);
  }, [editMode]);

  const onSubmit = () => {
    // Update the collection name
    // Assuming setCollection is a function that updates the current collection
    // setCollection({ ...collection, name: newName });
    setEditMode(false); // Exit edit mode
  };

  return (
    <Card.Title
      style={style}
      title={
        editMode ? (
          <TitleEdit
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={onSubmit}
          />
        ) : (
          collection.name
        )
      }
      // title={collection.name}
      titleVariant={'headlineMedium'}
      subtitle={owner ? `Owned by @${owner.tag}` : null}
      subtitleVariant={'labelLarge'}
      left={props => <Avatar.Icon {...props} icon="book" />}
      right={() =>
        isCurrentUser && (
          <MenuButton
            collection={collection}
            owner={owner}
            currentUser={bibliUser}
            onEditPress={onEditPress}
          />
        )
      }
    />
  );
};
