import React from 'react';
import {ActivityRead} from '../../generated/jericho';
import {AddToCollectionCard} from './AddToCollection';
import {ReviewCard} from './Review';
import {FollowUserCard} from './FollowUser';

interface Props {
  activity: ActivityRead;
  refresh?: () => void;
  disableComment?: boolean;
}

const ActivityItem = ({activity, refresh, disableComment}: Props) => {
  const {add_to_collection, review, follow_user} = activity;

  if (add_to_collection) {
    return (
      <AddToCollectionCard
        activity={activity}
        subActivity={add_to_collection}
        refresh={refresh}
        disableComment={disableComment}
      />
    );
  }

  if (review) {
    return (
      <ReviewCard
        activity={activity}
        subActivity={review}
        refresh={refresh}
        disableComment={disableComment}
      />
    );
  }

  if (follow_user) {
    return (
      <FollowUserCard
        activity={activity}
        subActivity={follow_user}
        refresh={refresh}
        disableComment={disableComment}
      />
    );
  }

  return null;
};

export default ActivityItem;
