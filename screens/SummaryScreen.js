import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Image, TouchableOpacity, Animated, Easing, Alert, BackHandler, useWindowDimensions } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { commonStyles } from '../lib/styles';
import Barcode from 'react-native-barcode-svg';
import BackIcon from '../assets/icons/BackIcon';
import WalmartPlus from '../assets/images/WalmartPlus';
import CartIcon from '../assets/icons/CartIcon.svg';
import Home from '../assets/icons/Home.svg';
import Store from '../assets/icons/Store.svg';
import Receipt from '../assets/icons/Receipt.svg';
import ExpandIcon5 from '../assets/icons/ExpandIcon5.svg';
import Wallet from '../assets/icons/Wallet.svg';
import Visa from '../assets/icons/Visa.svg';
import { useKeepAwake } from 'expo-keep-awake';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';

function stripSeconds(timeString = '') {
  if (typeof timeString !== 'string') return '';
  const parts = timeString.trim().split(':');
  if (parts.length < 2) return timeString;

  const h = parts[0] || '';
  const m = parts[1] ? parts[1].replace(/\D/g, '') : '';
  const rest = parts[2] || '';
  const upper = timeString.toUpperCase();

  const period = (rest.includes('AM') || rest.includes('PM'))
    ? rest.split(' ').pop()
    : (upper.includes('AM') ? 'AM' :
       upper.includes('PM') ? 'PM' : '');

  return `${h}:${m}${period}`.trim();
}

export default function SummaryScreen({ route, navigation }) {
  useKeepAwake();
    const {
      items,
      total,
      totalSubtotal,
      taxAmount,
      dayOfWeek,
      formattedDate,
      formattedNumber,
      selectedStoreDetails,
      time,
      taxRate,
      storePhone,
      storeNumber,
      storeLocation,
      dashedNumber,
      storeCity,
      storeState,
      storeZip,
      storeManager,
      recentOrderId,
      op,
      te,
      tr,
      militaryTime,
      numericDate,
      dateLong,
      formattedDateWithMonthShort,
      store,
      barcode,
      randomName,
      randomFirstName,
      manualPrice,
      createdAt,
    } = route.params;
  const bar1Anim = useRef(new Animated.Value(0)).current;
  const bar2Anim = useRef(new Animated.Value(0)).current;
  const [timeNoSeconds, setTimeNoSeconds] = useState('');
  const [canEdit, setCanEdit] = useState(true);
  const { height } = useWindowDimensions();
  const EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
    useEffect(() => {
      const backAction = () => true;
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => backHandler.remove();
    }, []);

useEffect(() => {
  if (!createdAt) return;

  const created = new Date(createdAt).getTime();
  const now = Date.now();

  // If already expired (e.g., returning to screen later)
  if (now - created >= EDIT_WINDOW_MS) {
    setCanEdit(false);
    return;
  }

  // Immediately allow editing at mount
  setCanEdit(true);

  // 🧭 Calculate exact remaining time
  const remaining = EDIT_WINDOW_MS - (now - created);
  console.log(`⏳ Editing allowed for ${Math.round(remaining / 1000)}s more`);

  // 💡 Set one timeout to lock editing exactly at expiration
  const timeoutId = setTimeout(() => {
    console.log('🚫 Edit window expired — navigation now disabled');
    setCanEdit(false);
  }, remaining);

  // ✅ Optional: Update every few seconds for UI feedback (progress bar, countdown, etc.)
  const intervalId = setInterval(() => {
    const elapsed = Date.now() - created;
    setCanEdit(elapsed < EDIT_WINDOW_MS);
  }, 10000); // every 10s

  return () => {
    clearTimeout(timeoutId);
    clearInterval(intervalId);
  };
}, [createdAt]);

  useEffect(() => {
    setTimeNoSeconds(stripSeconds(time));
  }, [time]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bar1Anim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bar1Anim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bar2Anim, {
          toValue: 1,
          duration: 1150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bar2Anim, {
          toValue: 0,
          duration: 1050,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bar1Anim, bar2Anim]);


  const bar1TranslateY = bar1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, verticalScale(35)], // Adjust based on the height of the barcode
  });

  const bar2TranslateY = bar2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, verticalScale(35)], // Adjust based on the height of the barcode
  });

