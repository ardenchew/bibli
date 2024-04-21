import React from 'react';
import {StyleProp, Text, TextStyle} from 'react-native';
import moment from 'moment';

interface TimeAgoProps {
  datetime: string;
  style?: StyleProp<TextStyle>;
}

const TimeAgo = ({datetime, style}: TimeAgoProps) => {
  // Parse the datetime string using moment
  const parsedDateTime = moment.utc(datetime);

  // Get the current time
  const now = moment().utc();

  // Calculate the difference between the parsed datetime and the current time
  const diffInSeconds = now.diff(parsedDateTime, 'seconds');
  const diffInMinutes = now.diff(parsedDateTime, 'minutes');
  const diffInHours = now.diff(parsedDateTime, 'hours');
  const diffInDays = now.diff(parsedDateTime, 'days');
  const diffInWeeks = now.diff(parsedDateTime, 'weeks');
  const isSameYear = now.year() === parsedDateTime.year();

  // Define the format based on the rules
  let formattedDateTime;
  if (diffInSeconds < 60) {
    formattedDateTime = `${diffInSeconds}s`;
  } else if (diffInMinutes < 60) {
    formattedDateTime = `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    formattedDateTime = `${diffInHours}h`;
  } else if (diffInDays < 7) {
    formattedDateTime = `${diffInDays}d`;
  } else if (diffInWeeks < 4) {
    formattedDateTime = `${diffInWeeks}w`;
  } else if (isSameYear) {
    formattedDateTime = parsedDateTime.format('MMM DD');
  } else {
    formattedDateTime = parsedDateTime.format('MMM DD, YYYY');
  }

  return <Text style={style}>{formattedDateTime}</Text>;
};

export default TimeAgo;
