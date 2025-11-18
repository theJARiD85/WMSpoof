import React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const CapOne = ({
    params,
}) => (
<View style={{height: moderateScale(85), flexDirection: 'row', padding: moderateScale(5), elevation: 5, borderRadius: moderateScale(9), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginVertical: moderateScale(4)}}>
    <View style={{ flex: 0.2, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={require('../assets/images/capOne.png')} />
    </View>
    <View style={{ flex: 0.8, justifyContent: 'center', alignItems: 'flex-start' }}>
      <Text style={styles.capOneText}>Earn 5% cash back on Walmart.com.</Text>
      <Text style={styles.capOneText}>See if you're pre-approved with no credit risk.</Text>
      <Text style={styles.capOneText2}>Learn more</Text>
    </View>
</View>
);

export default CapOne;

const styles = StyleSheet.create({
    capOneText: {
        fontFamily: 'EverydaySansRegular',
        fontSize: moderateScale(12.5),
        left: moderateScale(10),
        textAlign: 'left',
      },
      capOneText2: {
        fontFamily: 'EverydaySansRegular',
        fontSize: moderateScale(11),
        left: moderateScale(10),
        textAlign: 'left',
        textDecorationLine: 'underline',
      },
});