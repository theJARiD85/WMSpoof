import React from 'react';
import { Text, View, Pressable, StyleSheet, Image } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

import BarcodeContainer from './BarcodeContainer';

const ExitPass = ({
    navigation,
    handleLongPress,
    items,
    quantity,
    militaryTime,
    storeManager,
    storePhone,
    op,
    te,
    storeNumber,
    storeLocation,
    storeCity,
    storeState,
    storeZip,
    numericDate,
    totalSubtotal,
    taxAmount,
    total,
    handleNavigationToReceiptScreen,
    bar1AnimatedStyle,
    bar2AnimatedStyle,
    dayOfWeek,
    formattedDate,
    dateLong,
    time,
    randomName,
}) => (
    <View style={{flex: 1, width: '100%', alignItems: 'center', marginVertical: moderateScale(1)}}>
    <View style={styles.exitPassTopContainer}>
      <View style={styles.exitPass}>
        <Text style={styles.exitPassText}>Exit Pass</Text>
      </View>
      <View style={styles.dateView}>
        <Text style={styles.date}>{dayOfWeek}, {time}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </View>
    <View style={{ alignItems: 'center', width: '93%', height: moderateScale(1), borderWidth: moderateScale(3), borderColor: '#fff', backgroundColor: '#fff', zIndex: 3, bottom: moderateScale(8.1)}} />
    <View style={styles.exitPassBottomContainer}>
      <BarcodeContainer
        handleLongPress={handleLongPress}
        randomName={randomName}
        total={total}
        bar1AnimatedStyle={bar1AnimatedStyle}
        bar2AnimatedStyle={bar2AnimatedStyle}
      />
      <View style={{flexDirection: 'column', zIndex: 1, height: '20%', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: moderateScale(3), width: '93%', bottom: moderateScale(3)}}>
          <View style={{bottom: moderateScale(5), width: '60%', height: '40%', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
            <Text style={styles.total2}>Paid with Walmart Pay</Text>
          </View>
          <View style={{width: '50%', height: '50%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{width: '100%', height: '70%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
              <Image height={24} width={40} source={require('../assets/icons/visa.png')} />
              <Text style={{ fontSize: moderateScale(13.5),fontFamily: 'EverydaySansBold'}}>{' '}Visa 0569</Text>
            </View>
            <View style={{width: '100%', height: '70%', alignItems: 'flex-end', justifyContent: 'center'}}>
              <Text style={{fontSize: moderateScale(13.5), fontFamily: 'EverydaySansBold'}}>${total.toFixed(2)}</Text>
            </View>
          </View>
          <View style={{width: '100%', height: '50%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{width: '50%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
              <Text style={{fontSize: moderateScale(13.5), fontFamily: 'EverydaySansBold'}}>Total paid</Text>
            </View>
            <View style={{width: '50%', height:  '100%', alignItems: 'flex-end', justifyContent: 'center'}} >
              <Text style={{fontSize: moderateScale(13.5), fontFamily: 'EverydaySansBold'}}>${total.toFixed(2)}</Text>
            </View>
          </View>
      </View>
      <View style={styles.receiptButtonContainer}>
        <Pressable 
          onPress={handleNavigationToReceiptScreen}
          hitSlop = {12}
        >
          <Text style={styles.receiptText}>View Receipt</Text>
        </Pressable>
      </View>
    </View>
</View>
);

export default ExitPass;

const styles = StyleSheet.create({
    body: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-start',
        marginVertical: moderateScale(20),
        width: '100%',
      },
      date: {
        fontFamily: 'EverydaySansBold',
        fontSize: moderateScale(20),
        zIndex: 3
      },
      dateView: {
        left: moderateScale(30),
        top: moderateScale(7),
        zIndex: 5,
      },
      exitPass: {
        backgroundColor: '#e8f0fb',
        borderTopLeftRadius: moderateScale(7),
        borderTopRightRadius: moderateScale(7),
        height: '40%',
        justifyContent: 'center',
        width: '100%',
      },
      exitPassBottomContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomLeftRadius: moderateScale(10),
        borderBottomRightRadius: moderateScale(10),
        borderTopColor: '#ffff',
        borderTopLeftRadius: moderateScale(25),
        borderTopRightRadius: moderateScale(25),
        borderTopWidth: moderateScale(1),
        bottom: moderateScale(12),
        elevation: 5,
        flexDirection: 'column',
        height: moderateScale(330),
        justifyContent: 'space-around',
        padding: moderateScale(15),
        width: '100%',
        zIndex: 0,
      },
      exitPassText: {
        color: '#0053e2',
        fontFamily: 'EverydaySansBlackItalic',
        fontSize: moderateScale(17),
        left: moderateScale(20),
        marginTop: moderateScale(2),
      },
      exitPassTopContainer: {
        backgroundColor: '#fff',
        borderBottomColor: '#ffffff',
        borderBottomWidth: moderateScale(2),
        borderRadius: moderateScale(15),
        borderTopLeftRadius: moderateScale(3),
        borderTopRightRadius: moderateScale(3),
        bottom: moderateScale(8),
        elevation: 5,
        flexDirection: 'column',
        height: moderateScale(108),
        marginTop: moderateScale(30),
        width: '100%',
        zIndex: 1
      },
      finalTotal: {
        alignItems: 'space-between',
        flexDirection: 'row',
        height: moderateScale(30),
        justifyContent: 'space-between',
        textAlign: 'right',
        top: moderateScale(10),
        width: '33%',
      },
      name: {
        fontFamily: 'EverydaySansBold',
        fontSize: moderateScale(13)
      },
      receiptButtonContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderColor: '#000',
        borderRadius: moderateScale(33.3),
        borderWidth:moderateScale(1),
        height: moderateScale(35),
        justifyContent: 'center',
        top: moderateScale(8),
        width: moderateScale(140)
      },
      receiptText: {
        fontFamily: 'EverydaySansBold',
        fontSize: moderateScale(14.5),
      },
      total: {
        fontFamily: 'EverydaySansBold',
        fontSize: moderateScale(14.5),
        textAlign: 'right'
      },
      total2: {
        fontFamily: 'EverydaySansBold',
        fontSize: moderateScale(14),
        textAlign: 'right',
      },
      visa: {
        alignItems: 'center',
        flexDirection: 'row',
        height: moderateScale(20),
        justifyContent: 'center',
        top: moderateScale(40),
        width: '100%',
      },

});