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
import Scatter from '../assets/icons/Scatter.svg';
import CarouselWithDots from '../components/CarouselWithDots';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';

const AccountScreen = ({navigation, route}) => {
    const [orders, setOrders] = useState([]);
    const [storeDetails, setStoreDetails] = useState(null);
      const [currentIndex, setCurrentIndex] = useState(0);
      const flatListRef = useRef(null);
    const { 
      randomFirstName = randomFirstName || '',
      userId,
      randomName = randomName || '',
    } = route.params;
    const lastContentOffset = useSharedValue(0);
    const isScrolling = useSharedValue(false);
    const translateYHeader = useSharedValue(0);
    
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
        Query.limit(4),                // Limit to 3 results
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

// call this from your list render
const handleItemPress = async (item) => {
  try {
    await saveOrderId(item); // IMPORTANT: pass item, and await
    navigation.navigate('DetailsScreen', {
      randomName: randomName || '',
      randomFirstName: randomFirstName || '',
    });
  } catch (err) {
    console.error('Error handling item press:', err);
  }
};


const renderItem = ({ item }) => {
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

      // Otherwise try native parsing
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

  const formattedDateWithMonthShort = formatWithShortMonth(item.DateFormatted);
  return (
    <View style={{ padding: scale(5), width: scale(300) }}>
      <Pressable
        onPress={() => handleItemPress(item)}
        style={styles.purchaseContainer}
      >
        <View style={styles.purchaseContainerTop}>
          <View style={{ flexDirection: 'column', width: '100%', height: '40%', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: '100%', height: '40%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }}>
              <View style={{ width: '100%', height: '100%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', columnGap: scale(10), marginLeft: scale(10) }}>
                <View style={{ width: '10%', height: '100%' }}>
                  <Store
                    width={scale(30)}
                    height={scale(30)}
                    style={{ left: scale(0), bottom: verticalScale(0) }}
                  />
                </View>
                <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', width: '70%', height: '100%', rowGap: verticalScale(2), top: verticalScale(5) }}>
                  <Text style={{ color: '#000', fontFamily: 'EverydaySansRegular', fontSize: scale(7) }}>
                    Store Purchase
                  </Text>
                  <Text
                    style={[
                      commonStyles.titleText,
                      {
                        fontSize: moderateScale(10.5),
                        bottom: verticalScale(0),
                        color: '#000',
                        fontFamily: 'EverydaySansBold',
                      },
                    ]}
                  >
                    {formattedDateWithMonthShort} purchase
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.photosContainer}>
            {Array.isArray(item.Items) && item.Items.length > 0 ? (
              item.Items.slice(0, 5).map((product, index) => (
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
                  { textAlign: 'center', left: scale(15), fontSize: scale(9) },
                ]}
              >
                No items available
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
};


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ height: heightPercentageToDP(6), width: '100%', alignItems: 'center', backgroundColor: '#0053e2', position: 'absolute', left: 0, right: 0, top: 0, zIndex: 3, justifyContent: 'center'}}>
          <WPlus4 width={moderateScale(77)} height={moderateScale(35)} />
        </View>

          <View style={{flexDirection: 'row', width: widthPercentageToDP(100), height: heightPercentageToDP(7), top: heightPercentageToDP(6), alignItems: 'center', justifyContent: 'space-between', padding: moderateScale(5), zIndex: 2, backgroundColor: '#fff'}}>
            <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', width: widthPercentageToDP(75), height: '100%' }}>
              <Text
                style={{
                            fontFamily: 'EverydaySansBold',
                            paddingLeft: scale(5),
                            textAlign: 'left',
                            color: '#001e60',
                            fontSize: moderateScale(16),
                        }}
                      >
                      Hi, {randomFirstName}
                      </Text>
                      <Text
                      style={{
                          fontFamily: 'EverydaySansRegular',
                          paddingLeft: scale(5),
                          color: '#001e60',
                          fontSize: moderateScale(8),
                      }}
                      >
                      Member since 2023
                      </Text>
            </View>
            <View style={{width: widthPercentageToDP(25), height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingRight: scale(10)}}>
              <View style={{width: '50%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <Globe width={moderateScale(20)} height={moderateScale(20)} />
              </View>
              <View style={{width: '50%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <Settings width={moderateScale(20)} height={moderateScale(27)} style={{top: verticalScale(3)}}/>
              </View>
            </View>
          </View>
          <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} fadingEdgeLength={verticalScale(25)} contentContainerStyle={{rowGap: verticalScale(10), height: '120%', marginBottom: verticalScale(0), padding: scale(10), flexDirection: 'column', paddingTop: verticalScale(35), flexDirection: 'column', zIndex: 1}}>
              <View>
              <View style={{flexDirection: 'row', width: '100%', height: verticalScale(25), alignItems: 'center', justifyContent: 'space-between'}}>
                <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(13), }}>Purchase History</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('PurchaseHistory', {
                    randomFirstName: randomFirstName || '',
                    userId: userId || '',
                    randomName: randomName || '',
                  })}
                  style={{zIndex: 5}}
                  hitSlop={30}>
                  <Text style={{fontFamily: 'EverydaySansRegular', textDecorationLine: 'underline', fontSize: moderateScale(11), zIndex: 2}}>View all</Text>
                </TouchableOpacity>
              </View>

            <FlatList
              ref={flatListRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const scrollX = event.nativeEvent.contentOffset.x;
                const ITEM_WIDTH = scale(300);
                const index = Math.round(scrollX / ITEM_WIDTH);
                setCurrentIndex(index);
              }}
              scrollEventThrottle={16}
              contentContainerStyle={[{
                backgroundColor: '#fff',
                zIndex: 4,
              }]}
              data={orders}
              keyExtractor={(item) => item.orderId}
              renderItem={renderItem}
            />
                  <View style={styles.dotsContainer}>
                    {orders.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          currentIndex === index ? styles.activeDot : null,
                        ]}
                      />
                    ))}
                  </View>
            </View>
            <View style={{width: '100%', height: heightPercentageToDP(41), elevation: 4, paddingHorizontal: scale(12), zIndex: 1, paddingVertical: verticalScale(8), backgroundColor: '#fff', overflow: 'hidden', borderRadius: scale(8.3)}}>
              <View style={{flexDirection: 'row', width: '100%', height: '12%', alignItems: 'center', columnGap: scale(9), justifyContent: 'flex-start', zIndex: 1}}>
                <View style={{width: '90%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', columnGap: scale(4)}}>
                  <WPlus3 width={moderateScale(70)} height={moderateScale(22)} />
                  <Text style={[{fontFamily: 'EverydaySansBold', color: '#0053e2', textAlignVertical: 'center', fontSize: moderateScale(15)}]}>membership</Text>
                </View>
                <View style={{width: '10%', alignItems: 'center', justifyContent: 'center'}}>
                  <ExpandIcon3 width={moderateScale(13)} height={moderateScale(13)} style={{right: scale(5)}} />
                </View>
              </View>
              <View style={{height: '25%', width: '100%', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderBottomColor: '#777', borderBottomWidth: verticalScale(0.25)}}>
              <Scatter style={{zIndex: 0, top: verticalScale(45), left: scale(10)}}/>
              <View style={{alignItems: 'center', flexDirection: 'row', bottom: verticalScale(15), columnGap: scale(10), width: '100%', zIndex: 1}}>
                <View style={{width: '15%', zIndex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <Image source={{uri: 'https://i5.walmartimages.com/dfw/4ff9c6c9-26a6/k2-_1772ada3-22e8-44b8-b10e-070ebeca9cd7.v1.png'}} style={{width: moderateScale(35), height: moderateScale(35)}} />
                </View>
                <View style={{flexDirection: 'column', width: '85%', alignItems: 'flex-start', justifyContent: 'center'}}>
                  <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5)}]}>Get 50% off annual membership+</Text>
                  <Text style={[styles.itemText, {fontFamily: 'EverydaySansRegular', textDecorationLine: 'underline', fontSize: moderateScale(9.5)}]}>Enjoy video streaming for members.</Text>
                </View>
              </View>
              </View>
              <View style={{ alignItems: 'center', flexDirection: 'row', columnGap: scale(10), width: '100%', height: '25%', zIndex: 1, borderBottomColor: '#777', borderBottomWidth: verticalScale(0.25)}}>
                <View style={{width: '15%', zIndex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <Image source={{uri: 'https://i5.walmartimages.com/dfw/4ff9c6c9-b031/k2-_2bb1baa5-d4af-4a2d-939e-a3adfc04a99f.v1.png'}} style={{width: moderateScale(35), height: moderateScale(35)}} />
                </View>
                <View style={{flexDirection: 'column', width: '85%', alignItems: 'flex-start', justifyContent: 'center'}}>
                  <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5)}]}>Free Delivery</Text>
                  <Text style={[styles.itemText, {fontFamily: 'EverydaySansRegular', textDecorationLine: 'underline', fontSize: moderateScale(9.5)}]}>Get groceries & more delivered free as fast as today! $35 min. T & C apply</Text>
                </View>
              </View>
              <View style={{ padding: scale(5), alignItems: 'center', flexDirection: 'row', columnGap: scale(10), width: '100%', height: '20%', zIndex: 1}}>
                <View style={{width: '15%', zIndex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <Image source={{uri: 'https://i5.walmartimages.com/dfw/4ff9c6c9-5811/k2-_7d68f0b5-1fdf-4cf8-9278-5c27c76a050e.v1.png'}} style={{width: moderateScale(35), height: moderateScale(35)}} />
                </View>
                <View style={{flexDirection: 'column', width: '85%', alignItems: 'flex-start', justifyContent: 'center'}}>
                  <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5)}]}>Free Shipping</Text>
                  <Text style={[styles.itemText, {fontFamily: 'EverydaySansRegular', textDecorationLine: 'underline', fontSize: moderateScale(9.5)}]}>Enjoy next-day & two-day shipping with no order minimum! T & C apply</Text>
                </View>

              </View>
              <View style={{borderWidth: scale(1), borderColor: '#000', borderRadius: scale(16.6), width: '100%', height: heightPercentageToDP(3.7), backgroundColor: '#fff', marginTop: verticalScale(10)}}>
                <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(9), textAlignVertical: 'center', textAlign: 'center', height: '100%' }]}>See all your membership benefits</Text>
              </View>
              <View style={{ height: verticalScale(500), width: scale(100), borderRadius: scale(200), backgroundColor: '#fdbd31', bottom: verticalScale(120), transform: [{ scaleX: 1.75}], transform: [{rotate: '50deg'}], zIndex: -1, right: scale(150)}}/>
              <View style={{ height: verticalScale(100), width: scale(500), borderRadius: scale(200), backgroundColor: '#fdbd31', bottom: verticalScale(700), transform: [{ scaleY: 1.75}], transform: [{rotate: '30deg'}], zIndex: -1, left: scale(200)}}/>
            </View>
            <View style={{width: '100%', height: heightPercentageToDP(13), flexDirection: 'column', elevation: 2, backgroundColor: '#fff', borderRadius: scale(8.3)}}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '50%', borderBottomWidth: scale(0.5), borderBottomColor: '#ccc',  backgroundColor: 'rgb(255, 237, 188)', padding: scale(10), borderTopLeftRadius: moderateScale(6), borderTopRightRadius: moderateScale(6)}}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '70%', height: '100%'}}>
                  <Image source={{uri: 'https://i5.walmartimages.com/dfw/4ff9c6c9-168f/k2-_db38bdd1-6e5c-491a-a4b8-b3d34d0d93bd.v1.png'}} style={{width: moderateScale(35), height: moderateScale(35)}} />
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
            <View style={{ width: '100%', height: heightPercentageToDP(13), zIndex: 1, elevation: 1, flexDirection: 'column', borderRadius: scale(8.3)}}>
              <View style={{height: '60%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: scale(10), width: '100%', backgroundColor: '#d0f4fc', borderTopLeftRadius: scale(8.3), borderTopRightRadius: scale(8.3), zIndex: 1, rowGap: verticalScale(0)}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '85%', height: '100%'}}>
                    <MoneyFlip width={moderateScale(20)} height={moderateScale(20)}/>
                    <Text style={[commonStyles.titleText, {color: '#001f64', left: scale(7)}]}>Walmart Cash</Text>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: '15%', height: '100%'}}>
                  <ExpandIcon3 width={scale(13)} height={scale(13)} style={{right: scale(5)}} />
                </View>
                </View>
              <View style={{alignItems: 'flex-start', paddingLeft: scale(10), justifyContent: 'center', alignItems: 'flex-start', width: '100%', height: '50%'}}>
                <Text style={[styles.itemText, {textAlign: 'left', textAlignVertical: 'center'}]}>Discover how your membership can get you more!</Text>
              </View>
              </View>
            <View style={{backgroundColor: '#fff', width: '100%', height: '40%', borderBottomLeftRadius: scale(8.3), borderBottomRightRadius: scale(8.3), flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', height: '100%'}}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '50%', height: '100%', padding: scale(12), columnGap: scale(3), borderRightWidth: scale(0.5), borderRightColor: '#ccc'}}>
                <Text style={[commonStyles.text2, {textAlign: 'left', textAlignVertical: 'center'}]}>Your balance:</Text>
                <Text style={[commonStyles.text, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(14), textAlign: 'left', textAlignVertical: 'center'}]}>$0.00</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '40%', height: '100%', padding: scale(12), columnGap: scale(3)}}>
                <Text style={[commonStyles.text2, {textAlign: 'left', textAlignVertical: 'center'}]}>Pending:</Text>
                <Text style={[commonStyles.text, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(14), textAlign: 'left', textAlignVertical: 'center'}]}>$0.00</Text>
              </View>
              </View>
              </View>
            </View>
          </Animated.ScrollView>
        <Animated.View style={[styles.footer, footerStyle, {position: 'absolute', bottom: 0, left: 0, right: 0}]}>
          <Pressable hitSlop={moderateScale(20)} onPress={() => navigation.navigate('ShopScreen', { randomFirstName: randomFirstName || '', randomName: randomName || '' })}>
              <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', height: '100%'}}>
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

export default AccountScreen;

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: scale(10),
    marginVertical: verticalScale(10)
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    borderWidth: moderateScale(1.5),
    borderColor: '#666',
    backgroundColor: '#fff',
  },
  activeDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#666',
  },
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
  itemText: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    color: '#000',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(10),
    textAlign: 'left'
  },
  photosContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPhoto: {
    width: moderateScale(35),
    height: moderateScale(35),
    marginHorizontal: scale(12),
  },
    footer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: scale(0.13),
        bottom: 0,
        elevation: 5,
        flexDirection: 'row',
        height: heightPercentageToDP(4.5),
        justifyContent: 'space-between',
        columnGap: scale(20),
        paddingVertical: verticalScale(5),
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
