import {Dispatch, SetStateAction} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';
import {SearchType} from './const';

const iconSearchTypeMap: Record<SearchType, string> = {
  [SearchType.Books]: 'book-outline',
  [SearchType.Authors]: 'account-box-edit-outline',
  [SearchType.Members]: 'account-cowboy-hat-outline',
};

interface OmniSearchTypeButtonProps {
  type: SearchType;
  searchType: SearchType;
  setSearchType: Dispatch<SetStateAction<SearchType>>;
}

const OmniSearchTypeButton = ({
  type,
  searchType,
  setSearchType,
}: OmniSearchTypeButtonProps) => {
  const onPress = () => setSearchType(type);
  return (
    <Button
      mode={type === searchType ? 'contained' : 'outlined'}
      onPress={onPress}
      icon={iconSearchTypeMap[type]}>
      {type[0].toUpperCase()}
      {type.substring(1)}
    </Button>
  );
};

interface OmniSearchTypeButtonsProps {
  searchType: SearchType;
  setSearchType: Dispatch<SetStateAction<SearchType>>;
  includedSearchTypes: SearchType[];
}

export const OmniSearchTypeButtons = ({
  searchType,
  setSearchType,
  includedSearchTypes,
}: OmniSearchTypeButtonsProps) => {
  const buttons = includedSearchTypes.map(type => (
    <OmniSearchTypeButton
      key={type}
      type={type}
      searchType={searchType}
      setSearchType={setSearchType}
    />
  ));
  return <View style={styles.buttonContainer}>{buttons}</View>;
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 5,
  },
});
