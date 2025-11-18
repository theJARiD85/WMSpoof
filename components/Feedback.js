import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const Feedback = ({
}) => (
    <View style={{height: moderateScale(65), width: '100%', backgroundColor: '#fff', borderRadius: moderateScale(9), elevation: 5, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: moderateScale(11)}}>
        <Text style={styles.feedbackText}>How was your Walmart Pay experience?</Text>
        <Text style={styles.feedbackText2}>Give feedback</Text>
  </View>
);

export default Feedback;

const styles = StyleSheet.create({
    feedback: {
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
      },
      feedbackText: {
        fontFamily: 'EverydaySansBold',
        fontSize: moderateScale(12.5),
      },
      feedbackText2: {
        fontFamily: 'EverydaySansRegular',
        fontSize: moderateScale(12),
        textDecorationLine: 'underline',
      }
});