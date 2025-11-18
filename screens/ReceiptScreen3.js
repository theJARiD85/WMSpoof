import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import PanPinchView from "react-native-pan-pinch-view";

import BackIcon from '../assets/icons/BackIcon';
import Export from '../assets/icons/Export.svg';
import Receipt from '../components/Receipt';
import { commonStyles } from '../lib/styles';
import { heightPercentageToDP } from 'react-native-responsive-screen';

export default function ReceiptScreen3({ navigation, route }) {
  const {
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
    randomFirstName,
  } = route.params;

  const { width, height } = useWindowDimensions();
  const contentWidth = width;
  const contentHeight = height - heightPercentageToDP(6);
  const containerWidth = width;
  const containerHeight = height - heightPercentageToDP(6);

  const CONTAINER = {
    width: containerWidth,
    height: containerHeight,
  };
  
  const CONTENT = {
    width: contentWidth,
    height: contentHeight 
  };


  const initialScale = (0.15 - (items.length * 0.0025));

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, []);
  

  return (
    <View style={{flex: 1, width: '100%', backgroundColor: '#fff'}}>
      <View style={[commonStyles.header, {height: heightPercentageToDP(6)}]}>
        <View style={commonStyles.headerItems}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', columnGap: scale(10)}}>
        <Pressable
            onPress={() => navigation.navigate('SummaryScreen2', {
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
              randomFirstName,
              randomName,
            })}
            hitSlop={12}
          >
          <BackIcon width={moderateScale(22)} height={moderateScale(22)} />
          </Pressable>
          <Text style={[commonStyles.headerLabelText, {fontFamily: 'EverydaySansBold', marginLeft: scale(5)}]}>Receipt Details</Text>
          </View>
          <View>
          <Export width={moderateScale(30)} height={moderateScale(30)} style={{right: scale(7)}}/>
          </View>
        </View>
      </View>
        <PanPinchView
          minScale={0}
          initialScale={initialScale}
          containerDimensions={{ width: CONTAINER.width, height: CONTAINER.height }}
          contentDimensions={{ width: CONTENT.width, height: CONTENT.height }}
        >
        <View style={{justifyContent: 'center', alignItems: 'center', bottom: verticalScale(50)}}>
        <Receipt
            items={items}
            time={time}
            militaryTime={militaryTime}
            storeNumber={storeNumber}
            storeManager={storeManager}
            storePhone={storePhone}
            storeCity={storeCity}
            storeState={storeState}
            storeZip={storeZip}
            storeLocation={storeLocation}
            numericDate={numericDate}
            formattedNumber={formattedNumber}
            formattedDate={formattedDate}
            totalSubtotal={totalSubtotal}
            taxAmount={taxAmount}
            total={total}
            op={op}
            te={te}
            manualPrice={manualPrice}
            barcode={barcode}
          />
          </View>
        </PanPinchView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff'
  }
});
