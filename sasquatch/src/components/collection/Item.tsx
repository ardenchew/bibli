import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Title, Paragraph, Avatar} from 'react-native-paper';
import {CollectionRead} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme'; // Adjust the import path

interface CollectionItemProps {
  collection: CollectionRead;
}

const CollectionItem: React.FC<CollectionItemProps> = ({collection}) => {
  return (
    <Card
      mode={'contained'}
      style={styles.container}
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

export default CollectionItem;
