import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  RefreshControl,
  useWindowDimensions,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { account, databases } from '../lib/appwrite';
import * as SecureStore from 'expo-secure-store';
import { useUser } from '../contexts/UserContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Query } from 'react-native-appwrite';
import ItemPhotos from '../components/ItemPhotos';
import BackIcon from '../assets/icons/BackIcon';
import ExpandIcon3 from '../assets/icons/ExpandIcon3.svg';
import ExitIcon2 from '../assets/icons/ExitIcon2.svg';
import Store from '../assets/icons/Store.svg';
import Store2 from '../assets/icons/Store2.svg';
import CartIcon from '../assets/icons/CartIcon.svg';
import ScannerIcon from '../assets/icons/ScannerIcon.svg';
import { commonStyles } from '../lib/styles';
import SearchIcon from '../assets/icons/SearchIcon.svg';
import Down from '../assets/icons/Down.svg';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';

export default function PurchaseHistory({ navigation, route }) {
  const { randomFirstName, randomName } = route.params;
  const [isDeleting, setIsDeleting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [pressedButtons, setPressedButtons] = useState({
    all: true,
    byDate: false,
    returns: false,
    inStore: false,
    status: false,
  });
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => setModalVisible(!isModalVisible);
      useEffect(() => {
      const fetchUserId = async () => {
        try {
          const id = await SecureStore.getItemAsync('userId');
          if (id) setUserId(id);
          console.log('Retrieved UserId:', id);
        } catch (error) {
          console.error('Error retrieving UserId:', error);
        }
      };
      fetchUserId();
    }, []);

  const [selectedOption, setSelectedOption] = useState(null);

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'last3months', label: 'Last 3 months' },
    { id: 'last6months', label: 'Last 6 months' },
    { id: '2025', label: '2025' },
    { id: '2024', label: '2024' },
    { id: '2023', label: '2023' },
    { id: '2022', label: '2022' },
    { id: '2021', label: '2021' },
  ];

  const { width, height } = useWindowDimensions();

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
      navigation.navigate('DetailsScreen2', {
        randomName,
        randomFirstName,
      });
    } catch (err) {
      console.error('Error handling item press:', err);
    }
  };

  const fetchFilteredOrders = async (optionId) => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      const databaseId = 'orders2'
      const collectionId = userId;
      const queries = [Query.limit(1000)];

      const now = new Date();
      let startDate = null;
      let endDate = null;

      switch (optionId) {
        case 'last3months':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'last6months':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '2025':
        case '2024':
        case '2023':
        case '2022':
        case '2021':
          startDate = new Date(`${optionId}-01-01T00:00:00.000Z`);
          endDate = new Date(`${optionId}-12-31T23:59:59.999Z`);
          break;
        case 'all':
        default:
          // No filter => fetch all
          break;
      }

      if (startDate && endDate) {
        queries.push(Query.greaterThanEqual('$createdAt', startDate.toISOString()));
        queries.push(Query.lessThanEqual('$createdAt', endDate.toISOString()));
      } else if (startDate) {
        queries.push(Query.greaterThanEqual('$createdAt', startDate.toISOString()));
      }

      const ordersResponse = await databases.listDocuments(databaseId, collectionId, queries);

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
          if (!timeFormatted || typeof timeFormatted !== 'string') return '00:00:00';
          const [time, period] = timeFormatted.split(' ');
          if (!time || !period) return '00:00:00';
          let [hours, minutes, seconds] = time.split(':').map(Number);
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds || '00'}`;
        };

        const timeConversion = convertToMilitaryTime(order.TimeFormatted);

        const date = (() => {
          if (!order.DateFormatted || typeof order.DateFormatted !== 'string')
            return 'Unknown Date';
          try {
            const [month, day, year] = order.DateFormatted.split('/');
            const d = new Date(year, month - 1, day);
            return d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          } catch (error) {
            console.error(`Error formatting date for order ${order.$id}:`, error);
            return order.DateFormatted;
          }
        })();

        return {
          orderId: order.$id,
          DateFormatted: date,
          TimeFormatted: order.TimeFormatted,
          NumericDate: order.NumericDate,
          StoreNumber: order.StoreNumber || 'Unknown',
          StoreAddress: order.StoreAddress || 'Unknown',
          StoreCity: order.StoreCity || 'Unknown',
          StoreZip: order.StoreZip || 'Unknown',
          Manager: order.Manager || 'Unknown',
          PhoneNumber: order.PhoneNumber || 'Unknown',
          OP: order.OP || 'Unknown',
          TE: order.TE || 'Unknown',
          TC: order.TC || 'Unknown',
          Items: parsedItems,
          TaxRate: order.TaxRate || 0,
          TaxAmount: order.TaxAmount || 0,
          Subtotal: order.Subtotal || 0,
          Total: order.Total || 0,
          militaryTime: timeConversion,
          code: order.Barcode,
          CreatedAt: new Date(order.$createdAt || Date.now()),
        };
      });

      const sortedOrders = orderDetails.sort((a, b) => b.CreatedAt - a.CreatedAt);
      return sortedOrders;
    } catch (error) {
      console.error('Error fetching filtered orders:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      const allOrders = await fetchFilteredOrders('all');
      setOrders(allOrders);
    };
    loadOrders();
  }, []);

  const toggleButton = (buttonKey) => {
    if (buttonKey === 'all') {
      setPressedButtons({
        all: true,
        byDate: false,
        returns: false,
        inStore: false,
        status: false,
      });
    } else {
      setPressedButtons((prev) => ({
        all: false,
        byDate: buttonKey === 'byDate',
        returns: buttonKey === 'returns',
        inStore: buttonKey === 'inStore',
        status: buttonKey === 'status',
      }));

      if (buttonKey === 'byDate') {
        toggleModal();
      }
    }
  };

  const toggleFilter = (optionId) => {
    setSelectedOption(optionId);
  };

  const user = useUser();

  const lastContentOffset = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  const translateY = useSharedValue(0);

  const actionBar = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(translateY.value, {
            duration: 200,
          }),
        },
      ],
    };
  });


  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const fresh = await fetchFilteredOrders(selectedOption || 'all');
      setOrders(fresh);
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

// add another shared value
const scrollY = useSharedValue(0);

const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    // store current scroll position
    scrollY.value = event.contentOffset.y;

    // keep your old up/down toggle logic
    if (lastContentOffset.value > event.contentOffset.y && isScrolling.value) {
      translateY.value = 0;
    } else if (
      lastContentOffset.value < event.contentOffset.y &&
      isScrolling.value
    ) {
      translateY.value = -60;
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

// animated margin style
const animatedMargin = useAnimatedStyle(() => {
  // start with 60 marginTop at y=0, shrink to 0 at y=150
  const margin = Math.max(0, 1 - scrollY.value * (1 / 150));
  return {
    marginTop: margin,
  };
});

  const handleViewResults = async () => {
    const filtered = await fetchFilteredOrders(selectedOption || 'all');
    setOrders(filtered);
    setModalVisible(false);
  };

const handleLongPressOrder = async (item) => {
  try {
    // Save the order ID for reference (optional)
    await SecureStore.setItemAsync('orderId', item.orderId);

    Alert.alert(
      "Delete Order",
      "Are you sure you want to delete this order?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDeleteOrder(item, userId),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  } catch (err) {
    console.error("Error saving order ID:", err);
  }
};

const handleDeleteOrder = async (item, userId) => {
    setIsDeleting(true);
  try {
    const orderId = item.$id || item.documentId || (await SecureStore.getItemAsync('orderId'));

    if (!orderId) {
      Alert.alert("Error", "Could not find the order ID to delete.");
      return;
    }

    const databaseId = "orders2"; // Your Appwrite database ID
    const collectionId = userId; // Each user's collection

    // 🧹 Delete document from Appwrite
    await databases.deleteDocument(databaseId, collectionId, orderId);

    Alert.alert("Success", "Order deleted successfully!");

      const allOrders = await fetchFilteredOrders('all');
      setOrders(allOrders);
  } catch (error) {
    console.error("Error deleting order:", error);
    Alert.alert("Error", "An error occurred while deleting the order. Please try again.");
  } finally {
    setIsDeleting(false);
  }
};



const renderItem = ({ item }) => (
  <View style={{ padding: scale(12) }}>
    <Pressable
      onPress={() => handleItemPress(item)}
      onLongPress={() => handleLongPressOrder(item, userId)}
      style={styles.purchaseContainer}
    >
      <View style={styles.purchaseContainerTop}>
        <View
          style={{
            flexDirection: 'column',
            width: '100%',
            height: '40%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: '100%',
              height: '40%',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: '100%',
                height: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                columnGap: scale(15),
              }}
            >
              <View style={{ width: '10%', height: '100%' }}>
                <Store
                  width={scale(35)}
                  height={verticalScale(35)}
                  style={{ left: scale(5), bottom: verticalScale(5) }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  width: '70%',
                  height: '100%',
                  top: verticalScale(3),
                  rowGap: verticalScale(4),
                }}
              >
                <Text
                  style={{
                    bottom: verticalScale(-2),
                    color: '#000',
                    fontFamily: 'EverydaySansRegular',
                    fontSize: moderateScale(9.5),
                    right: scale(2),
                    top: verticalScale(5)
                  }}
                >
                  Store Purchase
                </Text>
                <Text
                  style={{
                    bottom: verticalScale(-3),
                    color: '#000',
                    fontFamily: 'EverydaySansRegular',
                    fontSize: moderateScale(8),
                  }}
                >
                  {item.StoreAddress}
                </Text>
                <Text
                  style={[
                    commonStyles.titleText,
                    {
                      fontSize: moderateScale(13),
                      bottom: verticalScale(0),
                      color: '#000',
                      fontFamily: 'EverydaySansBold',
                      right: scale(2),
                    },
                  ]}
                >
                  {item.DateFormatted} purchase
                </Text>
              </View>

              <View
                style={{
                  width: '10%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ExpandIcon3
                  width={scale(9)}
                  height={verticalScale(9)}
                  style={{ bottom: verticalScale(0)}}
                />
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
                { textAlign: 'center', left: scale(15), fontSize: moderateScale(10) },
              ]}
            >
              No items available
            </Text>
          )}
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          padding: scale(10),
          justifyContent: 'space-between',
          alignItems: 'space-between',
        }}
      >
        <View>
        <Text
          style={{
            textDecorationLine: 'underline',
            fontFamily: 'EverydaySansRegular',
            fontSize: moderateScale(9),
            color: '#222',
            textAlign: 'center',
            textAlignVertical: 'center',
          }}
        >
          Start a return
        </Text>
        </View>
        <View>
        <Text
          style={{
            color: '#222',
            fontFamily: 'EverydaySansRegular',
            fontSize: moderateScale(9),            
            textAlign: 'center',
            textAlignVertical: 'center',
          }}
        >Order total   ${item.Total.toFixed(2)}
                </Text>
        </View>
      </View>
    </Pressable>
  </View>
);


  return (
    <>
      <View style={{ flex: 1 }}>
        <View style={[commonStyles.header, {height: heightPercentageToDP(6)}]}>
        <View style={[commonStyles.headerItems, { alignItems: 'flex-end', justifyContent: 'space-between', columnGap: scale(10), paddingBottom: verticalScale(2)}]}>
          <View style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-start', columnGap: scale(10), bottom: verticalScale(0)}]}>
              <Pressable
                onPress={() =>
                  navigation.navigate('AccountScreen', { randomFirstName, randomName })
                }
                style={{
                  flexDirection: 'row',
                  width: '78%',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  columnGap: scale(10)
                }}
              >
                <BackIcon width={moderateScale(22)} height={moderateScale(22)} />
                <Text style={[commonStyles.headerLabelText, {marginLeft: scale(5)}]}>Purchase History</Text>
              </Pressable>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '22%',
                height: '90%',
                justifyContent: 'center',
                alignItems: 'center',
                right: scale(0),
                position: 'absolute',
                columnGap: scale(15),
              }}
            >
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rowGap: verticalScale(4),
                  width: '50%',
                  bottom: verticalScale(4),
                  height: '100%',
                  left: scale(8),
                }}
              >
                <ScannerIcon
                  width={moderateScale(18)}
                  height={moderateScale(18)}
                  style={{ top: verticalScale(2.5) }}
                />
                <Text
                  style={[
                    commonStyles.cartTotal,
                    { fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8), color: '#fff' },
                  ]}
                >
                  Scanner
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rowGap: verticalScale(2),
                  width: '50%',
                  bottom: verticalScale(5),
                  height: '100%',
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
        </View>
        <Animated.View
          style={[
            actionBar,
            {
              position: 'absolute',
              top: heightPercentageToDP(6),
              zIndex: 1,
              width: '100%',
              height: heightPercentageToDP(10.5),
              padding: scale(5),
              elevation: 4,
              backgroundColor: '#fff',
            },
          ]}
        >
      <View style={{ zIndex: 1, width: '100%', paddingHorizontal: scale(5), rowGap: verticalScale(3)}}>
      <View style={styles.searchBar}>
        <View>
          <SearchIcon width={scale(15)} height={verticalScale(15)} color="#4b4b4bff" style={styles.searchIcon} />
        </View>
        <View>
          <TextInput placeholder="Search your purchases" style={[styles.input, {height: '100%'}]} />
        </View>
      </View>
      <View style={styles.searchFilters}>
        <Pressable style={{width: '12%', height: verticalScale(23), backgroundColor: '#004f9a', borderRadius: scale(15), justifyContent: 'center', alignItems: 'center', marginHorizontal: scale(4)}}>
          <Text style={styles.filterAllText}>All</Text>
        </Pressable>
        <Pressable style={{width: '25%', height: verticalScale(23), backgroundColor: '#e3e3e3', flexDirection: 'row', borderRadius: scale(15), justifyContent: 'center', alignItems: 'center', marginHorizontal: scale(4)}}>
          <Text style={styles.filterText}>By date</Text>
          <Down style={{width: scale(5), height: verticalScale(5)}} />
        </Pressable>
        <Pressable style={{width: '19%', height: verticalScale(23), backgroundColor: '#e3e3e3', borderRadius: scale(15), justifyContent: 'center', alignItems: 'center', marginHorizontal: scale(4)}}>
          <Text style={styles.filterText}>Returns</Text>
        </Pressable>
        <Pressable style={{width: '17%', height: verticalScale(23), backgroundColor: '#e3e3e3', borderRadius: scale(15), justifyContent: 'center', alignItems: 'center', marginHorizontal: scale(4)}}>
          <Text style={styles.filterText}>In store</Text>
        </Pressable>
        <Pressable style={{width: '23%', height: verticalScale(23), backgroundColor: '#e3e3e3', flexDirection: 'row', borderRadius: scale(15), justifyContent: 'center', alignItems: 'center', marginHorizontal: scale(4)}}>
          <Text style={styles.filterText}>Status</Text>
          <Down style={{width: moderateScale(8), height: verticalScale(8)}} />
        </Pressable>
      </View>
      </View>
    </Animated.View>
        <Animated.FlatList
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            animatedMargin,
            {
              paddingTop: heightPercentageToDP(10.5),
              backgroundColor: '#fff',
              flex: 'auto',
              height: 'auto',
              zIndex: -1
          }]}
          data={orders}
          keyExtractor={(item) => item.orderId}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        {isDeleting && 
        <View style={{backgroundColor: 'rgba(0, 0, 0, 0.11)', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size={'large'} color="#0053E2" />
        </View>
        }
        <Modal
          visible={isModalVisible}
          onBackdropPress={toggleModal}
          statusBarTranslucent={true}
          transparent={true}
          backdropColor={'#00000000'}
        >
          <View
            style={{
              width: width,
              height: verticalScale(325),
              position: 'absolute',
              left: scale(0),
              bottom: verticalScale(-37),
              elevation: 5,
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                rowGap: verticalScale(5),
                padding: scale(15),
                borderTopStartRadius: scale(15),
                borderTopEndRadius: scale(15),
                elevation: 2,
                paddingBottom: verticalScale(10),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  width: '100%',
                  height: verticalScale(25),
                }}
              >
                <View style={{ width: '95%', height: '100%' }}>
                  <Text style={[commonStyles.titleText, { fontSize: scale(10) }]}>
                    Filter by date
                  </Text>
                </View>
                <View style={{ width: '5%', height: '100%' }}>
                  <ExitIcon2 width={scale(18)} height={verticalScale(18)} />
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  width: '100%',
                  height: verticalScale(190),
                  paddingBottom: verticalScale(15),
                }}
              >
                {filterOptions.map((option) => (
                  <Pressable
                    key={option.id}
                    onPress={() => toggleFilter(option.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      width: '100%',
                      height: '10%',
                      columnGap: scale(10),
                    }}
                  >
                    <View
                      style={{
                        width: scale(15),
                        height: scale(15),
                        borderRadius: scale(15),
                        borderWidth: scale(1.25),
                        borderColor:
                          selectedOption === option.id ? '#0053e2' : '#000',
                        backgroundColor:
                          selectedOption === option.id ? '#0053e2' : '#fff',
                      }}
                    />
                    <Text style={[commonStyles.text, { fontSize: scale(8) }]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View
                style={{
                  width: '100%',
                  height: verticalScale(40),
                  paddingBottom: verticalScale(20),
                }}
              >
                <Pressable
                  onPress={handleViewResults}
                  style={{
                    backgroundColor: '#0053e2',
                    width: '100%',
                    height: verticalScale(25),
                    borderRadius: scale(15),
                    elevation: 2,
                    bottom: verticalScale(5),
                    justifyContent: 'center',
                  }}
                >
                  <Text style={[commonStyles.buttonText, { textVerticalAlign: 'center' }]}>
                    View results
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  filterAllText: {
    color: '#fff',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(8),
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  filterText: {
    color: '#515151',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(7),
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  input: {
    color: '#212121',
    fontFamily: 'EverydaySansRegular',
    textAlignVertical: 'center',
    fontSize: moderateScale(11),
    marginLeft: scale(8)
  },
  searchBar:{
    alignItems: 'center',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
    borderRadius: scale(20),
    flexDirection: 'row',
    height: heightPercentageToDP(4),
    justifyContent: 'flex-start',
    paddingLeft: moderateScale(15),
    width: '100%'
  },
  searchFilters: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  searchIcon:{
    color: '#4b4b4bff',
    height: moderateScale(20),
    width: moderateScale(20)
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: verticalScale(25),
    backgroundColor: '#eeeeee',
    borderRadius: scale(30),
    paddingLeft: scale(15),
  },
  searchIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
  },
  searchFilters: {
    paddingLeft: scale(10),
    paddingRight: scale(10),
    paddingTop: verticalScale(5),
    paddingBottom: verticalScale(8),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    fontSize: moderateScale(10),
    fontFamily: 'EverydaySansRegular',
    textAlign: 'center',
  },
  purchaseContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    alignItems: 'center',
    height: heightPercentageToDP(18),
    backgroundColor: '#fff',
    elevation: 2,
    padding: scale(5),
    borderRadius: scale(8.3),
  },
  purchaseContainerTop: {
    width: '100%',
    height: '80%',
    borderBottomColor: '#dedede',
    borderBottomWidth: 0.8,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '50%',
  },
  itemPhoto: {
    width: moderateScale(35),
    height: moderateScale(35),
    marginHorizontal: scale(12),
    top: verticalScale(8)
  },
});
