import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';

import BackIcon from '../assets/icons/BackIcon';
import SampleBarcode from '../assets/icons/SampleBarcode.svg';
import { commonStyles } from '../lib/styles';

export default function ManualSearchScreen({ navigation, route }) {
    const [manualUPC, setManualUPC] = useState('');
  const {
    scannedItems,
    items,
    time,
    militaryTime,
    storeNumber,
    storeLocation,
    numericDate,
    totalSubtotal,
    taxAmount,
    total,
    dayOfWeek,
    formattedDate,
    dashedNumber,
    storeManager,
    selectedStoreDetails,
    formattedDateWithMonthShort,
    storePhone,
    storeCity,
    storeState,
    storeZip,
    op,
    te,
    randomName,
    formattedNumber,
    taxRate,
    barcode,
    manualPrice,
  } = route.params;

  const { width, height } = useWindowDimensions();
  
    const handleManualSearch = () => {
    if (!manualUPC.trim()) return;
    navigation.navigate('BarcodeScanner', {
      manualUPC: manualUPC.trim(),
      ...route.params, // send all original props back
    });
  };

  return (
    <View style={{flex: 1, width: '100%', backgroundColor: '#fff'}}>
      <View style={[commonStyles.header, {height: heightPercentageToDP(6)}]}>
        <View style={commonStyles.headerItems}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', columnGap: scale(10)}}>
        <Pressable
            onPress={() => navigation.navigate('BarcodeScanner', {
                scannedItems,
              items: items || [],
              storeNumber,
              totalSubtotal,
              taxAmount,
              dayOfWeek,
              total,
              formattedDate,
              formattedNumber,
              dashedNumber,
              formattedDateWithMonthShort,
              selectedStoreDetails,
              time,
              taxRate,
              storeLocation,
              storeCity,
              storeState,
              storeZip,
              op,
              te,
              storeManager,
              storePhone,
              militaryTime,
              numericDate,
              randomName,
              taxRate,
              barcode,
            })}
            hitSlop={12}
          >
            <BackIcon width={scale(18)} height={scale(18)}style={styles.back} />
          </Pressable>
          <Text style={[commonStyles.headerLabelText, {fontFamily: 'EverydaySansBold'}]}>Enter Number Manually</Text>
          </View>
        </View>
      </View>
    <View style={{height: (heightPercentageToDP(90)), width: widthPercentageToDP(100), backgroundColor: '#fff', flexDirection: 'column', padding: scale(10), justifyContent: 'space-between', alignItems: 'center'}}>
        <View style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width: '100%', height: '85%', rowGap: verticalScale(10)}}>
            <View style={{width: widthPercentageToDP(94), height: heightPercentageToDP(5), flexDirection: 'row', borderColor: '#afafafff', borderWidth: scale(1), borderRadius: scale(5)}}>
                <View style={{backgroundColor: '#0053e2', width: widthPercentageToDP(45), height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(9.5), color: '#fff'}}>Barcodes</Text>
                </View>
                <View style={{backgroundColor: '#fff', width: widthPercentageToDP(45), height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(9.5), color: '#000'}}>Receipt codes</Text>
                </View>
            </View>
            <View style={{alignItems: 'center', rowGap: verticalScale(0)}}>
                <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(12.5), color: '#666666ff'}}>Sample barcode</Text>
                <SampleBarcode width={widthPercentageToDP(50)} />
            </View>
        <View style={{flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'flex-start', rowGap: verticalScale(5), padding: scale(5)}}>
                <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5), color: '#000'}}>Item barcode number</Text>
                <View style={{borderColor: '#000', width: '100%', height: heightPercentageToDP(5), borderWidth: scale(1), borderRadius: moderateScale(5)}}>
                    <TextInput style={{flex: 1, marginLeft: scale(10), fontFamily: 'EverydaySansRegular', width: '100%', fontSize: moderateScale(11)}}value={manualUPC} onChangeText={setManualUPC}  keyboardType="numeric"/>
                </View>
            </View>
        </View>
        <View style={{width: widthPercentageToDP(95), position: 'absolute', bottom: verticalScale(50), alignItems: 'center', justifyContent: 'flex-end'}}>
        <Pressable onPress={handleManualSearch} style={[commonStyles.button, {height: heightPercentageToDP(4.5), width: '100%'}]} android_ripple={{ color: 'white'}}>
            <Text style={commonStyles.buttonText}>Search</Text>
        </Pressable>  
        </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff'
  }
});
