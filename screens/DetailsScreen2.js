import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Query } from 'react-native-appwrite';
import { commonStyles } from '../lib/styles';
import Barcode from 'react-native-barcode-svg';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import BackIcon from '../assets/icons/BackIcon';
import WalmartPlus from '../assets/images/WalmartPlus';
import { databases } from '../lib/appwrite';
import * as SecureStore from 'expo-secure-store';
import CartIcon from '../assets/icons/CartIcon.svg';
import Home from '../assets/icons/Home.svg';
import Store from '../assets/icons/Store.svg';
import Receipt from '../assets/icons/Receipt.svg';
import ExpandIcon5 from '../assets/icons/ExpandIcon5.svg';
import ExpandIcon3 from '../assets/icons/ExpandIcon3.svg';
import Wallet from '../assets/icons/Wallet.svg';
import Visa from '../assets/icons/Visa.svg';

function stripSeconds(timeString = '') {
  const parts = timeString.trim().split(':');
  if (parts.length < 2) return timeString;

  const [h, m, rest] = [parts[0], parts[1], parts[2] || ''];
  const period = (rest.includes('AM') || rest.includes('PM'))
    ? rest.split(' ').pop()
    : (timeString.toUpperCase().includes('AM') ? 'AM' :
       timeString.toUpperCase().includes('PM') ? 'PM' : '');

  return `${h}:${m.replace(/\D/g, '')}${period}`.trim();
}

export default function DetailsScreen({ route, navigation }) {
    const [order, setOrder] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const {
      randomName,
      randomFirstName,
    } = route.params;

  const [timeNoSeconds, setTimeNoSeconds] = useState('');

    useEffect(() => {
    setTimeNoSeconds(stripSeconds(time));
  }, [time]);

useEffect(() => {
  let isMounted = true;

  (async () => {
    setLoading(true);
    try {
      // 1) Read orderId from SecureStore
      const raw = await SecureStore.getItemAsync('orderId');
      if (!raw) {
        console.warn('No saved orderId in SecureStore');
        return;
      }

      // If you stored plain string: use as-is.
      // If you might have stored JSON, try to parse but fall back to string.
      let savedOrderId = raw;
      try { savedOrderId = JSON.parse(raw); } catch { /* not JSON, fine */ }

      console.log('Retrieved orderId:', savedOrderId);

      // 2) Read userId (collectionId)
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        console.error('No userId found in SecureStore');
        return;
      }

      const databaseId = 'orders2';
      const collectionId = userId;

      // 3) Fetch order by ID
      // Use $id if you saved the Appwrite document ID in SecureStore.
      // If you instead saved a custom field like `orderId`, swap to Query.equal('orderId', String(savedOrderId))
      const filters = [Query.equal('$id', String(savedOrderId))];

      const response = await databases.listDocuments(databaseId, collectionId, filters);

      if (!isMounted) return;

      if (response.total > 0) {
const doc = response.documents[0];

  // Map Appwrite doc → normalized orderData
  const orderData = {

    formattedDate: doc.DateFormatted,
    time: doc.TimeFormatted,
    numericDate: doc.NumericDate,
    storeNumber: doc.StoreNumber,
    storeLocation: doc.StoreAddress,
    storeCity: doc.StoreCity,
    storeZip: doc.StoreZip,
    storeManager: doc.Manager,
    storePhone: doc.PhoneNumber,
    op: doc.OP,
    te: doc.TE,
    formattedNumber: doc.TC,
    items: Array.isArray(doc.Items)
      ? doc.Items.map(i => {
          try { return JSON.parse(i); } catch { return {}; }
        })
      : [],
    taxRate: doc.TaxRate,
    taxAmount: doc.TaxAmount,
    totalSubtotal: doc.Subtotal,
    total: doc.Total,
    barcode: doc.Barcode,
  };

  setOrder(orderData);
} else {
        console.warn('No order found for id:', savedOrderId);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      if (isMounted) setLoading(false);
    }
  })();

  return () => { isMounted = false; };
}, []);

  if (!order) {
    return (
    <View style={styles.container}>
      <View style={[commonStyles.header, {height: heightPercentageToDP(6)}]}>
        <View style={[commonStyles.headerItems, { alignItems: 'flex-end', justifyContent: 'space-between', columnGap: scale(10), paddingBottom: verticalScale(2)}]}>
          <View style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-start', columnGap: scale(10), bottom: verticalScale(3)}]}>
            <Pressable
              style={styles.exit}
              onPress={() => navigation.navigate('AccountScreen', {
                randomFirstName,
                randomName,
              })}
              hitSlop={12}
            >
              <BackIcon width={moderateScale(22)} height={moderateScale(22)} />
            </Pressable>
            <Text style={[commonStyles.headerLabelText, {marginLeft: scale(5)}]}>{formattedDateWithMonthShort} purchase</Text>
          </View>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rowGap: verticalScale(2),
                  width: '10%',
                  bottom: verticalScale(5),
                  height: '50%',
                }}
              >
                  <CartIcon width={moderateScale(30)} height={moderateScale(30)} style={{top: verticalScale(2)}}/>
                  <Text
                    style={[
                      commonStyles.cartTotal,
                      {
                        fontFamily: 'EverydaySansRegular',
                        fontSize: moderateScale(7.5),
                        left: scale(0),
                        bottom: verticalScale(2),
                        color: '#fff',
                      },
                    ]}
                  >
                    $0.00
                  </Text>
              </View>
        </View>
      </View>
      <View style={{flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}>
        <Image source={require('../assets/splash.gif')} style={{width: widthPercentageToDP(10), height: heightPercentageToDP(7)}}/>
      </View>
    </View>
    );
  }

    const {
      formattedDate,
      time,
      numericDate,
      storeNumber,
      storeLocation,
      storeCity,
      storeZip,
      storeState,
      storeManager,
      storePhone,
      op,
      te,
      formattedNumber,
      items,
      taxRate,
      taxAmount,
      totalSubtotal,
      total,
      barcode,
    } = order || {};


    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

