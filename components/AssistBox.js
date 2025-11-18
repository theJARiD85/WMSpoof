import * as React from 'react';
import { View, Text, StyleSheet, Image } from'react-native';
import { moderateScale } from 'react-native-size-matters';

import WalmartBag from '../assets/icons/WalmartBag.svg';
import { commonStyles } from '../lib/styles';

const AssistBox = () => (
<View style={{flex: 1, height: moderateScale(125), width: '100%', flexDirection: 'row', position: 'relative', justifyContent: 'space-around', alignItems: 'center', borderRadius: moderateScale(9), backgroundColor: '#fff', elevation: 5, padding: moderateScale(35)}}>
<View style={{width: '85%', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'flex-start'}}>
  <Image source={require('../assets/images/walmart-plus.png')} style={{ height: moderateScale(26), width: moderateScale(100), right: moderateScale(18), bottom: moderateScale(12) }} />
  <Text style={[commonStyles.text, {fontSize: moderateScale(12), right: moderateScale(15), bottom: moderateScale(3)}]}>Qualify for government assistance? Get 50% off membership with Walmart+ Assist!</Text>
    <View style={[commonStyles.button, {width: '40%', height: moderateScale(23), top: moderateScale(8), right: moderateScale(13)}]}>
      <Text style={[commonStyles.buttonText, {fontSize: moderateScale(12.5)}]}>Learn more</Text>
    </View>
    <Text style={styles.termsText}>**Terms apply</Text>
</View>
<View style={{elevation: 5, width: '15%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
  <WalmartBag style={{width: moderateScale(60), height: moderateScale(60), resizeMode: 'contain'}} /> 
</View>
</View>
);

export default AssistBox;

const styles = StyleSheet.create({
    assistButtonContainer: {
        alignItems: 'center',
        backgroundColor: '#0053e2',
        borderRadius: moderateScale(33.3),
        height: moderateScale(22),
        justifyContent: 'center',
        position: 'absolute',
        right: moderateScale(20),
        top: moderateScale(5),
        width: moderateScale(100),
      },
      assistButtonText: {
        color: '#fff',
        fontFamily: 'EverydaySansMedium',
        fontSize: moderateScale(10),
      },
      termsText: {
        color: '#646363',
        fontFamily: 'EverydaySansRegular',
        fontSize: moderateScale(9.5),
        right: moderateScale(15),
        top: moderateScale(20),
      },
      wpText2: {
        bottom: moderateScale(14),
        color: '#000',
        fontFamily: 'EverydaySansMedium',
        fontSize: moderateScale(13),
        right: moderateScale(7),
      },
    });