  // BarcodeScanner.js (fixed)
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import { useKeepAwake } from "expo-keep-awake";
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import WebView from 'react-native-webview';
import { Query, Permission, Role } from 'react-native-appwrite';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import * as SecureStore from 'expo-secure-store';
import StarRating from '../components/StarRating';
import { databases } from '../lib/appwrite';
import BackIcon from '../assets/icons/BackIcon.svg';
import FlashOn from '../assets/icons/FlashOn.svg';
import FlashOff from '../assets/icons/FlashOff.svg';
import Help from '../assets/icons/Help.svg';
import ScannerIcon2 from '../assets/icons/ScannerIcon2.svg';
import { commonStyles } from '../lib/styles';
import Info from '../assets/icons/Info.svg';
import ExpandIcon4 from '../assets/icons/ExpandIcon4.svg';
import ExitIcon2 from '../assets/icons/ExitIcon2.svg';

export default function BarcodeScanner({ navigation, route }) {
  useKeepAwake();
  const { width, height } = useWindowDimensions();

  const {
    items = [],
    randomName = '',
    randomFirstName = '',
    selectedStoreDetails = {},
    time = '',
    formattedDate = '',
    numericDate = '',
    userId = '',
    dateLong = '',
    formattedDateWithMonthShort = '',
    manualUPC = '',
  } = route?.params || {};

  const [barcodeValue, setBarcodeValue] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [storeDetails, setStoreDetails] = useState({}); // ✅ safe default
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [itemDetails, setItemDetails] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [pressed, setPressed] = useState(false);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState([]);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const toggleModal = () => setModalVisible(!isModalVisible);
  const toggleItemModal = () => setItemModalVisible(!itemModalVisible);

  const cameraRef = useRef(null);
  const webViewRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  // ✅ Merge incoming items from MainPage when opening scanner
useEffect(() => {
  const incomingItems = route?.params?.items || [];
  if (Array.isArray(incomingItems) && incomingItems.length > 0) {
    setScannedItems((prev) => {
      // merge by UPC so we don't duplicate items
      const map = new Map();
      [...prev, ...incomingItems].forEach((item) => {
        if (!item?.upc) return;
        const existing = map.get(item.upc);
        if (existing) {
          map.set(item.upc, {
            ...existing,
            quantity: (existing.quantity || 1) + (item.quantity || 1),
          });
        } else {
          map.set(item.upc, { ...item });
        }
      });
      return Array.from(map.values());
    });
  }
}, [route?.params?.items]);


  useEffect(() => {
    const fetchLastStoreLocation = async () => {
      try {
        const storedLocation = await SecureStore.getItemAsync('lastStoreLocation');
        if (storedLocation) setStoreDetails(JSON.parse(storedLocation));
      } catch (error) {
        console.error('Error retrieving store location:', error);
      }
    };
    fetchLastStoreLocation();
  }, []);

  // ask once on mount if not granted
  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission, requestPermission]);

  // 🔧 MOVED ABOVE THE RETURNS: sync any pre-seeded items from route.params
  useEffect(() => {
    const incoming = route?.params?.scannedItems;
    if (Array.isArray(incoming) && incoming.length) {
      setScannedItems(incoming);
      // optionally clear params so they don't merge again
      navigation.setParams?.({
        ...route.params,
        scannedItems: [],
      });
    }
  }, [route?.params?.scannedItems, navigation]);

  const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

  const mapBluecartProduct = (product = {}) => {
  const images = Array.isArray(product.images) ? product.images : [];
  const firstPhoto = product?.main_image?.link || images[0]?.link || '';
  const photos = images.map(img => img?.link).filter(Boolean);

  const bb = product?.buybox_winner || {};
  const fulfill = bb?.fulfillment || {};

  const breadcrumbs = Array.isArray(product?.breadcrumbs) ? product.breadcrumbs : [];
  const isFood =
    breadcrumbs.some(b => (b?.name || '').toLowerCase() === 'food') ||
    (product?.type || '').toLowerCase().includes('food');

  const shippingMessage =
    fulfill?.message ||
    fulfill?.pickup_message ||
    fulfill?.delivery_from_store_message || '';

  return {
    name: product?.title,
    description: product?.description,
    price: num(bb?.price, 0),
    photos,
    brand: product?.brand,
    isFood,
    aisle: product?.aisle,
    upc: product?.upc,
    pickup: !!fulfill?.pickup,
    delivery: !!fulfill?.delivery_from_store,
    ship: !!fulfill?.shipping,
    rating: num(product?.rating, 0),
    totalRatings: num(product?.ratings_total, 0),
    firstPhoto,
    shippingMessage,
    link: product?.link,
  };
};

