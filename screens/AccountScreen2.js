import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Pressable, FlatList } from 'react-native';              
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import * as SecureStore from 'expo-secure-store';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedScrollHandler,
  withTiming,
} from 'react-native-reanimated';
import { Query } from 'react-native-appwrite';
import { databases } from '../lib/appwrite';
import WPlus4 from '../assets/icons/WPlus4.svg';
import ExpandIcon3 from '../assets/icons/ExpandIcon3.svg';
import { Barcode } from 'react-native-barcode-rnsvg';
import Oval from '../components/Oval';
import ShopOutline from '../assets/icons/ShopOutline.svg';
import Sparky from '../assets/icons/Sparky.svg';
import ItemsOutline from '../assets/icons/ItemsOutline.svg';
import ServicesOutline from '../assets/icons/ServicesOutline.svg';
import AccountFilled from '../assets/icons/AccountFilled.svg';
import MoneyFlip from '../assets/icons/MoneyFlip.svg';
import PiggyBank from '../assets/icons/PiggyBank.svg';
import WPlus3 from '../assets/icons/WPlus3.svg';
import Globe from '../assets/icons/Globe.svg';
import Settings from '../assets/icons/Settings.svg';
import Store from '../assets/icons/Store.svg';
import Store2 from '../assets/icons/Store2.svg';
import { commonStyles } from '../lib/styles';
import Location from '../assets/icons/Location.svg';