const capitalizeFirstLetter = (str = '') =>
  str
    .toLowerCase()
    .split(/[\s-]+/) // splits on spaces *or* hyphens
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');


    function formatToShortMonth(dateStr) {
      if (!dateStr || typeof dateStr !== 'string') return 'Unknown Date';
      try {
        const [month, day, year] = dateStr.split('/');
        const d = new Date(`${year}-${month}-${day}`);
        if (isNaN(d)) return dateStr;

        return d.toLocaleDateString('en-US', {
          month: 'short', // "Oct"
          day: 'numeric', // "17"
          year: 'numeric' // "2025"
        });
      } catch (err) {
        console.error('Error formatting date:', err, 'for dateStr:', dateStr);
        return dateStr;
      }
    }
const formattedDateWithMonthShort = formatToShortMonth(formattedDate);

const convertToMilitaryTime = (time) => {
  if (!time) return '';

  // Expected input: "H:MM:SS AM/PM"
  const [hourPart, minutePart, secondPartAndPeriod] = time.split(':');
  const [seconds, periodRaw] = secondPartAndPeriod.trim().split(' ');
  const period = periodRaw?.toUpperCase() || '';
  
  let hoursInt = parseInt(hourPart, 10);

  if (period === 'PM' && hoursInt < 12) hoursInt += 12;
  if (period === 'AM' && hoursInt === 12) hoursInt = 0;

  const hoursStr = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
  const minutesStr = minutePart.padStart(2, '0');
  const secondsStr = seconds.padStart(2, '0');

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
};


  const militaryTime = convertToMilitaryTime(time);

  const dashedNumber = formattedNumber.replace(/\s+/g, '-');

  return (
    <View style={styles.container}>
      <View style={[commonStyles.header, {height: heightPercentageToDP(6)}]}>
        <View style={[commonStyles.headerItems, { alignItems: 'flex-end', justifyContent: 'space-between', columnGap: scale(10), paddingBottom: verticalScale(2)}]}>
          <View style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-start', columnGap: scale(10), bottom: verticalScale(3)}]}>
            <Pressable
              style={styles.exit}
              onPress={() => navigation.navigate('PurchaseHistory', {
                randomFirstName,
                randomName,
              })}
              hitSlop={12}
            >
              <BackIcon width={moderateScale(22)} height={moderateScale(22)} />
            </Pressable>
            <Text style={[commonStyles.headerLabelText, {marginLeft: scale(5)}]}>{formattedDateWithMonthShort} purchase</Text>
          </View>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rowGap: verticalScale(2),
                  width: '10%',
                  bottom: verticalScale(5),
                  height: '50%',
                }}
              >
                  <CartIcon width={moderateScale(30)} height={moderateScale(30)} style={{top: verticalScale(2)}}/>
                  <Text
                    style={[
                      commonStyles.cartTotal,
                      {
                        fontFamily: 'EverydaySansRegular',
                        fontSize: moderateScale(7.5),
                        left: scale(0),
                        bottom: verticalScale(2),
                        color: '#fff',
                      },
                    ]}
                  >
                    $0.00
                  </Text>
              </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{width: '100%', alignItems: 'flex-center', marginBottom: verticalScale(25)}}>
          <Text style={[commonStyles.titleText]}>TC#: {formattedNumber}</Text>
        </View>
        <View style={{height: 'auto', width: '100%', borderTopLeftRadius: scale(8), borderTopRightRadius: scale(8), borderRadius: scale(8), elevation: 1.5}}>
          <View style={{width: '100%', height: verticalScale(52), padding: scale(8), backgroundColor: '#fff', rowGap: scale(8), borderTopLeftRadius: scale(8), borderTopRightRadius: scale(8), borderWidth: scale(0.5), borderColor: '#efefef', borderBottomWidth: scale(0.5), borderBottomColor: '#efefef', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
            <View style={{paddingLeft: scale(5), paddingTop: verticalScale(5), flexDirection: 'row', width: '100%', height: '60%', alignItems: 'flex-start', justifyContent: 'flex-start', columnGap: scale(10)}}>
              <View style={{width: '11.5%', height: '100%'}}>
                <Store width={scale(35)} height={scale(35)}/>
              </View>
              <View style={{width: '88.5%', height: '100%', flexDirection: 'column', top: verticalScale(4),rowGap: verticalScale(3), alignItems: 'flex-start', justifyContent: 'center'}}>
                <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(9), marginTop: verticalScale(1)}}>Store Purchase</Text>
                <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(13)}}>{formattedDateWithMonthShort} purchase</Text>
              </View>
            </View>
          </View>
          <Pressable
            onPress={() => setExpanded((prev) => !prev)}
            style={{
              height: heightPercentageToDP(7),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: scale(15),
              backgroundColor: '#fff',
            }}
          >
            <Text style={{ fontFamily: 'EverydaySansBold', fontSize: moderateScale(11.5) }}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Text>
            <ExpandIcon5
              width={scale(15)}
              height={scale(15)}
              style={{ transform: [{ rotate: expanded ? '0deg' : '180deg' }] }}
            />
          </Pressable>
          {expanded ? (
            // 🧾 Expanded detailed view
            <View style={{ width: '100%', backgroundColor: '#fff' }}>
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.itemContainer,
                      index === order.items.length - 1 && styles.lastItemContainer,
                    ]}
                  >
                    {index === 0 && (
                      <View style={{ width: '100%', height: '20%' }}>
                        <Text
                          style={{
                            color: '#000',
                            fontFamily: 'EverydaySansBold',
                            fontSize: moderateScale(10.5),
                          }}
                        >
                          Shopped
                        </Text>
                      </View>
                    )}

                    <View style={styles.itemContent}>
                      <View style={{ width: '15%', height: '100%', alignItems: 'center', justifyContent: 'center', top: verticalScale(3) }}>
                        <Image
                          source={{
                            uri:
                              item.firstPhoto ||
                              'https://i5.walmartimages.com/asr/24893ec1-4563-41fa-9efb-42ba1d0d5e98.f417a4c35f49d4ecd5c479905aa827b3.jpeg',
                          }}
                          style={styles.itemImage}
                        />
                      </View>

                      <View style={styles.itemDetails}>
                        <Text style={styles.itemTitle} numberOfLines={3}>{item.name}</Text>
                        <Text style={styles.itemText}>Qty {item.quantity || 1}</Text>
                      </View>

                      <View style={{ width: '20%', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' }}>
                        <Text style={styles.itemPrice}>
                          ${parseFloat(item.price).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        width: '100%',
                        height: '25%',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        top: verticalScale(-3),
                      }}
                    >
                      <TouchableOpacity style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add</Text>
                      </TouchableOpacity>
                      <View
                        style={{
                          width: scale(110),
                          height: heightPercentageToDP(2),
                          backgroundColor: '#fff',
                          zIndex: 1,
                        }}
                      />
                    </View>
                    <View style={{width: '100%', height: verticalScale(0.5), backgroundColor: '#eee'}} />
                  </View>
                  
                ))
              ) : (
                <Text
                  style={[
                    commonStyles.text,
                    { textAlign: 'center', left: scale(15), fontSize: moderateScale(10) },
                  ]}
                >
                  No items available
                </Text>
              )}
            </View>
          ) : (
            // 🖼️ Compact thumbnail view
            <View style={styles.photosContainer}>
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.slice(0, 5).map((product, index) => (
                  <Image
                    key={index}
                    source={{
                      uri:
                        product.firstPhoto ||
                        'https://i5.walmartimages.com/asr/24893ec1-4563-41fa-9efb-42ba1d0d5e98.f417a4c35f49d4ecd5c479905aa827b3.jpeg',
                    }}
                    style={styles.itemPhoto}
                  />
                ))
              ) : (
                <Text
                  style={[
                    commonStyles.text,
                    { textAlign: 'center', left: scale(15), fontSize: moderateScale(10) },
                  ]}
                >
                  No items available
                </Text>
              )}
            </View>
          )}
            <View style={{height: verticalScale(115), width: '100%', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-evenly', padding: scale(8)}}>
              <View style={{width: '100%', height: verticalScale(25), alignItems: 'flex-start', justifyContent: 'center'}}>
                <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(11.5)}}>How can we help?</Text>
              </View>
                <Pressable
                  onPress={() => navigation.navigate('ReceiptScreen4', {
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
                      op,
                      te,
                      formattedDate,
                      barcode,
                      storeManager,
                      time,
                      barcode,
                      storePhone,
                      randomFirstName,
                      randomName
                    })}
                    style={{ width: '100%', height: verticalScale(20), alignItems: 'center', justifyContent: 'center', borderRadius: scale(35), borderWidth: scale(0.5)}}
                  >
                <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(10)}}>View receipt details</Text>
              </Pressable>
              <View style={{flexDirection: 'row', alignItems: 'space-between', justifyContent: 'space-between', width: '95%', height: verticalScale(20)}}>
                <View>
                  <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(10)}}>Start a return for refund or replacement</Text>
                </View>
                <View>
                  <ExpandIcon3 width={scale(10)} height={scale(10)}/>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'space-between', justifyContent: 'space-between', width: '95%', height: verticalScale(20)}}>
                <View>
                  <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(10)}}>Need more help? Visit out help center.</Text>
                </View>
                <View>
                  <ExpandIcon3 width={scale(10)} height={scale(10)}/>
                </View>
              </View>
            </View>
            <View style={{borderTopColor: '#eee', borderTopWidth: verticalScale(0.5), width: '100%', height: heightPercentageToDP(11), backgroundColor: '#fff',  paddingLeft: moderateScale(8), borderBottomLeftRadius: moderateScale(8), borderBottomRightRadius: moderateScale(8),}}>
              <View style={{height: '100%',  flexDirection: 'column', alignItems: 'flex-start', rowGap: scale(6), justifyContent: 'center'}}>
                <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(11)}}>Pickup location</Text>
                <View>
                  <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(10.5), marginTop: verticalScale(1)}}>{capitalizeFirstLetter(storeCity)} Supercenter</Text>
                  <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(10), marginTop: verticalScale(1)}}>{storeLocation}, {storeCity}, {storeState} {storeZip}</Text>
                </View>  
              </View>
            </View>
        </View>
        <View style={{ height: heightPercentageToDP(32), width: '100%' }}>
          <View style={{
            height: verticalScale(90),
            width: '100%',
            backgroundColor: '#fff',
            alignItems: 'flex-start',
            justifyContent: 'center',
            elevation: 1,
            overflow: 'hidden',
            borderRadius: scale(8),
            borderWidth: scale(0.5),
            borderColor: '#efefef',
            borderBottomWidth: scale(0.5),
            marginTop: verticalScale(10),
            padding: scale(20),
          }}>
            <View style={{ width: '100%', height: '50%', flexDirection: 'row', columnGap: scale(10), alignItems: 'center' }}>
              <Wallet height={moderateScale(30)} width={moderateScale(30)} />
              <Text style={[commonStyles.titleText, { fontSize: moderateScale(11.5)}]}>Payment Method</Text>
            </View>
            <View style={{ width: '100%', height: '50%', flexDirection: 'row', alignItems: 'center', top: verticalScale(5) }}>
              <Visa height={moderateScale(28)} width={moderateScale(45)} style={{}} />
              <View style={{justifyContent: 'center'}}>
              <Text style={{textAlignVertical: 'center', fontFamily: 'EverydaySansBold', fontSize: moderateScale(10), bottom: verticalScale(2)}}> Walmart Visa ending in 0569 </Text>
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
            height: heightPercentageToDP(2),
            marginTop: verticalScale(5),
            borderBottomWidth: scale(0.5),
            borderBottomColor: '#efefef',
          }} />
          <View style={{
            height: heightPercentageToDP(3),
            marginTop: verticalScale(8),
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
            height: heightPercentageToDP(3),
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
            height: heightPercentageToDP(4),
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
        <View style={{alignItems: 'center', justifyContent: 'space-evenly', width: '100%', height: heightPercentageToDP(9), marginBottom: verticalScale(5)}}>
          <Text style={{fontFamily: 'EverydaySansRegular', alignSelf: 'flex-start', fontSize: moderateScale(11), textAlign: 'left'}}>TC#: {formattedNumber}</Text>
          <Barcode singleBarWidth={scale(6)} maxWidth={widthPercentageToDP(95)} width={5} backgroundColor={'#FFFFFF00'} height={heightPercentageToDP(6)} value={barcode} format='CODE39'/>
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: heightPercentageToDP(6),
    paddingLeft: scale(15),
    paddingBottom: verticalScale(15),
    padding: moderateScale(15),
    borderBottomWidth: scale(0.5),
    columnGap: scale(25),
    borderColor: '#efefef', 
    backgroundColor: '#fff',
  },
  itemPhoto: {
    width: moderateScale(33),
    height: moderateScale(33),
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#0053e2',
    elevation: 4,
    borderRadius: moderateScale(15),
    height: heightPercentageToDP(2.7),
    justifyContent: 'center',
    width: scale(80),
    zIndex: 0
  },
  addButtonText: {
    textAlignVertical: 'center',
    color: '#fff',
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(10)
  },
    itemContainer: {
    width: '100%',
    height: heightPercentageToDP(15),
    backgroundColor: '#fff',
    padding: moderateScale(20),
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    rowGap: verticalScale(5),
  },
  lastItemContainer: {
    width: '100%',
    height: heightPercentageToDP(12),
    backgroundColor: '#fff',
    paddingHorizontal: scale(20),
    paddingVertical: 0,
    paddingTop: verticalScale(5),
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    rowGap: verticalScale(5),
    borderBottomColor: '#eee',
    borderBottomWidth: verticalScale(0.5)
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'space-between',
    justifyContent: 'space-between',
    width: '100%',
    height: '65%'
  },
  itemDetails: {
    width: '58%',
    height: '100%'
  },
  itemTitle: {
    fontSize: moderateScale(9),
    fontFamily: 'EverydaySansRegular',
  },
  itemText: {
    fontSize: moderateScale(9),
    fontFamily: 'EverydaySansRegular',
    marginVertical: verticalScale(5),
  },
  itemImage: {

    width: moderateScale(40),
    height: moderateScale(40),
  },
  itemPrice: {
    fontSize: moderateScale(11),
    fontFamily: 'EverydaySansBold',
    textAlign: 'right',
  },
  bar: {
    backgroundColor: '#0053e2b2',
    bottom: verticalScale(48),
    height: verticalScale(2),
    position: 'absolute',
    width: '108%',
    zIndex: 1,
  },
  bar2: {
    backgroundColor: '#0053e245',
    bottom: verticalScale(48),
    height: verticalScale(3.5),
    position: 'absolute',
    width: '108%',
    zIndex: 1,
  },
  barcodeContainer: {
    borderColor: '#c9c9c9ad',
    borderRadius: scale(9),
    borderWidth: scale(0.5),
    justifyContent: 'space-around',
    padding: scale(15),
    top: verticalScale(15),
    height: verticalScale(63),
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
    flex: 1
  },
  date: {
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(16),
    left: scale(18),
    top: verticalScale(5)
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
    height: verticalScale(60)
  },
  headerItems: {
    flexDirection: 'row',
    left: scale(10),
    marginTop: verticalScale(75),
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
    height: 'auto',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginRight: scale(5),
    width: '100%',
    rowGap: verticalScale(10),
    backgroundColor: '#fff',
    padding: scale(12)
  },
  tc: {
    bottom: verticalScale(35),
    fontFamily: 'EverydaySansRegular',
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