const handleEditOrder = () => {
  if (!canEdit) {
    Alert.alert(
      "Edit Window Expired",
      "You can no longer modify this order after 5 minutes have passed."
    );
    return;
  }

  navigation.navigate('UpdaterMainPage', {
      items,
      time,
      storeLocation,
      militaryTime,
      storeLocation,
      store,
      storeCity,
      storeState,
      storeZip,
      op,
      te,
      storePhone,
      selectedStoreDetails,
      storeManager,
      tr,
      manualPrice,
      totalSubtotal,
      taxAmount,
      dayOfWeek,
      total,
      formattedDate,
      formattedNumber,
      dateLong,
      time,
      taxRate,
      dashedNumber,
      tr,
      militaryTime,
      numericDate,
      randomFirstName,
      randomName,
      taxRate,
      barcode,
  });
};

    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const capitalizeFirstLetter = (string) =>
    string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : '';

  return (
    <View style={[styles.container, { height: height }]}>
      <View style={[commonStyles.header, {height: heightPercentageToDP(6)}]}>
        <View style={[commonStyles.headerItems, { alignItems: 'flex-end', justifyContent: 'space-between', columnGap: scale(10), paddingBottom: verticalScale(2)}]}>
          <View style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-start', columnGap: scale(10), bottom: verticalScale(3)}]}>
            <Pressable
              style={styles.exit}
              onPress={() => navigation.navigate('ShopScreen', {
                items: items || [],
                storeNumber,
                totalSubtotal,
                taxAmount,
                dayOfWeek,
                total,
                formattedDate,
                formattedDateWithMonthShort,
                timeNoSeconds,
                total,
                formattedNumber,
                dateLong,
                time,
                taxRate,
                storeLocation,
                dashedNumber,
                storeCity,
                storeState,
                storeZip,
                op,
                te,
                storeManager,
                storePhone,
                tr,
                militaryTime,
                numericDate,
                store,
                randomFirstName,
                randomName,
                taxRate,
                barcode,
              })}
              hitSlop={12}
            >
              <BackIcon width={scale(18)} height={scale(18)} />
            </Pressable>
            <Text style={[commonStyles.headerLabelText]}>{formattedDateWithMonthShort} purchase</Text>
          </View>
          <View style={{ top: verticalScale(2), flexDirection: 'column', alignItems: 'center' }}>
            <CartIcon height={verticalScale(20)} width={scale(27)} />
            <Text style={{ fontFamily: 'EverydaySansRegular', fontSize: moderateScale(6), color: '#fff', textAlign: 'center' }}>$0.00    </Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{width: '100%', alignItems: 'flex-start', right: scale(8)}}>
          <Text style={[styles.exitPassText]}>Show Exit Pass to an associate at exit</Text>
        </View>
        <View style={{height: verticalScale(155), width: '100%'}}>
          <View style={styles.exitPassTopContainer}>
            <View style={{flexDirection: 'column', width: '100%', height: '100%', rowGap: verticalScale(10)}}>
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'space-between', width: '100%', height: '35%'}}>
                <View style={{width: '25%'}}>
                  <Text style={[styles.exitPassText2]}>Exit Pass</Text>
                </View>
                <View style={{width: '75%'}}>
                  <Text style={[commonStyles.titleText, {textAlign: 'right', fontSize: moderateScale(10.5), marginRight: scale(4)}]}>{formattedDateWithMonthShort} at {timeNoSeconds}</Text>
                </View>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'flex-start', width: '100%', height: '35%', marginLeft: scale(8)}}>
                <Text style={styles.name}>{randomFirstName} {randomName}</Text>
              </View>
            </View>
          </View>
          <View style={styles.exitPassBottomContainer}>
              <View style={{ width: '100%', justifyContent: 'flex-start', flexDirection: 'row', height: verticalScale(15), top: verticalScale(10) }}>
                <Text style={styles.total}>Total </Text>
                <Text style={styles.price}>${total.toFixed(2)}</Text>
              </View>
                    <View style={[styles.barcodeContainer, { alignItems: 'center', top: verticalScale(15), justifyContent: 'center', overflow: 'hidden' }]}>
                    <Pressable onLongPress={() => handleEditOrder()} delayLongPress={500} style={{width: '100%', height: '85%', alignItems: 'center', justifyContent: 'center'}}>
                        <Animated.View style={[styles.bar, { transform: [{ translateY: bar1TranslateY }] }]} />
                          <Barcode maxWidth={widthPercentageToDP(85)} singleBarWidth={scale(1.4)} backgroundColor={'#FFFFFF00'} height={verticalScale(35)} value={barcode} format='CODE39'style={{alignSelf: 'center', justifyContent: 'center'}}/>
                        <Animated.View style={[styles.bar2, { transform: [{ translateY: bar2TranslateY }] }]} />
                      </Pressable>
                      <View style={{ top: verticalScale(33), alignItems: 'center', justifyContent: 'center', width: '100%', height: verticalScale(8), backgroundColor: '#fff', bottom: verticalScale(10) }}>
                        <Text style={styles.tc}>TC# {formattedNumber}</Text>
                      </View>
                    </View>
          </View>
        </View>
        <View style={{width: '100%', height: verticalScale(38), backgroundColor: '#fff', columnGap: scale(8), borderWidth: scale(0.5), borderRadius: scale(8), borderColor: '#cdcdcd', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <Home width={scale(12)} height={scale(12)} />
          <Text style={[commonStyles.text, {fontSize: moderateScale(9), textDecorationLine:'underline'}]} >How satisfied were you with your visit?</Text>
        </View>
        <View style={{height: 'auto', width: '100%', borderTopLeftRadius: scale(8), borderTopRightRadius: scale(8), borderColor: '#aeaeae', elevation: 2, borderRadius: scale(8), borderWidth: scale(0.25)}}>
          <View style={{width: '100%', height: verticalScale(65), backgroundColor: '#fff', rowGap: scale(8), borderBottomWidth: scale(0.5), borderTopLeftRadius: scale(8), borderTopRightRadius: scale(8),  borderBottomColor: '#cdcdcd', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
            <View style={{paddingLeft: scale(8), paddingTop: verticalScale(5), flexDirection: 'row', width: '100%', height: '60%', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
              <View style={{width: '11.5%', height: '100%'}}>
                <Store />
              </View>
              <View style={{width: '88.5%', height: '100%', flexDirection: 'column'}}>
                <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(9), marginTop: verticalScale(1)}}>Store Purchase</Text>
                <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(11)}}>{formattedDateWithMonthShort} purchase</Text>
              </View>
            </View>
            <Pressable
              onPress={() => navigation.navigate('ReceiptScreen', {
                  items: items || [],
                  militaryTime,
                  storeNumber,
                  storeLocation,
                  storeCity,
                  storeState,
                  storeZip,
                  numericDate,
                  totalSubtotal,
                  formattedNumber,
                  formattedDateWithMonthShort,
                  dashedNumber,
                  taxRate,
                  taxAmount,
                  total,
                  store,
                  op,
                  te,
                  tr,
                  randomFirstName,
                  randomName,
                  dayOfWeek,
                  formattedDate,
                  barcode,
                  storeManager,
                  dateLong,
                  time,
                  barcode,
                  storePhone,
                })}
                style={{paddingLeft: scale(8), paddingBottom: verticalScale(5), flexDirection: 'row', width: '100%', height: '40%', alignItems: 'flex-start', marginLeft: scale(4), bottom: scale(0), justifyContent: 'flex-start', columnGap: scale(8)}}
              >
              <Receipt height={heightPercentageToDP(2)}/>
              <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(10.5), marginTop: verticalScale(1), textDecorationLine: 'underline'}}>Receipt details</Text>
            </Pressable>
          </View>
          <View style={{width: '100%', height: verticalScale(60), backgroundColor: '#fff',  borderBottomWidth: scale(0.5), borderBottomColor: '#cdcdcd', paddingLeft: scale(8)}}>
            <View style={{height: '100%',  flexDirection: 'column', alignItems: 'flex-start', rowGap: scale(6), justifyContent: 'center'}}>
              <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5)}}>Store location</Text>
              <View>
                <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(10.5), marginTop: verticalScale(1)}}>{capitalizeFirstLetter(storeCity)} Supercenter</Text>
                <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(10.5), marginTop: verticalScale(1)}}>{storeLocation}, {storeCity}, {storeState} {storeZip}</Text>
              </View>  
            </View>
          </View>
          <View
              style={{
                width: '100%',
                height: verticalScale(40),
                backgroundColor: '#fff',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: scale(10),
                borderBottomWidth: verticalScale(1),
                borderColor: '#efefef',
              }}
            >
              <Text
                style={{ fontFamily: 'EverydaySansBold', fontSize: moderateScale(11.5) }}
              >
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </Text>
              <ExpandIcon5 />
            </View>
            {items.map((item, index) => (
              
              <View key={index} style={[styles.itemContainer, index === items.length - 1 && styles.lastItemContainer]}>
                {index === 0 && (
                  <View style={{width: '100%', height: '20%'}}>
                    <Text style={{ color: '#000', fontFamily: 'EverydaySansBold', fontSize: moderateScale(11.5) }}>Shopped</Text>
                  </View>
                )}
                <View style={styles.itemContent}>
                  <View style={{width: '20%', height: '100%'}}>
                    <Image source={{ uri: item.firstPhoto }} style={styles.itemImage} />
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle}>{(item.name)}</Text>
                    <Text style={styles.itemText}>Qty {item.quantity || 1}</Text>
                  </View>
                  <View style={{width: '20%', height: '100%', alignItems: 'flex-end'}}>
                    <Text style={styles.itemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
                  </View>
                </View>
                <View style={{width: '100%', height: '25%', alignItems: 'flex-end', justifyContent: 'center', top: verticalScale(-3)}}>
                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Add</Text>
                  </TouchableOpacity>
                  <View style={{width: scale(110), height: verticalScale(8), backgroundColor: '#fff', zIndex: 1}}/>
                </View>
              </View>
           ))}
          <View style={{borderBottomLeftRadius: scale(8), borderBottomRightRadius: scale(8), width: '100%', height: verticalScale(15), backgroundColor: '#fff'}}/>
        </View>
        <View style={{ height: verticalScale(250), width: '100%' }}>
          <View style={{
            height: verticalScale(90),
            width: '100%',
            backgroundColor: '#fff',
            alignItems: 'flex-start',
            justifyContent: 'center',
            elevation: 1,
            borderRadius: scale(8),
            borderWidth: scale(0.5),
            borderColor: '#efefef',
            borderBottomWidth: scale(0.5),
            marginTop: verticalScale(10),
            padding: scale(20),
          }}>
            <View style={{ width: '100%', height: '50%', flexDirection: 'row', columnGap: scale(10), alignItems: 'center' }}>
              <Wallet height={heightPercentageToDP(5)} width={widthPercentageToDP(7)} />
              <Text style={[commonStyles.titleText, { fontSize: moderateScale(11.5)}]}>Payment Method</Text>
            </View>
            <View style={{ width: '100%', height: '50%', flexDirection: 'row', alignItems: 'center', top: verticalScale(5) }}>
              <Visa height={heightPercentageToDP(4)} width={widthPercentageToDP(10)} />
              <View style={{justifyContent: 'center'}}>
              <Text style={{textAlignVertical: 'center', fontFamily: 'EverydaySansBold', fontSize: moderateScale(9.5), bottom: verticalScale(2), textAlignVertical: 'center'}}> Walmart Visa ending in 0569 </Text>
            </View>
            </View>
          </View>
          <View style={{
            height: verticalScale(1.5),
            width: '100%',
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: scale(20),
            marginTop: verticalScale(5),
            borderBottomWidth: scale(0.5),
            borderBottomColor: '#efefef',
          }} />
          <View style={{
            height: verticalScale(18),
            paddingHorizontal: scale(5),
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            position: 'relative',
            marginBottom: verticalScale(10),
            borderBottomWidth: scale(0.5),
            borderBottomColor: '#efefef'
          }}>
            <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(11)}}>Subtotal</Text>
            <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(10)}}>$ {totalSubtotal.toFixed(2)}</Text>
          </View>
          <View style={{
            height: verticalScale(15),
            paddingHorizontal: scale(5),
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            position: 'relative',
            marginBottom: verticalScale(8),
            borderBottomWidth: scale(0.5),
            borderBottomColor: '#efefef'
          }}>
            <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(11)}}>Tax</Text>
            <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(10)}}>$ {(typeof taxAmount === 'number' ? taxAmount : 0).toFixed(2)}</Text>
          </View>
          <View style={{
            height: verticalScale(25),
            paddingHorizontal: scale(5),
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            position: 'relative',
            borderBottomWidth: scale(0.5),
            borderBottomColor: '#efefef'
          }}>
            <Text style={styles.total2}>Total</Text>
            <Text style={styles.total2}>$ {total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: '#0053e2',
    elevation: 4,
    borderRadius: scale(15),
    height: verticalScale(22),
    justifyContent: 'center',
    width: scale(80),
    zIndex: 0
  },
  addButtonText: {
    textAlignVertical: 'center',
    color: '#fff',
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(11)
  },
    itemContainer: {
    width: '100%',
    height: verticalScale(120),
    backgroundColor: '#fff',
    padding: scale(10),
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    rowGap: verticalScale(5),
    borderBottomWidth: verticalScale(0.25),
    borderBottomColor: '#aeaeae'
  },
  lastItemContainer: {
    width: '100%',
    height: verticalScale(120),
    backgroundColor: '#fff',
    padding: scale(10),
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    rowGap: verticalScale(5),
    borderBottomWidth: verticalScale(0.25),
    borderBottomColor: '#aeaeae'
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'space-between',
    justifyContent: 'space-between',
    width: '100%',
    height: '50%'
  },
  itemDetails: {
    paddingLeft: scale(10),
    width: '60%',
    height: '100%'
  },
  itemTitle: {
    fontSize: moderateScale(9.5),
    fontFamily: 'EverydaySansRegular',
  },
  itemText: {
    fontSize: moderateScale(8.5),
    fontFamily: 'EverydaySansRegular',
    marginVertical: verticalScale(5),
  },
  itemImage: {
    width: scale(45),
    height: scale(45),
  },
  itemPrice: {
    fontSize: moderateScale(10),
    fontFamily: 'EverydaySansBold',
    textAlign: 'right',
  },
  bar: {
    alignSelf: 'center',
    backgroundColor: '#0053e2dc',
    bottom: verticalScale(42),
    height: verticalScale(1),
    position: 'absolute',
    width: '120%',
    zIndex: 1,
  },
  bar2: {
    alignSelf: 'center',
    backgroundColor: '#0053e245',
    bottom: verticalScale(41.5),
    height: verticalScale(3),
    position: 'absolute',
    width: '108%',
    zIndex: 1,
  },
  barcodeContainer: {
    borderColor: '#c9c9c9ad',
    borderRadius: scale(9),
    borderWidth: scale(0.5),
    justifyContent: 'space-around',
    top: verticalScale(15),
    alignItems: 'center',
    height: verticalScale(60),
    width: '95%',
    zIndex: 1
  },
  body: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: verticalScale(30)
  },
  capOneText: {
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(13),
    paddingVertical: verticalScale(2), 
    right: scale(12)
  },
  capOneText2: {
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(13),
    right: scale(12), 
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
  },
  date: {
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(16),
    left: scale(18),
    top: verticalScale(5)
  },
  exit: {

  },
  exitPassBottomContainer: {
    alignItems: 'center',                                                                                                                                                                                                                                                                                                                                                                            
    backgroundColor: '#fff',
    borderColor: '#cdcdcd',
    borderStartEndRadius: scale(10),
    borderStartStartRadius: scale(10),
    borderEndEndRadius: scale(10),
    borderEndStartRadius: scale(10),
    borderStartStartWidth: scale(5),
    width: '100%',
    borderTopWidth: 0,
    borderWidth: moderateScale(1),
    height: verticalScale(103),
  },
  exitPassText: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    color: '#0053e2',
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(11),
    left: scale(10),
    marginTop: verticalScale(2),
    textAlign: 'left'
  },
    exitPassText2: {
    color: '#0053e2',
    fontFamily: 'EverydaySansBlackItalic',
    fontSize: moderateScale(11),
    left: scale(10),
    marginTop: verticalScale(2),
    textAlign: 'flex-start'
  },
  exitPassTopContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cdcdcd',
    width: '100%',
    borderStartEndRadius: scale(10),
    borderStartStartRadius: scale(10),
    borderEndEndRadius: scale(10),
    borderEndStartRadius: scale(10),
    borderBottomWidth: 0,
    flexDirection: 'column',
    height: verticalScale(50),
    padding: scale(7)
  },
  feedback: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(8),
    bottom: verticalScale(30),
    elevation: 5,
    flexDirection: 'column',
    height: verticalScale(90),
    right: scale(5),
    width: '100%'
  },
  feedbackText: {
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(14),
    top: verticalScale(18)
  },
  feedbackText2: {
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(15.5),
    textDecorationLine: 'underline',
    top: verticalScale(23)
  },
  finalTotal: {
    alignItems: 'space-between',
    flex: 0.33,
    flexDirection: 'row',
    height: verticalScale(30),
    justifyContent: 'space-between',
    textAlign: 'right',
    top: verticalScale(20),
    width: '100%'

  },
  header: {
    backgroundColor: '#0053e2',
    elevation: 5,
    height: verticalScale(45)
  },
  headerItems: {
    flexDirection: 'row',
    left: scale(10),
    marginTop: verticalScale(75),
  },
  itemPrice: {
    fontSize: moderateScale(12),
    fontFamily: 'EverydaySansBold'
  },
  headerText: {
    bottom: verticalScale(3),
    color: '#fff',
    fontFamily: 'EverydaySansMedium',
    fontSize: moderateScale(),
    left: scale(8)
  },
  name: {
    fontFamily: 'EverydaySansBold', 
    fontSize: moderateScale(11)
  },
  receiptButtonContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#000',
    borderRadius: scale(25),
    borderWidth: scale(1),
    bottom: verticalScale(255),
    height: verticalScale(32),
    justifyContent: 'center',
    left: scale(175),
    width: scale(125)
  },
  receiptText: {
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(14),
  },
  scrollContent: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: scale(5),
    width: '100%',
    rowGap: verticalScale(5),
    backgroundColor: '#fff',
    padding: scale(10),
  },
  tc: {
    bottom: verticalScale(35),
    fontFamily: 'EverydaySansRegular',
    textAlign: 'center',
    width: '100%',
    fontSize: moderateScale(8)
  },
  termsText: {
    color: '#646363',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(7),
    bottom: verticalScale(10),
  },
  total: {
    bottom: verticalScale(5),
    textAlignVertical: 'center',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(10),
    textAlign: 'left',
    marginLeft: scale(15)
  },
    price: {
    bottom: verticalScale(5),
    textAlignVertical: 'center',
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(11),
    textAlign: 'left',
    marginLeft: scale(5)
  },
  total2: {
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(15.5),
    textAlign: 'right'
  },
  visa: {
    flex: 1,
    flexDirection: 'row',
    height: verticalScale(20),
    top: verticalScale(40),
    width: '100%'
  },
  wpText: {
    width: '50%',
    color: '#000',
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(18)
  },
  wpText2: {
    bottom: verticalScale(10),
    fontFamily: 'EverydaySansMedium',
    fontSize: moderateScale(10),
  },
});