const AccountScreen2 = ({navigation, route}) => {
    const [orders, setOrders] = useState([]);
    const [storeDetails, setStoreDetails] = useState(null);
    const [randomFirstName, setRandomFirstName] = useState('');
    const { 
      items = items || [],
      userId,
      timeNoSeconds,
                              selectedStoreDetails,
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
                              formattedNumber,
                              taxRate,
                              barcode,
                              manualPrice,
      randomName = randomName || '',
    } = route.params;
    const lastContentOffset = useSharedValue(0);
    const isScrolling = useSharedValue(false);
    const translateYHeader = useSharedValue(0);

      useEffect(() => {
      const fetchRandomFirstName = async () => {
        try {
          const fetchedRandomFirstName = await SecureStore.getItemAsync('randomFirstName');
          if (fetchedRandomFirstName) {
            setRandomFirstName(fetchedRandomFirstName);
            console.log('Retrieved name:', fetchedRandomFirstName);
          }
        } catch (error) {
          console.error('Error retrieving name:', error);
        }
      };
    
      fetchRandomFirstName();
    }, []);
    
    useEffect(() => {
      const loadOrders = async () => {
        const allOrders = await fetchMostRecentOrders();
        setOrders(allOrders);
      };
      loadOrders();
    }, []);

    const webViewRef = useRef(null);
    const translateYFooter = useSharedValue(0);
  
 const footerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(translateYFooter.value, {
            duration: 200,
          }),
        },
      ],
    };
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (lastContentOffset.value > event.contentOffset.y && isScrolling.value) {
        // Scrolling up: show header and footer
        translateYHeader.value = 0;
        translateYFooter.value = 0;
      } else if (
        lastContentOffset.value < event.contentOffset.y &&
        isScrolling.value
      ) {
        // Scrolling down: hide header and footer
        translateYHeader.value = -100; // Adjust to your header's height
        translateYFooter.value = 100; // Adjust to your footer's height
      }
      lastContentOffset.value = event.contentOffset.y;
    },
    onBeginDrag: () => {
      isScrolling.value = true;
    },
    onEndDrag: () => {
      isScrolling.value = false;
    },
  });


    async function fetchMostRecentOrders() {
  try {
    const collectionId = await SecureStore.getItemAsync('userId');
    const databaseId = 'orders2'; // Your Appwrite database ID

    // ✅ Step 1: Fetch the 3 most recent orders
    const ordersResponse = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        Query.orderDesc('$createdAt'), // Sort newest first
        Query.limit(3),                // Limit to 3 results
      ]
    );

    console.log("Raw orders response:", ordersResponse);

    if (!ordersResponse || ordersResponse.total === 0) {
      console.log("No recent orders found.");
      return [];
    }

    // ✅ Step 2: Parse and process the orders
    const orderDetails = ordersResponse.documents.map((order) => {
      let parsedItems = [];

      try {
        if (Array.isArray(order.Items)) {
          parsedItems = order.Items.map((itemString) => {
            try {
              return JSON.parse(itemString);
            } catch (error) {
              console.error(`Error parsing item JSON for order ${order.$id}:`, error);
              return {};
            }
          });
        }
      } catch (error) {
        console.error(`Error parsing Items array for order ${order.$id}:`, error);
      }

      const convertToMilitaryTime = (timeFormatted) => {
        if (!timeFormatted || typeof timeFormatted !== 'string') return "00:00:00";
        const [time, period] = timeFormatted.split(" ");
        if (!time || !period) return "00:00:00";

        let [hours, minutes, seconds] = time.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds || "00"}`;
      };

      const timeConversion = convertToMilitaryTime(order.TimeFormatted);

      const date = (() => {
        if (!order.DateFormatted || typeof order.DateFormatted !== 'string') return "Unknown Date";
        try {
          const [month, day, year] = order.DateFormatted.split("/");
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        } catch (error) {
          console.error(`Error formatting date for order ${order.$id}:`, error);
          return order.DateFormatted;
        }
      })();

      const orderData = {
        orderId: order.$id,
        DateFormatted: date,
        TimeFormatted: order.TimeFormatted,
        NumericDate: order.NumericDate,
        StoreNumber: order.StoreNumber || "Unknown",
        StoreAddress: order.StoreAddress || "Unknown",
        StoreCity: order.StoreCity || "Unknown",
        StoreZip: order.StoreZip || "Unknown",
        Manager: order.Manager || "Unknown",
        PhoneNumber: order.PhoneNumber || "Unknown",
        OP: order.OP || "Unknown",
        TE: order.TE || "Unknown",
        TC: order.TC || "Unknown",
        Items: parsedItems,
        TaxRate: order.TaxRate || 0,
        TaxAmount: order.TaxAmount || 0,
        Subtotal: order.Subtotal || 0,
        Total: order.Total || 0,
        militaryTime: timeConversion,
        Barcode: order.Barcode,
        CreatedAt: new Date(order.$createdAt || Date.now()),
      };

      console.log(`Processed order details for ${order.$id}:`, orderData);
      return orderData;
    });

    // ✅ Step 3: Return the already-sorted list
    return orderDetails;
  } catch (error) {
    console.error("❌ Error fetching recent orders:", error);
    return [];
  }
}
const formatWithShortMonth = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return 'Unknown Date';

  try {
    // Try parsing if it looks like MM/DD/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [month, day, year] = parts;
        const d = new Date(Number(year), Number(month) - 1, Number(day));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', {
            month: 'short', // Jan, Feb
            day: 'numeric',
            year: 'numeric',
          });
        }
      }
    }

    // Otherwise let Date try to parse it
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    return dateStr; // fallback: just return raw
  } catch (err) {
    console.error('Error formatting short month:', err, 'for dateStr:', dateStr);
    return dateStr;
  }
};

const saveOrderId = async (item) => {
  try {
    if (!item?.orderId) {
      console.warn('No orderId on item:', item);
      return;
    }

    await SecureStore.setItemAsync('orderId', JSON.stringify(item.orderId));
    console.log('OrderId saved successfully:', JSON.stringify(item.orderId));
  } catch (error) {
    console.error('Error saving orderId:', error);
  }
};

const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{position: 'absolute', left: 0, right: 0, top: verticalScale(250), zIndex: -1}}>
        <Oval />
      </View>
        <View style={{ height: verticalScale(38), width: '100%', alignItems: 'center', backgroundColor: '#0053e2', position: 'absolute', left: 0, right: 0, top: 0, zIndex: 3}}>
          <WPlus4 width={scale(77)} height={scale(35)} style={{top: verticalScale(4)}}/>
        </View>

          <View style={{flexDirection: 'row', width: '100%', height: verticalScale(45), top: verticalScale(40), alignItems: 'center', justifyContent: 'space-between', padding: scale(5), zIndex: 2, backgroundColor: '#fff'}}>
            <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', width: '80%', height: '100%', marginTop: verticalScale(10), rowGap: verticalScale(2) }}>
              <Text
                style={{
                            fontFamily: 'EverydaySansRegular',
                            paddingLeft: scale(5),
                            textAlign: 'left',
                            color: '#001e60',
                            fontSize: moderateScale(10),
                        }}
                      >
                      Hi, {randomFirstName}
                      </Text>
                      <Text
                      style={{
                          fontFamily: 'EverydaySansBold',
                          paddingLeft: scale(5),
                          color: '#001e60',
                          fontSize: moderateScale(18),
                      }}
                      >
                      Welcome to your store
                      </Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', columnGap: scale(-3), marginLeft: scale(5)}}>
                        <Location width={scale(8)} height={scale(8)}/>
                        <Text
                          style={{
                            fontFamily: 'EverydaySansRegular',
                            paddingLeft: scale(5),
                            textAlign: 'left',
                            color: '#001e60',
                            fontSize: moderateScale(9),
                          }}
                        >
                      Your store
                      </Text>
                      </View>
            </View>
            <View style={{width: '20%', height: '100%', flexDirection: 'row'}}>
            <View style={{width: '50%', height: '100%'}}>
                <Globe width={scale(25)} height={scale(25)} />
              </View>
            </View>
          </View>
          <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} fadingEdgeLength={verticalScale(25)} contentContainerStyle={{rowGap: verticalScale(10), height: '120%', marginBottom: verticalScale(0), padding: scale(10), flexDirection: 'column', paddingTop: verticalScale(35), flexDirection: 'column', zIndex: 1}}>
                <View style={{height: verticalScale(135), width: '100%', marginTop: verticalScale(15)}}>
                  <View style={styles.exitPassTopContainer}>
                    <View style={{flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-evenly', rowGap: verticalScale(7), paddingHorizontal: scale(5)}}>
                      <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'space-between', width: '100%', height: '50%',}}>
                        <View style={{width: '50%'}}>
                          <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(13), color: '#000'}}>{randomFirstName} {randomName}</Text>
                        </View>
                        <View style={{width: '50%'}}>
                          <Text style={[commonStyles.titleText, {fontFamily: 'EverydaySansBoldItalic', textAlign: 'right', color: '#0053e2', fontSize: moderateScale(12), marginRight: scale(4)}]}>Exit Pass</Text>
                        </View>
                      </View>
                      <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', height: '50%' }}>
                      <View style={{ width: '50%', justifyContent: 'flex-start', flexDirection: 'row' }}>
                        <Text style={{ftextAlignVertical: 'center', ontFamily: 'EverydaySansRegular', fontSize: moderateScale(10), color: '#000'}}>Total </Text>
                        <Text style={{textAlignVertical: 'center', fontFamily: 'EverydaySansBold', fontSize: moderateScale(11), color: '#000'}}>${total.toFixed(2)}</Text>
                      </View>
                      <View style={{ width: '50%', justifyContent: 'flex-end', flexDirection: 'row'}}>
                        <Text style={{textAlignVertical: 'center', fontFamily: 'EverydaySansRegular', fontSize: moderateScale(9.5), color: '#000'}}>{totalItems} items </Text>
                      </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.exitPassBottomContainer}>
                            <View style={{ alignItems: 'center', top: verticalScale(0), borderRadius: scale(5), borderColor: '#ededed', width: '92%', height: verticalScale(48), borderWidth: scale(1), backgroundColor: '#fff'}}>
                               <View style={{width: '95%', overflow: 'hidden'}}>
                                <Barcode displayValue={false} width={scale(1)} marginLeft={scale(5)} marginRight={scale(5)} background={'#FFFFFF00'} height={verticalScale(33)} value={barcode} format="CODE39" />
                              </View>
                            </View>
                            <Pressable
                              onPress={() => navigation.navigate('ReceiptScreen5', {
                              randomFirstName: randomFirstName || '',
                              randomName: randomName || '',
                              items,
                              selectedStoreDetails,
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
                              formattedNumber,
                              taxRate,
                              barcode,
                              manualPrice,
                              })}
                            >
                              <Text style={styles.tc}>View receipt</Text>
                            </Pressable>
                  </View>
                </View>
            <View style={{width: '100%', height: verticalScale(250), elevation: 3, paddingHorizontal: scale(12), zIndex: 1, paddingVertical: verticalScale(8), backgroundColor: '#fff',borderRadius: scale(8.3)}}>
              <View style={{flexDirection: 'row', width: '100%', height: '15%', alignItems: 'center', columnGap: scale(9), justifyContent: 'flex-start'}}>
                <View style={{width: '90%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', columnGap: scale(4)}}>
                  <WPlus3 width={scale(70)} height={scale(22)} />
                  <Text style={[{fontFamily: 'EverydaySansBold', color: '#0053e2', textAlignVertical: 'center', fontSize: moderateScale(14)}]}>membership</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <ExpandIcon3 width={scale(13)} height={scale(13)} style={{right: scale(5)}} />
                </View>
              </View>
              <View style={{ padding: scale(5), flexDirection: 'row', width: '100%', height: '20%',}}>
                <View style={{flex: 0.15}}>
                  <Image source={{uri: 'https://i5.walmartimages.com/dfw/4ff9c6c9-2eee/k2-_af23b798-450b-43a7-a5c2-39cd02bbd405.v1.png'}} style={{width: scale(30), height: scale(30)}} />
                </View>
                <View style={{flexDirection: 'column', flex: 0.85, alignItems: 'flex-start', justifyContent: 'center'}}>
                  <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5)}]}>Paramount+</Text>
                  <Text style={[commonStyles.itemText, {fontFamily: 'EverydaySansRegular', textDecorationLine: 'underline', fontSize: moderateScale(9.5)}]}>Enjoy video streaming for members.</Text>
                </View>
              </View>
              <View style={{marginVertical: verticalScale(5), width: '100%', height: verticalScale(0.25), backgroundColor: '#bbbb'}}/>
              <View style={{ padding: scale(5), flexDirection: 'row', width: '100%', height: '20%',}}>
                <View style={{flex: 0.15}}>
                  <Image source={{uri: 'https://i5.walmartimages.com/dfwrs/76316474-9e91/k2-_d3c126f8-d52d-41e3-964a-b6e5ae274625.v1.png'}} style={{width: scale(30), height: scale(30)}} />
                </View>
                <View style={{flexDirection: 'column', flex: 0.85, alignItems: 'flex-start', justifyContent: 'center'}}>
                  <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5)}]}>Free online pet care</Text>
                  <Text style={[commonStyles.itemText, {fontFamily: 'EverydaySansRegular', textDecorationLine: 'underline', fontSize: moderateScale(9.5)}]}>24/7 unlimited access</Text>
                </View>
              </View>
              <View style={{marginVertical: verticalScale(5), width: '100%', height: verticalScale(0.25), backgroundColor: '#bbbb'}}/>
              <View style={{ padding: scale(5), flexDirection: 'row', width: '100%', height: '20%',}}>
                <View style={{flex: 0.15}}>
                  <Image source={{uri: 'https://i5.walmartimages.com/dfw/4ff9c6c9-1712/k2-_fb6a7340-7511-4e77-b61f-67d1bfcbfc84.v1.png'}} style={{width: scale(30), height: scale(30)}} />
                </View>
                <View style={{flexDirection: 'column', flex: 0.85, alignItems: 'flex-start', justifyContent: 'center'}}>
                  <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5)}]}>Auto care</Text>
                  <Text style={[commonStyles.itemText, {fontFamily: 'EverydaySansRegular', textDecorationLine: 'underline', fontSize: moderateScale(9.5)}]}>Take care of your car for less.</Text>
                </View>

              </View>
              <View style={{borderWidth: scale(1), borderColor: '#000', borderRadius: scale(16.6), width: '100%', height: verticalScale(20), marginVertical: verticalScale(8)}}>
                <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(9), textAlignVertical: 'center', textAlign: 'center', height: '100%' }]}>See all your membership benefits</Text>
              </View>
            </View>
            <View style={{width: '100%', height: verticalScale(80), flexDirection: 'column', elevation: 2, backgroundColor: '#fff', borderRadius: scale(8.3)}}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '50%', borderBottomWidth: scale(0.5), borderBottomColor: '#ccc', padding: scale(10)}}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '70%', height: '100%'}}>
                  <PiggyBank width={scale(32)} height={scale(32)}/>
                  <Text style={[commonStyles.titleText, {fontSize: moderateScale(13), color: '#001e60', left: scale(7), textAlignVertical: 'center'}]}>My Savings</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: '10%', height: '100%'}}>
                  <ExpandIcon3 width={scale(13)} height={scale(13)} style={{right: scale(5)}} />
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', height: '50%'}}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '40%', height: '100%', padding: scale(12), columnGap: scale(3), borderRightWidth: scale(0.5), borderRightColor: '#ccc'}}>
                <Text style={[commonStyles.text2, { fontSize: moderateScale(11), textAlign: 'left'}]}>Lifetime:</Text>
                <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(14), textAlign: 'left'}]}>$103.65</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '40%', height: '100%', padding: scale(12), columnGap: scale(3)}}>
                <Text style={[commonStyles.text2, { fontSize: moderateScale(11), textAlign: 'left'}]}>Last 3 months:</Text>
                <Text style={[commonStyles.text, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(14), textAlign: 'left'}]}>$34.25</Text>
              </View>
              </View>
            </View>
            <View style={{flex: 0.35, width: '100%', height: verticalScale(50), zIndex: 1, elevation: 1, flexDirection: 'column', borderRadius: scale(8.3)}}>
              <View style={{height: '60%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: scale(10), width: '100%', backgroundColor: '#d0f4fc', borderTopLeftRadius: scale(8.3), borderTopRightRadius: scale(8.3), zIndex: 1, rowGap: verticalScale(0)}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '70%', height: '60%'}}>
                    <MoneyFlip width={scale(25)} height={scale(25)}/>
                    <Text style={[commonStyles.titleText, {color: '#001f64', left: scale(7)}]}>Walmart Cash</Text>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: '30%', height: '100%'}}>
                  <ExpandIcon3 width={scale(13)} height={scale(13)} style={{right: scale(5)}} />
                </View>
                </View>
              <View style={{alignItems: 'flex-start', paddingLeft: scale(15), justifyContent: 'flex-start', width: '100%', height: '40%'}}>
                <Text style={[commonStyles.itemText, {textAlign: 'left', textAlignVertical: 'center'}]}>Discover how your membership can get you more!</Text>
              </View>
              </View>
            <View style={{backgroundColor: '#fff', width: '100%', height: '40%', borderBottomLeftRadius: scale(8.3), borderBottomRightRadius: scale(8.3)}}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', height: '100%'}}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '50%', height: '100%', padding: scale(12), columnGap: scale(3), borderRightWidth: scale(0.5), borderRightColor: '#ccc'}}>
                <Text style={[commonStyles.text2, {textAlign: 'left'}]}>Your balance:</Text>
                <Text style={[commonStyles.text, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(14), textAlign: 'left'}]}>$0.00</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '40%', height: '100%', padding: scale(12), columnGap: scale(3)}}>
                <Text style={[commonStyles.text2, {textAlign: 'left'}]}>Pending:</Text>
                <Text style={[commonStyles.text, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(14), textAlign: 'left'}]}>$0.00</Text>
              </View>
              </View>
              </View>
            </View>
          </Animated.ScrollView>
        <Animated.View style={[styles.footer, footerStyle, {position: 'absolute', bottom: 0, left: 0, right: 0}]}>
          <Pressable onPress={() => navigation.navigate('ShopScreen', { randomFirstName: randomFirstName || '', randomName: randomName || '' })}>
              <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%'}}>
               <ShopOutline width={scale(16)} height={scale(16)}/>
               <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8.5), color: '#4d4d4d'}} >Shop</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('ItemsScreen', { randomFirstName: randomFirstName || '', randomName: randomName || ''  })}>
            <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', height: '100%'}}>
                <ItemsOutline width={scale(16)} height={scale(16)}/>
                <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8.5), color: '#4d4d4d'}} >My Items</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('SearchScreen', { randomFirstName: randomFirstName || '', randomName: randomName || ''  })}>
            <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',  height: '100%'}}>
                <Sparky width={scale(16)} height={scale(16)}/>
                <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8.5), color: '#4d4d4d'}} >Ask Sparky</Text>
            </View>
          </Pressable>
          <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', height: '100%'}}>
              <ServicesOutline width={scale(16)} height={scale(16)}/>
              <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8.5), color: '#4d4d4d'}} >Benefits</Text>
          </View>
            <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', height: '100%'}}>
                <AccountFilled width={scale(16)} height={scale(16)}/>
                <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8.5), color: '#0053e2'}} >Account</Text>
            </View>
        </Animated.View>

      </View>
  );
};

export default AccountScreen2;

const styles = StyleSheet.create({
    purchaseContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: verticalScale(100),
    backgroundColor: '#fff',
    elevation: 2,
    padding: scale(5),
    borderRadius: scale(8.3),
  },
  purchaseContainerTop: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  photosContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPhoto: {
    width: scale(28),
    height: verticalScale(28),
    borderRadius: scale(3),
    marginHorizontal: scale(12),
  },
    exitPassBottomContainer: {
    alignItems: 'center',
    justifyContent: 'space-evenly',                                                                                                                                                                                                                                                                                                                                                                           
    backgroundColor: '#fff',
    borderColor: '#dcdcdc',
    borderStartEndRadius: scale(10),
    borderStartStartRadius: scale(10),
    borderEndEndRadius: scale(10),
    borderEndStartRadius: scale(10),
    borderStartStartWidth: scale(5),
    width: '100%',
        bottom: verticalScale(1),
    borderTopWidth: 0,
    elevation: 0,
    borderWidth: scale(0.5),
    height: verticalScale(85),
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
    tc: {
    bottom: verticalScale(0),
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(10),
    textDecorationLine: 'underline',
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
    borderWidth: scale(0.5),
    elevation: 1,
    borderColor: '#dedede',
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
    footer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: scale(0.13),
        bottom: 0,
        elevation: 5,
        flexDirection: 'row',
        height: verticalScale(33),
        justifyContent: 'space-between',
        columnGap: scale(20),
        padding: scale(7),
        paddingLeft: scale(16),
        paddingRight: scale(16),
        width: '100%',
      },
    footerText: {
        color: '#000',
        fontSize: 16,
      },
      input: {
        color: '#212121',
        fontFamily: 'EverydaySansRegular',
        fontSize: moderateScale(12),
        marginLeft: scale(5)
      },
      search:{
        alignItems: 'center',
        alignItems: 'center',
        backgroundColor: '#eeeeee',
        borderRadius: scale(30),
        flexDirection: 'row',
        height: verticalScale(30),
        justifyContent: 'flex-start',
        marginVertical: verticalScale(10),
        paddingLeft: scale(13),
        width: '100%'
      },
      searchIcon:{
        color: '#6666',
        height: scale(20),
        width: scale(20)
      },
      statusBar: {
        backgroundColor: '#0053e2',
        style: 'light',
        translucent: true,
      }
});
