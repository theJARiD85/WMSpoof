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

import BackIcon from '../assets/icons/BackIcon';
import SampleBarcode from '../assets/icons/SampleBarcode.svg';
import { commonStyles } from '../lib/styles';

export default function ManualSearchScreen2({ navigation, route }) {
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
    navigation.navigate('BarcodeScanner2', {
      manualUPC: manualUPC.trim(),
      ...route.params, // send all original props back
    });
  };

  return (
    <View style={{flex: 1, width: '100%', backgroundColor: '#fff'}}>
      <View style={[commonStyles.header, {height: verticalScale(45)}]}>
        <View style={commonStyles.headerItems}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', columnGap: scale(10)}}>
        <Pressable
            onPress={() => navigation.navigate('BarcodeScanner2', {
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
            <BackIcon style={styles.back} />
          </Pressable>
          <Text style={[commonStyles.headerLabelText, {fontFamily: 'EverydaySansBold'}]}>Enter Number Manually</Text>
          </View>
        </View>
      </View>
    <View style={{height: (height - verticalScale(45)), width: '100%', backgroundColor: '#fff', flexDirection: 'column', padding: scale(10), justifyContent: 'space-between', alignItems: 'center'}}>
        <View style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width: '100%', height: '85%', rowGap: verticalScale(10)}}>
            <View style={{width: '100%', height: verticalScale(24), flexDirection: 'row', borderColor: '#afafafff', borderWidth: scale(1), borderRadius: scale(2)}}>
                <View style={{backgroundColor: '#0053e2', width: '50%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(9), color: '#fff'}}>Barcodes</Text>
                </View>
                <View style={{backgroundColor: '#fff', width: '50%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(9), color: '#000'}}>Receipt codes</Text>
                </View>
            </View>
            <View style={{alignItems: 'center', rowGap: verticalScale(5)}}>
                <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(12), color: '#666666ff'}}>Sample barcode</Text>
                <SampleBarcode />
            </View>
        <View style={{flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'flex-start', rowGap: verticalScale(5), padding: scale(5)}}>
                <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(10), color: '#000'}}>Item barcode number</Text>
                <View style={{borderColor: '#000', width: '100%', height: verticalScale(30), borderWidth: scale(1), borderRadius: scale(3)}}>
                    <TextInput style={{flex: 1, marginLeft: scale(10), fontFamily: 'EverydaySansRegular', width: '100%', fontSize: moderateScale(11)}}value={manualUPC} onChangeText={setManualUPC}  keyboardType="numeric"/>
                </View>
            </View>
        </View>
        <View style={{width: '100%', height: '15%', alignItems: 'center', position: 'absolute', left: scale(10), right: scale(10), bottom: verticalScale(10)}}>
        <Pressable onPress={handleManualSearch} style={[commonStyles.button, {height: verticalScale(25), width: '100%'}]} android_ripple={{ color: 'white'}}>
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
