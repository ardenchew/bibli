import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Avatar} from 'react-native-paper';
import {CollectionRead} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack'; // Adjust the import path

interface Props {
  collection: CollectionRead;
}

const CardPress = (collection: CollectionRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Collection', {
      collection: collection,
    });
  };
};

const Item = ({collection}: Props) => {
  return (
    <Card
      mode={'contained'}
      style={styles.container}
      onPress={CardPress(collection)}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}>
      <Card.Title
        title={collection.name}
        subtitle={collection.type}
        left={props => <Avatar.Icon {...props} icon="book" />}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 10,
    elevation: 2,
  },
});

export default Item;
