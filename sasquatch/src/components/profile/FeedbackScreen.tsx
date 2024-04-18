import React, {useContext, useState} from 'react';
import {KeyboardAvoidingView, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import Button from '../../components/button/Button';
import {ApiContext, UserContext} from '../../context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-simple-toast';

interface SubmitButtonProps {
  comment: string;
}

function randomToastString(): string {
  const quotes: string[] = [
    'From failure to failure, one discovers how to succeed.\n- F. Scott Fitzgerald, Tender Is the Night',
    'The greatest gift you can give someone is your honest feedback\n- George Orwell, 1984',
    "A man's errors are his portals of discovery.\n- James Joyce, Ulysses",
    'The greatest compliment that was ever paid me was when one asked me what I thought\n- Henry David Thoreau, Walden',
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

const SubmitButton = ({comment}: SubmitButtonProps) => {
  const {usersApi} = useContext(ApiContext);
  const {user: bibliUser} = useContext(UserContext);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const showToast = () => {
    Toast.showWithGravityAndOffset(
      randomToastString(),
      Toast.LONG,
      Toast.BOTTOM,
      0,
      -70,
    );
  };

  const onPress = async () => {
    if (bibliUser && comment !== '') {
      usersApi
        .postFeedbackUserFeedbackPost({
          user_id: bibliUser.id,
          comment: comment,
        })
        .catch(createError => {
          console.error('Error submitting feedback:', createError);
        })
        .finally(() => {
          showToast();
          navigation.popToTop();
        });
    }
  };

  return (
    <Button
      onPress={onPress}
      mode="contained"
      disabled={comment === ''}
      style={styles.submitButton}>
      Submit
    </Button>
  );
};

const FeedbackPrompt = `
Thanks for being a part of bibli! We're thrilled to have you and value your feedback. 

Here's our current list of upcoming features:
  -Discovery page for finding recommended books
  -Editing existing reviews
  -Notifications
  -Tagging users in comments
  -Liking comments
  -Custom collection icons
  -Author pages
  -Ability to block users
  -Improved global state navigation
  -Book clubs
`;

const FeedbackScreen = () => {
  const [comment, setComment] = useState<string>('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps={'handled'}>
        <Text variant="headlineSmall">Submit Feedback</Text>
        <Text style={{lineHeight: 20}}>{FeedbackPrompt}</Text>
        <View>
          <TextInput
            label={'Feedback'}
            mode="outlined"
            style={{height: 100}}
            defaultValue={comment}
            multiline={true}
            onChangeText={setComment}
          />
        </View>
        <SubmitButton comment={comment} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    margin: 20,
  },
  container: {
    gap: 10,
  },
  submitButton: {
    alignSelf: 'center',
  },
});

export default FeedbackScreen;
