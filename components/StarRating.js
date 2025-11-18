import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { moderateScale, scale, verticalScale } from'react-native-size-matters'; // If you are using scaling

import Star from '../assets/icons/Star.svg';
import StarOutline from '../assets/icons/StarOutline.svg';
import StarHalf from '../assets/icons/StarHalf.svg';
import { commonStyles } from '../lib/styles';

const StarRating = ({ rating, totalRatings }) => {
  const maxStars = 5;

  // Calculate the number of filled, half-filled, and empty stars
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating - filledStars >= 0.5;
  const emptyStars = maxStars - filledStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* Render filled stars */}
      {Array.from({ length: filledStars }).map((_, index) => (
        <Star key={`filled-${index}`} width={scale(10)} height={verticalScale(10)} />
      ))}
      {/* Render half star if needed */}
      {hasHalfStar && <StarHalf width={scale(10)} height={verticalScale(10)} />}
      {/* Render empty stars */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <StarOutline key={`empty-${index}`} width={scale(10)} height={verticalScale(10)} />
      ))}
      <Text style={[commonStyles.text, { left: scale(2), fontSize: moderateScale(8.5), color: '#909090'}]}>{totalRatings}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    columnGap: moderateScale(2),
    flexDirection: 'row'
  },
});

export default StarRating;
