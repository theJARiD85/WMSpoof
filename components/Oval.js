import React from 'react';
import { View, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const Oval = () => {
  return <View style={styles.oval} />;
};

const styles = StyleSheet.create({
  oval: {
    height: verticalScale(500),
    width: scale(400),
    borderRadius: scale(200), // makes it circular
    backgroundColor: '#fdbd31',
    transform: [{ scaleX: 1.75}], // stretches it horizontally into an oval
  },
});

export default Oval;