// ---- CREATE-ONLY: no listDocuments check here ----
const saveScannedItem = async (item) => {
  const databaseId = 'products2';
  const collectionId = 'products';

  const upc = item?.upc;
  if (!upc) {
    console.error('saveScannedItem: missing UPC');
    return;
  }

  // If your Appwrite schema doesn't allow arrays, store photos as JSON:
  // photos: JSON.stringify(item.photos)
  const doc = {
    name: item.name,
    description: item.description,
    price: num(item.price, 0),
    photos: item.photos,
    brand: item.brand,
    isFood: !!item.isFood,
    aisle: item.aisle,
    upc,
    pickup: !!item.pickup,
    delivery: !!item.delivery,
    ship: !!item.ship,
    rating: num(item.rating, 0),
    totalRatings: num(item.totalRatings, 0),
    firstPhoto: item.firstPhoto,
    shippingMessage: item.shippingMessage,
    link: item.link,
  };

  try {
    const res = await databases.createDocument(
      databaseId,
      collectionId,
      upc, // use UPC as document ID
      doc,
      [
        Permission.read(Role.any()),
        Permission.write(Role.any()),
        Permission.update(Role.any()),
      ]
    );
    console.log('Item created in Appwrite:', res?.$id || res);
  } catch (error) {
    // If another device/user wrote it first, Appwrite returns 409
    if (error?.code === 409 || error?.response?.status === 409) {
      console.log(`Item ${upc} already exists (409). Skipping create.`);
      return;
    }
    console.error('Error creating item:', error?.response?.data || error?.message || error);
  }
};

  const fetchProductData = async (barcodeValue, manualUPC) => {
  const upc = manualUPC || barcodeValue;
  if (!upc) return;

  const databaseId = 'products2';
  const collectionId = 'products';

  try {
    // 1) Check Appwrite first
    const existingItem = await databases.listDocuments(
      databaseId,
      collectionId,
      [Query.equal('upc', upc)]
    );

    if (existingItem.total > 0) {
      // ✅ Use existing details immediately
      const item = existingItem.documents[0];
      console.log('Item found in Appwrite database:', item);

      // show it in your UI right away
      setItemDetails(item);
      setModalVisible?.(true);

      return item; // ⬅️ EARLY RETURN: do not query BlueCart
    }

    // 2) Not in DB: start with a sensible default
    let item = {
      name: 'Item not found',
      upc: upc,           // make sure we keep the UPC
      price: 0.0,
      firstPhoto: '',
      photos: [],
      brand: '',
      isFood: false,
      aisle: '',
      pickup: false,
      delivery: false,
      ship: false,
      rating: null,
      totalRatings: null,
      shippingMessage: '',
      wasPrice: 0.0,
    };

    // 4) Query BlueCart for details (works even without zipcode)
    const params = {
      api_key: '5C1C4CCE48C64156B8EB1D50F3BE1077',
      type: 'product',
      gtin: upc,
    };

    const response = await axios.get('https://api.bluecartapi.com/request', { params });
    const product = response?.data?.product || {};
    const mapped = mapBluecartProduct(product);

    item = {
      name: mapped.name || 'Item not found',
      description: mapped.description || '',
      price: mapped.price ?? 0.0,
      photos: mapped.photos || [],
      brand: mapped.brand || '',
      isFood: !!mapped.isFood,
      aisle: mapped.aisle || '',
      upc: mapped.upc || upc,
      pickup: !!mapped.pickup,
      delivery: !!mapped.delivery,
      ship: !!mapped.ship,
      rating: mapped.rating ?? null,
      totalRatings: mapped.totalRatings ?? null,
      firstPhoto: mapped.firstPhoto || '',
      shippingMessage: mapped.shippingMessage || '',
      link: mapped.link || '',
    };

    // 5) Show it now
    setItemDetails(item);
    setModalVisible?.(true);

    // 7) Create in Appwrite (no pre-check here since we already know it was missing)
    await saveScannedItem(item, databases);

    console.log('Processed Product Data:', item);
    return item;
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
};

  useEffect(() => {
  const manualUPC = route?.params?.manualUPC;
  if (manualUPC && manualUPC.trim()) {
    console.log('🔍 Manual UPC received:', manualUPC);
    setScanned(true);
    setItemDetails(null);
    setBarcodeValue(manualUPC);
    setModalVisible(true);

    fetchProductData(manualUPC)
      .then((item) => {
        setItemDetails(item);
      })
      .finally(() => {
        setTimeout(() => {
          setScanned(false);
          // clear manualUPC so it doesn't refetch on re-render
          navigation.setParams({
            ...route.params,
            manualUPC: null,
          });
        }, 2000);
      });
  }
}, [route?.params?.manualUPC]);


  // --- early returns ONLY AFTER all hooks ---
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionMessage}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const handleItemPress = (itemDetails) => {
    const selected = { ...itemDetails, link: itemDetails.link, };
    setSelectedItem(selected);
    toggleItemModal(selectedItem);
  };

  const handleBarcodeScanned = async ({ data }) => {
    try {
      setScanned(true);
      setItemDetails(null); // Clear previous item
      setBarcodeValue(data); // Update state (if needed elsewhere)
      setModalVisible(true);

      // Optional: pass your store ZIP if you want; otherwise the function will fetch ZIP via BlueCart
      const fetched = await fetchProductData(data);
      // fetchProductData returns item fallback even on error
      setItemDetails(fetched);
    } catch (error) {
      console.error('Error handling barcode scan:', error);
      ToastAndroid.show('Scan failed. Try again.', ToastAndroid.SHORT);
      setScanned(false);
    } finally {
      setTimeout(() => {
        setScanned(false);
      }, 3000);
    }
  };

  const handleEnableTorch = () => {
    setTorch((prev) => !prev);
    setPressed((prev) => !prev);
  };

  const handleModalClose = () => {
    toggleModal();
    setBarcodeValue('');
    setScanned(false); // allow scanning again
    setItemDetails(null);
    setActiveItem(null);
  };

  const handleSearchUPC = () => {
    try {
      navigation.navigate('ManualSearchScreen2', {
        scannedItems: scannedItems || [],
        items: items || [],
        randomName: randomName || '',
        randomFirstName: randomFirstName || '',
        selectedStoreDetails: selectedStoreDetails || {},
        time: time || ''
      });
    } catch (e) {
      console.error('Error navigating to manual search:', e);
    }
  };

