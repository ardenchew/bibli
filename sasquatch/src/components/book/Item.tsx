import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Avatar} from 'react-native-paper';
import {BookRead} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme'; // Adjust the import path

interface Props {
  book: BookRead;
}

const Item = ({book}: Props) => {
  return (
    <Card
      mode={'contained'}
      style={styles.container}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}>
      <Card.Title
        title={book.title}
        subtitle={book.id}
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