const BLUECART_API_KEY = '5C1C4CCE48C64156B8EB1D50F3BE1077';

const addItem = (item) => {
  if (!item || !item.upc) return;
  setScannedItems((prev = []) => {
    const idx = prev.findIndex(i => i.upc === item.upc);
    if (idx !== -1) return prev;                 // already in cart → don’t bump to 2
    return [...prev, { ...item, quantity: 1 }];  // first add → qty 1
  });
};

const handleAddItem = (item) => {
  if (!item) return;
  setActiveItem(item.upc);
  addItem(item);
};

  const handleIncrementQuantity = (it) => {
    if (!it) return;
    setScannedItems(prev =>
       prev.map(x => x.upc === it.upc ? { ...x, quantity: (x.quantity || 1) + 1 } : x)
   );
 };


  const handleDecrementQuantity = (it) => {
   if (!it) return;
   setScannedItems(prev =>
     prev
       .map(x => {
         if (x.upc !== it.upc) return x;
         const q = (x.quantity || 1) - 1;
         return q > 0 ? { ...x, quantity: q } : null;
       })
       .filter(Boolean)
   );
 };

  // Helper for safe image source (avoid empty uri)
  const imageSourceFor = (uri) => {
    if (!uri || uri === '') {
      // fallback: local placeholder or null (do not pass { uri: '' })
      return require('../assets/images/NoImage.png'); // small placeholder you already used
    }
    return { uri };
  };

  const handleQuantityChange = (quantity) => {
    const parsedQuantity = Math.max(1, parseInt(quantity) || 1);
    setItemQuantity(parsedQuantity);
  };

 const handleItemQuantity = (it, delta = 0) => {
   if (!it) return;
   setScannedItems(prev =>
     prev.map(x =>
       x.upc === it.upc ? { ...x, quantity: Math.max(1, (x.quantity || 1) + delta) } : x
     )
   );
 };

 const getCurrentItemQuantity = (it) => {
   if (!it) return 1;
   const current = scannedItems.find(x => x.upc === it.upc);
   return current ? (current.quantity || 1) : 1;
 };

 const getScannedQty = (upc) =>
   (scannedItems.find(i => i.upc === upc)?.quantity) ?? 1;

 const injectedJS = `
  (function() {
    // Remove the <span> with data-testid="global-header"
    var globalHeader = document.querySelector('span[data-testid="global-header"]');
    if (globalHeader) {
      globalHeader.remove();
      console.log('✅ Global header removed');
    } else {
      console.log('⚠️ No global header found');
    }

    // Send confirmation back to React Native
    window.ReactNativeWebView.postMessage("✅ Elements removed!");
  })();
  true;
  window.addEventListener('scroll', function() { window.ReactNativeWebView.postMessage(window.scrollY.toString()); });
    (function() {
    var lastY = 0;
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      // Only post when it actually changes to avoid chatty messages
      if (Math.abs(y - lastY) > 2) {
        lastY = y;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'scroll', y: y }));
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    // send an initial value
    setTimeout(onScroll, 0);
  })();
  true;
`;

  return (
    <View style={{ flex: 1 }}>
      <View style={[commonStyles.header, { zIndex: 1, height: heightPercentageToDP(6) }]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'center',
            flex: 1
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '50%',
            }}
          >
            <Pressable
              onPress={()=>
                navigation.navigate('UpdaterMainPage', {
                  scannedItems,
                  items,
                  selectedStoreDetails:
                    selectedStoreDetails?.STORE
                      ? selectedStoreDetails
                      : storeDetails?.STORE
                      ? storeDetails
                      : {},
                  time,
                  randomFirstName,
                  randomName,
                })}
              hitSlop={scale(40)}>
              <BackIcon
                width={scale(18)}
                height={verticalScale(18)}
                style={{
                  position: 'absolute',
                  left: scale(5),
                  bottom: verticalScale(0),
                }}
              />
              <Text
                style={[
                  commonStyles.headerText,
                  { fontFamily: 'EverydaySansBold', fontSize: moderateScale(14), position: 'absolute', left: scale(30), bottom: verticalScale(1) },
                ]}
              >
                Scanner
              </Text>
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: '50%',
            }}
          >
            <TouchableOpacity
              onPress={handleEnableTorch}
              style={{ height: '25%', width: '20%' }}
              hitSlop={scale(45)}
            >
              {pressed ? (
                <FlashOn width={scale(18)} height={verticalScale(18)} style={{ right: scale(8) }} />
              ) : (
                <FlashOff
                  width={scale(18)}
                  height={verticalScale(18)}
                  style={{ right: scale(10) }}
                />
              )}
            </TouchableOpacity>
            <Help width={scale(16)} height={verticalScale(16)} style={{ right: scale(5) }} />
          </View>
        </View>
      </View>

      {/* “Type barcode” pill */}
      <Pressable
        onPress={handleSearchUPC}
        hitSlop={scale(30)}
        style={{
          backgroundColor: '#fff',
          zIndex: 1,
          borderRadius: scale(16.6),
          alignItems: 'center',
          justifyContent: 'center',
          height: verticalScale(22),
          width: '34%',
          borderColor: '#000000b7',
          borderWidth: scale(1),
          position: 'absolute',
          left: '33%',
          right: '33%',
          top: '8%',
        }}
      >
        <Text style={[commonStyles.titleText, { fontSize: moderateScale(9.5) }]}>Type your barcode</Text>
      </Pressable>

      {/* Camera */}
      <View style={{ flex: 1 }}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          barcodeScannerSettings={{
            barcodeTypes: ['upc_a', 'upc_e', 'ean13'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          enableTorch={torch}
        >
        </CameraView>
      </View>

      {/* Footer promo */}
      <View
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: heightPercentageToDP(7), backgroundColor: '#fff' }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            borderBottomWidth: verticalScale(0.5),
            borderColor: '#ececec',
            width: '100%',
            height: '60%',
            backgroundColor: '#fff',
            padding: scale(5),
          }}
        >
          <View style={{ width: '10%', alignItems: 'center'}}>
            <ScannerIcon2 width={scale(15)} height={verticalScale(15)} />
          </View>
          <View style={{ width: '90%' }}>
            <Text
              style={[
                commonStyles.titleText,
                { fontSize: scale(9), textAlignVertical: 'center', textAlign: 'left'}
              ]}
            >
              Scan barcodes, QR codes, receipts and more
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: '40%', columnGap: scale(5), backgroundColor: '#fff' }}>
          <Text style={[commonStyles.text, { fontSize: scale(8), textAlignVertical: 'center' }]}>
            We&apos;d love to hear what you think!
          </Text>
          <Text
            style={[
              commonStyles.text,
              { fontSize: scale(8), textAlignVertical: 'center', textDecorationLine: 'underline' },
            ]}
          >
            Give feedback
          </Text>
        </View>
      </View>

      {/* Result modal */}
      <Modal
        isVisible={isModalVisible}
        backdropColor='black'
        backdropOpacity={0}
        hasBackdrop={true}
          animationType='slide'
        onBackdropPress={handleModalClose}
      >
        {itemDetails ? (
          <View style={[commonStyles.modal, {position: 'absolute', height: verticalScale(180), bottom: verticalScale(45), left: scale(-10), right: scale(-10), borderRadius: scale(10), backgroundColor: '#fff', padding: scale(10)}]}>
            <View style={{height: verticalScale(140), borderBottomColor: '#f0f0f0', borderBottomWidth: scale(0.5), flexDirection: 'column'}}>
              <View style={{height: verticalScale(15), position: 'absolute', right: scale(10), top: verticalScale(5)}}>
                <Pressable onPress={handleModalClose} style={[styles.closeButton, { }]}>
                  <Text style={[styles.closeButtonText, { textDecorationLine: 'underline' }]}>Dismiss</Text>
                </Pressable>
              </View>
              <View
                style={{
                  position: 'absolute',
                  top: verticalScale(18),
                  left: scale(10),
                  backgroundColor: '#fffff',
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: '70%',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap', 
                    justifyContent: 'flex-start',
                    marginBottom: verticalScale(0),
                    rowGap: verticalScale(3)
                  }}
                >
                  <View style={{flex: 1, alignItems: 'center', padding: scale(3), justifyContent: 'center', height: 'auto', backgroundColor: '#d0d0d0'}}>
                    <Text numberOfLines={3} style={styles.productName}>{itemDetails.name}</Text>
                  </View>
                  <StarRating rating={itemDetails?.rating} totalRatings={itemDetails?.totalRatings} />
                </View>
                <View style={{ height: '100%', width: '30%', alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={imageSourceFor(itemDetails.firstPhoto)} style={styles.productImage} />
                </View>
              </View>

              <View
                style={{
                  height: '50%',
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: verticalScale(20),
                }}
              >
                <View
                  style={{
                    rowGap: verticalScale(7),
                    marginTop: verticalScale(60),
                    paddingLeft: scale(10),
                    height: '55%',
                    width: '50%',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-around',
                    top: verticalScale(8),
                  }}
                >
                  <Text style={styles.productPrice}>${itemDetails.price}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      columnGap: scale(2),
                    }}
                  >
                    <Text style={{ fontSize: scale(7), fontFamily: 'EverydaySansRegular', textAlign: 'center' }}>
                      Price when purchased online
                    </Text>
                    <Info width={scale(8)} height={scale(12)} />
                  </View>
                  <Text style={[styles.shopButtonText, { textDecorationLine: 'underline' }]}>Shop similar</Text>
                </View>
                <View style={{ width: '50%', height: '100%', alignItems: 'flex-end', justifyContent: 'flex-end', marginTop: verticalScale(75) }}>
                  {activeItem === itemDetails.upc ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: scale(7) }}>
                      <Pressable
                        onPress={() => handleDecrementQuantity(itemDetails, -1)}
                        style={[commonStyles.button, { width: scale(40), height: scale(25) }]}
                        hitSlop={8}
                        android_ripple={{ color: 'white' }}
                      >
                        <Text style={[commonStyles.buttonText, { fontSize: scale(18) }]}>-</Text>
                      </Pressable>
                      <TextInput
                        key={itemDetails.upc}
                        style={[commonStyles.textInput2, { height: verticalScale(25), width: scale(50) }]}
                        placeholder={String(itemDetails.quantity)} // Show the current quantity or 1 as default
                        value={String(getScannedQty(itemDetails.upc))}
                        keyboardType="numeric"
                        onChangeText={(t) => {
                          const next = Math.max(1, parseInt(t) || 1);
                          setScannedItems(prev =>
                            prev.map(i =>
                              i.upc === itemDetails.upc ? { ...i, quantity: next } : i
                            )
                          )
                        }}
                        onSubmitEditing={() => handleItemQuantity(itemDetails.upc, itemQuantity - itemDetails.quantity)}
                      />
                      <Pressable
                        onPress={() => handleIncrementQuantity(itemDetails, 1)}
                        style={[commonStyles.button, { width: scale(40), height: scale(25) }]}
                        hitSlop={8}
                        android_ripple={{ color: 'white' }}
                      >
                        <Text style={[commonStyles.buttonText, { fontSize: scale(15) }]}>+</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable onPress={() => handleAddItem(itemDetails)} style={[commonStyles.button, { width: '100%', height: verticalScale(25) }]}>
                      <Text style={commonStyles.buttonText}>Add to cart</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
            <Pressable onPress={() => handleItemPress(itemDetails)} hitSlop={scale(20)} style={{height: verticalScale(20), width: '100%', marginTop: verticalScale(3), flexDirection: 'row', padding: scale(5), alignItems: 'center', justifyContent: 'space-between'}}>
              <Text style={[commonStyles.text, {textAlign: 'left', fontSize: scale(9),textVerticalAlign: 'center'}]}>Product Details</Text>
              <ExpandIcon4 width={scale(12)} height={scale(12)} style={{top: verticalScale(3)}}/>
            </Pressable>
          </View>
        ) : (
          <View style={{position: 'absolute', height: verticalScale(100), alignItems: 'center', justifyContent: 'center', bottom: verticalScale(45), left: scale(-10), right: scale(-10), borderRadius: scale(10), backgroundColor: '#fff', padding: scale(10)}}>
            <Image source={require('../assets/splash.gif')} style={{ width: scale(60), height: verticalScale(60) }} />
          </View>
        )}
      </Modal>
      <Modal
        isVisible={itemModalVisible}
        backdropColor='black'
        backdropOpacity={0.3}
        hasBackdrop={true}
        transparent={true}
        onBackdropPress={toggleItemModal}
        style={{position: 'absolute', left: scale(0), right: scale(0), bottom: scale(0), top: verticalScale(56), height: height - verticalScale(56)}}
      >
        <View style={{position: 'absolute', top: verticalScale(-30), flexDirection: 'row', borderTopStartRadius: scale(12), borderTopEndRadius: scale(12), left: scale(-18), right: scale(-18), height: verticalScale(30), backgroundColor: '#fff', alignitems: 'flex-end', justifyContent: 'center'}}>
          <Pressable onPress={toggleItemModal} hitSlop={scale(20)} style={{width: '100%', height: '100%'}}>
            <ExitIcon2 width={scale(20)} height={verticalScale(20)} style={{position: 'absolute', top: verticalScale(10), right: scale(15)}}/>
          </Pressable>
        </View>
        <WebView
          showsVerticalScrollIndicator={false}
          ref={webViewRef}
          scalesPageToFit={true}
          containerStyle={{position: 'absolute', left: scale(-18), right: scale(-18), bottom: scale(0), top: verticalScale(0), zIndex: -1, borderTopStartRadius: scale(12), borderTopEndRadius: scale(12), transform: [{ translateY: verticalScale(-30) }]}}
          source={{ uri: selectedItem?.link || 'https://www.walmart.com/'}}
          injectedJavaScript={injectedJS}
          javaScriptEnabled={true}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  camera: { flex: 1 },
  closeButton: {
    alignItems: 'flex-end',
    width: '100%',
    zIndex: 1,
  },
  closeButtonText: { fontFamily: 'EverydaySansRegular', fontSize: scale(8.5) },
  permissionContainer: { flex: 1, justifyContent: 'center' },
  permissionMessage: { paddingBottom: verticalScale(10), textAlign: 'center' },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: scale(10),
    position: 'absolute',
    left: scale(-10),
    right: scale(-10),
    bottom: verticalScale(45),
    height: verticalScale(190),
    padding: scale(5),
  },
  overlayCenter: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  productImage: { height: scale(65), width: scale(65), top: verticalScale(5) },
  productName: { flex: 1, flexWrap: 'wrap', fontFamily: 'EverydaySansBold', fontSize: scale(9) },
  productPrice: { fontFamily: 'EverydaySansBold', fontSize: scale(11), left: scale(0) },
  shopButtonText: { fontFamily: 'EverydaySansRegular', fontSize: scale(8.5), top: verticalScale(8) },
});
