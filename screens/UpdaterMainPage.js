
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  BackHandler,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import Animated, { 
  Easing,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { CameraView } from 'expo-camera';
import { useKeepAwake } from "expo-keep-awake";
import { Barcode } from 'react-native-barcode-rnsvg';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { URLSearchParams } from 'react-native-url-polyfill';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useCameraPermissions } from 'expo-camera';
import { Query, ID, Permission, Role } from 'react-native-appwrite';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { commonStyles } from '../lib/styles';
import SerialModal from '../components/SerialModal';
import { databases, storage, account }  from '../lib/appwrite';
import Spark from '../assets/icons/Spark.svg';
import BackIcon from '../assets/icons/BackIcon.svg';
import { createRandomMaleLastName } from '../lib/createRandomName.js';
import { toast } from '../lib/toast';
import Export from '../assets/icons/Export.svg';
import ScannerIcon2 from '../assets/icons/ScannerIcon2.svg';
import WalmartLogo from '../assets/icons/WalmartLogo.svg';
import { saveRecentOrder } from '../lib/recentOrder';


export default function UpdaterMainPage({ navigation, route }) {
  useKeepAwake();
  const receiptRef = useRef(null);
    const logoWidth = scale(width);
    const logoHeight = verticalScale(height) * 0.15;

const {
  scannedItems: incomingScannedItems = [],
  items: incomingSummaryItems = [],
  time: incomingTime = '',
  selectedStoreDetails: incomingStoreDetails = {},
  storeLocation = '',
  store = '',
  storeCity = '',
  storeState = '',
  storeZip = '',
  op = '',
  te = '',
  storePhone = '',
  storeManager = '',
  randomFirstName = '',
} = route?.params || {};

  const [receiptReady, setReceiptReady] = useState(false);
  const [time, setTime] = useState('');
  const [items, setItems] = useState([]);
  const [manualItem, setManualItem] = useState({
    name: '',
    upc: '',
    price: '',
    photos: '',
    isFood: false,
    description: '',
    rating: '',
    totalRatings: '',
    aisle: '',
    brand: '',
    pickup: false,
    pickupMessage: '',
    delivery: false,
    deliveryMessage: '',
    ship: false,
    requiresSerial: false,
    serialNumber: '',
  });
  const [scannedUPC, setScannedUPC] = useState('');
  const [storeNumber, setStoreNumber] = useState('');
  const [addStoreNumber, setAddStoreNumber] = useState('');
  const [addStoreLocation, setAddStoreLocation] = useState('');
  const [addStoreCity, setAddStoreCity] = useState('');
  const [addStoreState, setAddStoreState] = useState('');
  const [addStoreZip, setAddStoreZip] = useState('');
  const [addStorePhone, setAddStorePhone] = useState('');
  const [addStoreOP, setAddStoreOP] = useState('');
  const [addStoreTE, setAddStoreTE] = useState('');
  const [addStoreTR, setAddStoreTR] = useState('');
  const [selectedStoreDetails, setSelectedStoreDetails] = useState({});
  const [manualPrice, setManualPrice] = useState('');
  const [storeOptions, setStoreOptions] = useState([]);
  const [totalSubtotal, setTotalSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);  
  const [taxRate, setTaxRate] = useState(0.0875);
  const [randomName, setRandomName] = useState('');
  const [opNumber, setOpNumber] = useState('');
  const [teNumber, setTeNumber] = useState('');
  const [updatedStoreManager, setUpdatedStoreManager] = useState('');
  const [updatedDetails, setUpdatedDetails] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const { height, width } = useWindowDimensions();
  const [userId, setUserId] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModal2Visible, setModal2Visible] = useState(false);
  const [isModal3Visible, setModal3Visible] = useState(false);
  const [isSerialScanVisible, setSerialScanVisible] = useState(false);
  const [isTerminalModalVisible, setTerminalModalVisible] = useState(false);
  const [isAddItemModalVisible, setAddItemModalVisible] = useState(false);
  const [isScannerModalVisible, setScannerModalVisible] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);

  const toggleModal = () => setModalVisible(!isModalVisible);
  const toggleModal2 = () => setModal2Visible(!isModal2Visible);
  const toggleModal3 = () => setModal3Visible(!isModal3Visible);
  const toggleSerialModal = () => setSerialScanVisible(!isSerialScanVisible);
  const toggleTerminalModal = () => setTerminalModalVisible(!isTerminalModalVisible);
  const toggleAddItemModal = () => setAddItemModalVisible(!isAddItemModalVisible);
  const toggleScannerModal = () => {setScannerModalVisible(!isScannerModalVisible)};

  // ✅ Reanimated hooks MUST be declared unconditionally (before any early return)
  const lastContentOffset = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  const translateY = useSharedValue(0);

  const actionBar = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(translateY.value, {
          duration: 750,
          easing: Easing.inOut(Easing.ease),
        }),
      },
    ],
  }));

useEffect(() => {
  if (incomingSummaryItems && incomingSummaryItems.length > 0) {
    setItems(prev => mergeByUPC(prev, incomingSummaryItems));
  }

  if (incomingTime) {
    setTime(incomingTime);
  }

  // ✅ DO NOT call navigation.setParams here.
}, [
  incomingSummaryItems,
  incomingTime,
]);

useEffect(() => {
  const storeData = incomingStoreDetails || {};
  if (Object.keys(storeData).length > 0) {
    setSelectedStoreDetails(storeData);
    setStoreNumber(storeData.STORE ?? '');
  } else {
    setSelectedStoreDetails({
      STORE: storeNumber || '',
      ADDRESS: storeLocation || '',
      CITY: storeCity || '',
      STATE: storeState || '',
      ZIP: storeZip || '',
      MANAGER: storeManager || '',
    });
  }
}, [incomingStoreDetails, storeNumber, storeLocation, storeCity, storeState, storeZip, storeManager]);



useEffect(() => {
  if (!Array.isArray(incomingScannedItems) || incomingScannedItems.length === 0) return;

  setItems((prev) => mergeByUPC(prev, incomingScannedItems));

  // ✅ Preserve all params
  navigation.setParams({
    ...route.params,
    scannedItems: [],
  });
}, [incomingScannedItems, navigation]);

  const fetchTaxRate = async (selectedStoreDetails) => {
  const DEFAULT_RATE = 0.0875;

  if (!selectedStoreDetails) return DEFAULT_RATE;

  const ADDRESS = encodeURIComponent(selectedStoreDetails.ADDRESS.replace(/\s/g, '+'));
  const CITY = encodeURIComponent(selectedStoreDetails.CITY.replace(/\s/g, '+'));
  const ZIP = selectedStoreDetails.ZIP;

  try {
    // Let axios encode params correctly (no manual replace/encode needed)
    const { data } = await axios.get(
      'https://services.maps.cdtfa.ca.gov/api/taxrate/GetRateByAddress',
      {
        params: { address: ADDRESS, city: CITY, zip: ZIP },
        timeout: 8000,
      }
    );

    const raw = data?.taxRateInfo?.[0]?.rate;

    // Normalize to decimal fraction
    if (typeof raw === 'number') {
      return raw > 1 ? raw / 100 : raw;
    }
    if (typeof raw === 'string') {
      const n = parseFloat(raw);
      if (Number.isFinite(n)) return n > 1 ? n / 100 : n;
    }

    return DEFAULT_RATE;
  } catch (error) {
    console.error('Error fetching tax rate:', error?.message || error);
    return DEFAULT_RATE;
  }
};

  const getAndSetTaxRate = async () => {
  const fetchedTaxRate = await fetchTaxRate(selectedStoreDetails);
  setTaxRate(fetchedTaxRate);
};

// Then call it inside a useEffect or wherever you're triggering it:
useEffect(() => {
  if (selectedStoreDetails) {
    getAndSetTaxRate(selectedStoreDetails);
  }
}, [selectedStoreDetails]);

// ✅ Recalculate totals whenever `items` changes
useEffect(() => {
  if (!items || items.length === 0) {
    setTotalSubtotal(0);
    setTaxAmount(0);
    setTotal(0);
    return;
  }

  // ✅ Compute subtotal (sum of price * quantity)
  const subtotal = items.reduce((acc, item) => {
    const price = Number(item?.price) || 0;
    const quantity = Number(item?.quantity) || 1;
    return acc + price * quantity;
  }, 0);

  // ✅ Pull your tax rate from state or fallback (example: 8.75%)
  const taxRateValue = Number(taxRate) || 0.0875;

  // ✅ Calculate amounts
  const calculatedTax = subtotal * taxRateValue;
  const grandTotal = subtotal + calculatedTax;

  // ✅ Update state
  setTotalSubtotal(subtotal);
  setTaxAmount(calculatedTax);
  setTotal(grandTotal);

}, [items, taxRate]); // ← triggers whenever items or taxRate change


const generateRandomCode = () => {
  const prefix = 'GCTT';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -.$/+%';
  let result = '';

  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return prefix + result;
};

const mergeByUPC = (current = [], incoming = []) => {
  const map = new Map();
  for (const it of current) if (it?.upc) map.set(it.upc, { ...it, quantity: it.quantity ?? 1 });
  for (const it of incoming) {
    if (!it?.upc) continue;
    const qty = it.quantity ?? 1;
    if (map.has(it.upc)) {
      const prev = map.get(it.upc);
      map.set(it.upc, {
        ...prev,
        name: it.name ?? prev.name,
        price: typeof it.price === 'number' ? it.price : prev.price,
        firstPhoto: it.firstPhoto ?? prev.firstPhoto,
        quantity: (prev.quantity ?? 1) + qty,
      });
    } else {
      map.set(it.upc, { ...it, quantity: qty });
    }
  }
  return Array.from(map.values());
};

    useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await SecureStore.getItemAsync('userId');
        if (id) setUserId(id);
      } catch (error) {
        console.error('Error retrieving UserId:', error);
      }
    };
    fetchUserId();
  }, []);

useEffect(() => {
  if (isTerminalModalVisible) {
    setOpNumber(selectedStoreDetails.OP);
    setTeNumber(selectedStoreDetails.TE);
    setUpdatedStoreManager(selectedStoreDetails.MANAGER);
  }
}, [isTerminalModalVisible]);

  const handleAddItem = () => {
  if (!manualItem.name || !manualItem.upc || !manualItem.price) {
    alert('Please fill out all required fields (name, UPC, price).');
    return;
  }

  // Parse and clean photo URLs (if it's a comma-separated string)
  let parsedPhotos = [];
  if (typeof manualItem.photos === 'string') {
    parsedPhotos = manualItem.photos
      .split(',')
      .map((photo) => photo.trim())
      .filter(Boolean);
  } else if (Array.isArray(manualItem.photos)) {
    parsedPhotos = manualItem.photos;
  }

  // Construct the new item
  const newItem = {
    ...manualItem,
    quantity: 1,
    photos: parsedPhotos,
    firstPhoto: parsedPhotos.length > 0
      ? parsedPhotos[0]
      : 'https://i5.walmartimages.com/asr/24893ec1-4563-41fa-9efb-42ba1d0d5e98.f417a4c35f49d4ecd5c479905aa827b3.jpeg',
    price: parseFloat(manualItem.price),
    rating: parseFloat(manualItem.rating) || 0.0,
    totalRatings: parseInt(manualItem.totalRatings) || 0,
  };

  // Add the item to your items list (you might want to update this part)
  setItems((prev) => [...prev, newItem]);

  // Reset the manualItem form
  setManualItem({
    name: '',
    upc: '',
    price: '',
    photos: '',
    isFood: false,
    description: '',
    rating: '',
    totalRatings: '',
    aisle: '',
    brand: '',
    pickup: false,
    pickupMessage: '',
    delivery: false,
    deliveryMessage: '',
    ship: false,
    requiresSerial: false,
    serialNumber: '',
  });

  toggleAddItemModal();
};

const handlePhotoInput = (text) => {
  const photos = text.split(',').map((photo) => photo.trim()); // Split by commas and trim spaces
  const firstPhoto = photos.length > 0 ? photos[0] : ''; // Get the first photo, if available
    setManualItem((prev) => ({
      ...prev,
      photos,
      firstPhoto, // Set the first photo
    }));
  };


  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (lastContentOffset.value > event.contentOffset.y && isScrolling.value) {
        translateY.value = 0; // scrolling up
      } else if (lastContentOffset.value < event.contentOffset.y && isScrolling.value) {
        translateY.value = 100; // scrolling down
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

  // ✅ Back button handling: subscribe on focus, cleanup on blur
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // prevent default back behavior on this screen
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [])
  );

const toggleRequiresSerial = (upc) => {
  setItems(prev =>
    prev.map(i =>
      i.upc === upc ? { ...i, requiresSerial: !i.requiresSerial } : i
    )
  );
};
const handleInputChange = (field, value) => { setManualItem((prev) => ({ ...prev, [field]: value, })); };

const handleSerialScanned = ({ data }) => {
  setScannedUPC(data);  // Save scanned UPC
  handleInputChange('serial', data); // Populate text input
  setScannerModalVisible(false); // Close scanner modal
};


  const addItemAgain = (upc) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.upc === upc ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const removeItem = (upc) => {
    setItems((prevItems) =>
      prevItems
        .filter((item) => (item.upc === upc ? item.quantity > 1 : true))
        .map((item) => (item.upc === upc ? { ...item, quantity: item.quantity - 1 } : item))
    );
  };
 
  const generateFormatted20DigitNumber = () => { // Generate a 20-digit number as a string
    const randomNumber = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join(''); // Format the number into groups of 4 separated by spaces
    const formattedNumber = randomNumber.match(/.{1,4}/g).join(' ');
    return formattedNumber;
  };

  const formattedNumber = generateFormatted20DigitNumber();

const uploadSnapshot = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    const blob = Buffer.from(base64, 'base64');

    await storage.createFile('receipts', ID.unique(), blob);
  } catch (err) {
    console.error('❌ Upload error:', err);
  }
};

// 🧩 Helper: Capture and upload the receipt snapshot to Appwrite
const captureAndUploadReceipt = async ({ receiptRef, formattedNumber, barcode, receiptReady }) => {
  if (!receiptReady) {
    console.warn('⏳ Receipt not ready yet, waiting...');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Retry a few times just in case
  let attempts = 0;
  while (!receiptRef?.current && attempts < 5) {
    await new Promise(resolve => setTimeout(resolve, 300));
    attempts++;
  }

  if (!receiptRef?.current) {
    console.error('⚠️ Could not find receiptRef for capture.');
    return null;
  }
  try {
    // 🔑 Generate JWT for secure upload
    const jwtResponse = await account.createJWT();
    const jwt = jwtResponse.jwt;

    // 📸 Capture snapshot of receipt
    await new Promise(resolve => setTimeout(resolve, 200)); // small delay for layout
    if (!receiptRef?.current) {
      console.warn('⚠️ receiptRef is not ready for capture.');
      return null;
    }

    const snapshotUri = await captureRef(receiptRef.current, {
      format: 'jpg',
      quality: 0.9,
    });

    // 🧱 Prepare FormData for Appwrite upload
    const safeFileId = formattedNumber
      ? formattedNumber.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 36)
      : barcode.slice(0, 36);

    const formData = new FormData();
    formData.append('fileId', safeFileId);
    formData.append('file', {
      uri: snapshotUri,
      name: `receipt-${barcode}.jpg`,
      type: 'image/jpeg',
    });
    formData.append('permissions[]', 'read("any")');

    // 📨 Upload to Appwrite Storage
    const response = await fetch(
      'https://cloud.appwrite.io/v1/storage/buckets/receipts/files',
      {
        method: 'POST',
        headers: {
          'X-Appwrite-Project': '67230a63003cde400378',
          'X-Appwrite-JWT': jwt,
          'X-Appwrite-Response-Format': '1.8.0',
        },
        body: formData,
      }
    );

    // 🔍 Handle upload response
    const debugText = await response.clone().text();

    let result;
    try {
      result = JSON.parse(debugText);
    } catch {
      result = { message: debugText };
    }

    if (!response.ok) {
      console.error('❌ Upload failed:', result);
      throw new Error(result.message || 'Upload failed');
    }

    return result; // return result for next steps
  } catch (error) {
    console.error('❌ Error in captureAndUploadReceipt:', error);
    throw error;
  }
};


const handleSaveOrder = async (items, formattedNumber, taxRate, userId) => {
  try {
  const documentDate = formattedDate?.replace(/\//g, '-') || 'unknown-date';
  const documentTimeStr = time?.replace(/:/g, '.').replace(/ /g, '') || 'unknown-time';
  const documentId = `${documentDate}_${documentTimeStr}`;
  const collectionId = userId;
  const militaryTime = convertToMilitaryTime(time);
  const newBarcode = generateRandomCode();
  setBarcode(newBarcode);
  // 💰 Calculate totals
  const { taxableSubtotal, nonTaxableSubtotal } = items.reduce( (acc, item) => {
    if (item.isFood) { acc.nonTaxableSubtotal += item.price * item.quantity;

    } else {
      acc.taxableSubtotal += item.price * item.quantity;
    }
    return acc;
  },
  { taxableSubtotal: 0, nonTaxableSubtotal: 0 }
);
const taxAmount = +(taxableSubtotal * taxRate).toFixed(2);
const totalSubtotal = +(taxableSubtotal + nonTaxableSubtotal).toFixed(2);
const total = +(totalSubtotal + taxAmount).toFixed(2);
const stringifiedItems = items.map((item) => JSON.stringify(item));
// 🗂️ Build order data for Appwrite
const orderData = {
  DateFormatted: formattedDate,
  TimeFormatted: time,
  NumericDate: numericDate,
  StoreNumber: selectedStoreDetails?.STORE,
  StoreAddress: selectedStoreDetails?.ADDRESS,
  StoreCity: selectedStoreDetails?.CITY,
  StoreZip: selectedStoreDetails?.ZIP, 
  Manager: updatedDetails?.MANAGER || selectedStoreDetails?.MANAGER,
  PhoneNumber: selectedStoreDetails?.PHONE,
  OP: updatedDetails?.OP || selectedStoreDetails?.OP,
  TE: updatedDetails?.TE || selectedStoreDetails?.TE,
  TC: formattedNumber,
  Items: stringifiedItems,
  TaxRate: taxRate,
  TaxAmount: taxAmount,
  Subtotal: totalSubtotal,
  Total: total,
  Barcode: newBarcode,
}; // 💾 Save to Appwrite
    await saveOrder({
      userId,
      orderData,
      dateLong,
      formattedDateWithMonthShort,
      items,
      taxAmount,
      totalSubtotal,
      total,
      collectionId,
      documentId,
      militaryTime,
    });

    const result = await captureAndUploadReceipt({ receiptRef, formattedNumber, barcode });
    if (!result) return;

    const publicUrl = `https://cloud.appwrite.io/v1/storage/buckets/receipts/files/${result.$id}/view?project=67230a63003cde400378`;
    await sendVonageSMS(time, userId, selectedStoreDetails, total, publicUrl);


    // 🧩 Close modal before navigating
    setModal3Visible(false);

    // ✅ Navigate AFTER the modal closes
    navigation.navigate('SummaryScreen2', {
      items,
      total,
      totalSubtotal,
      taxAmount,
      dayOfWeek,
      formattedDate,
      formattedNumber,
      time,
      taxRate,
      dashedNumber,
      selectedStoreDetails,
      storePhone: selectedStoreDetails.PHONE,
      storeNumber: selectedStoreDetails.STORE,
      storeLocation: selectedStoreDetails.ADDRESS,
      storeCity: selectedStoreDetails.CITY,
      storeState: selectedStoreDetails.STATE,
      storeZip: selectedStoreDetails.ZIP,
      storeManager: updatedDetails?.MANAGER || selectedStoreDetails.MANAGER,
      op: updatedDetails?.OP || selectedStoreDetails.OP,
      te: updatedDetails?.TE || selectedStoreDetails.TE,
      tr: selectedStoreDetails.TR,
      militaryTime,
      numericDate,
      dateLong,
      formattedDateWithMonthShort,
      store: selectedStoreDetails.STORE,
      barcode,
      randomName,
      randomFirstName,
      manualPrice: manualPrice || '',
      tc: formattedNumber,
    });
  } catch (error) {
    console.error('❌ Error in handleSaveOrder:', error);
    toast("Failed to save order.");
  }
};

async function createExitPassAndSchedule({ userId, storeId, payload }) {
  const fiveMinFromNowISO = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await databases.createDocument(
    'exits',
    'exit_passes',
    ID.unique(),
    {
      userId,
      storeId,
      payload,
      status: 'pending',
      notifyAt: fiveMinFromNowISO,
      attempts: 0,
    },
    [
      Permission.read(Role.user(userId)),
      Permission.write(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]
  );
}


const saveOrder = async ({
  userId,
  orderData,
  items,
  collectionId,
  documentId,
}) => {
      try {
        const response = await databases.updateDocument(
          'orders2',
          collectionId,
          documentId,
          orderData,
          [
            Permission.read(Role.user(userId)),
            Permission.write(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ]
        );
const newDocId = `${documentId}-updated`;

const masterResponse = await databases.createDocument(
  'master_orders',
  collectionId,
  newDocId,
  orderData,
  [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ]
);


        console.log("Order saved successfully:", response);
        await saveRecentOrder(documentId);


        toast("Order saved successfully.");
          await createExitPassAndSchedule({
            userId,
            storeId: selectedStoreDetails?.STORE,
            payload: JSON.stringify({ selectedStoreDetails, items }),
            notifyAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            attempts: 0
          });



      } catch (createError) {
        console.error("Error creating order:", createError);
        toast("Failed to save order.");
      }
    };

const sendVonageSMS = async (time, userId, selectedStoreDetails, total, publicUrl) => {
  const message = `A new receipt was created by ${userId}.
Location: ${selectedStoreDetails.STORE} - ${selectedStoreDetails.ADDRESS}, ${selectedStoreDetails.CITY}, ${selectedStoreDetails.STATE} ${selectedStoreDetails.ZIP}
Time: ${time}
Total: $${total}
${publicUrl ? `\nView Receipt: ${publicUrl}` : ''}`;

  const params = new URLSearchParams({
    api_key: "ed18cebd",
    api_secret: "yZPqAxIfHfoOz9qV",
    to: "+19093581060",
    from: "+18045852325",
    text: message,
  });

  try {
    const resp = await axios.post("https://rest.nexmo.com/sms/json", params);
    console.log("✅ SMS sent:", resp.data);
  } catch (err) {
    console.error("❌ Error sending SMS:", err.response?.data || err.message);
  }
};

const handleSubmit = async () => {
  console.log("handleSubmit triggered");
  try {
    toggleModal3();
  } catch (error) {
      console.error("Error submitting order:", error);
      Alert.alert("Error submitting order", "An error occurred while submitting the order. Please try again.");
    }
  };

  const handleManualPriceChange = (price) => {
    setManualPrice(price);
  };

const handleManualPrice = (itemUpc) => {
  setItems(prevItems =>
    prevItems.map(item =>
      item.upc === itemUpc
        ? { ...item, price: parseFloat(manualPrice) || item.price }
        : item
    )
  );
  setManualPrice('');
};

  // ✅ fix self-referential init
  const [itemQuantity, setItemQuantity] = useState(1);

const handleQuantityChange = (quantity, upc) => {
  const parsed = Math.max(1, parseInt(quantity) || 1);
  setItems(prev =>
    prev.map(it => it.upc === upc ? { ...it, quantity: parsed } : it)
  );
};


  const handleItemQuantity = (upc, delta = 0) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.upc === upc ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  useEffect(() => {
  const newCode = generateRandomCode();
  setBarcode(newCode);
  console.log('🎯 Generated barcode:', newCode);
}, []); 

  // ✅ Correct Appwrite call signature + reuse function in multiple places
  const fetchStoreOptions = useCallback(async () => {
    try {
      const result = await databases.listDocuments(
        'locations2', // databaseId
        'locations', // collectionId
        [Query.limit(150)]
      );

      const options = result.documents.map((doc) => ({
        label: `${doc.CITY} --  ${doc.ADDRESS}`,
        value: doc.STORE,
        details: {
          STORE: doc.STORE,
          ADDRESS: doc.ADDRESS,
          CITY: doc.CITY,
          STATE: doc.STATE,
          ZIP: doc.ZIP,
          PHONE: doc.PHONE,
          MANAGER: doc.MANAGER,
          OP: doc.OP,
          TE: doc.TE,
          TR: doc.TR,
        },
      }));

      const sorted = options.sort((a, b) => a.label.localeCompare(b.label));
      setStoreOptions(sorted);
    } catch (error) {
      console.error('Error fetching store options:', error);
    }
  }, []);

  useEffect(() => {
    fetchStoreOptions();
  }, [fetchStoreOptions]);

const handleStoreChange = async (value) => {// Set the store number based on the selected value
  setStoreNumber(value);
  const selectedStore = storeOptions.find((store) => store.value === value);
    if (selectedStore && selectedStore.details) {
      setSelectedStoreDetails(selectedStore.details);
      openTerminalModal(selectedStore.details); // Check if the selected store has a ZIP value and handle API calls for zip code
    }
  };

const closeTerminalModal = (updatedDetails) => {
  setTerminalModalVisible(false);
  setUpdatedDetails(updatedDetails);
};

const openTerminalModal = async (selectedStoreDetails) => {
  try {
    const documentId = await fetchDocumentId(selectedStoreDetails);
    if (!documentId) {
      console.error('No document ID found. Cannot open terminal modal.');
      return;
    }
    setOpNumber(selectedStoreDetails.OP);
    setTeNumber(selectedStoreDetails.TE);
    setStoreManager(selectedStoreDetails.MANAGER);
    setTerminalModalVisible(true);
    setSelectedDocumentId(documentId);
  } catch (error) {
    console.error('Error opening terminal modal:', error);
  }
};

const convertToMilitaryTime = (time) => {
  if (!time) return '';

  // Split time and period (AM/PM)
  const [timePart, periodPartRaw] = time.trim().split(' ');
  const period = periodPartRaw?.toUpperCase?.() || '';

  // Split time into hours, minutes, seconds
  let [hours, minutes, seconds] = timePart.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time; // Fallback if parsing fails
  if (isNaN(seconds)) seconds = 0; // Default seconds to 0 if not present

  // Convert to 24-hour format
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  // Format back to HH:mm:ss
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
};


function getCurrentDate(daysOffset = 0, monthsOffset = 0) {
  const date = new Date();

  // Apply day and month offsets
  if (daysOffset) {
    date.setDate(date.getDate() + daysOffset);
  }

  if (monthsOffset) {
    date.setMonth(date.getMonth() + monthsOffset);
  }

  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
  const monthShort = date.toLocaleString('en-US', { month: 'short' });
  const monthLong = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
  const formattedDateWithMonthShort = `${monthShort} ${day}, ${year}`;
  const dateLong = `${monthLong} ${day}, ${year}`;
  const numericDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;

  return { dayOfWeek, formattedDate, formattedDateWithMonthShort, numericDate, dateLong };
}

// Example usage:
const { formattedDate, numericDate, dayOfWeek, dateLong, formattedDateWithMonthShort } = getCurrentDate();

console.log('Formatted Date: ', formattedDate); // e.g., 09/27/2025
console.log('Numeric Date: ', numericDate);     // e.g., 09/27/25
console.log('Day of the Week: ', dayOfWeek);    // e.g., Saturday
console.log('Long Date: ', dateLong);           // e.g., September 27, 2025
console.log('Formatted Date Short Month: ', formattedDateWithMonthShort); // e.g., Sep 27, 2025


const generateRandomMaleLastName = async () => {
  try {
    const name = createRandomMaleLastName(); // returns a string now
    setRandomName(name);

    // ✅ SecureStore wants a plain string
    await SecureStore.setItemAsync('randomName', name);

    console.log('Last name saved successfully', name);
  } catch (error) {
    console.error('Error saving last name:', error);
  }
};

useEffect(() => {
  const fetchRandomName = async () => {
    try {
      const fetchedRandomName = await SecureStore.getItemAsync('randomName');
      if (fetchedRandomName) {
        setRandomName(fetchedRandomName);
      }
    } catch (error) {
      console.error('Error retrieving name:', error);
    }
  };

  fetchRandomName();
}, []);

  const addLocationOnPress = async () => {

    try {
      const result = await databases.createDocument(
        'locations2',
        'locations',
        ID.unique(),
        {
          STORE: addStoreNumber,
          ADDRESS: addStoreLocation,
          CITY: addStoreCity,
          STATE: addStoreState,
          ZIP: addStoreZip,
          PHONE: addStorePhone,
          OP: addStoreOP,
          TE: addStoreTE,
          TR: addStoreTR,
        },
        [
          Permission.read(Role.any()),
          Permission.write(Role.any()),
          Permission.update(Role.any()),
        ]
      );

      // Many SDKs don't return HTTP status directly; if needed, assume success if no throw
      toggleModal2();
      Alert.alert('Success', 'Location added successfully');
      fetchStoreOptions();
    } catch (error) {
      console.error('Error adding location:', error);
      Alert.alert('Error', 'Error adding location. Please try again.');
    }
  };

  const fetchDocumentId = async (selectedStoreDetails) => {
    try {
      const fetchedResponse = await databases.listDocuments(
        'locations2',
        'locations',
        [Query.equal('STORE', selectedStoreDetails.STORE)]
      );
  
      if (fetchedResponse.documents.length > 0) {
        console.log('Found document:', fetchedResponse);
        return fetchedResponse.documents[0].$id; // Return first document ID
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching document ID:', error.message || error.response || error);
      return null; // Ensure function returns null on error
    }
  };
  
const handleSave = async (selectedStoreDetails) => {
  try {
    if (!selectedDocumentId) {
      console.error('No document ID found. Update aborted.');
      return;
    }

    await databases.updateDocument(
      'locations2',
      'locations',
      selectedDocumentId,
      { MANAGER: storeManager, OP: opNumber, TE: teNumber },
      [
        Permission.read(Role.any()),
        Permission.write(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    // ✅ update local state so UI shows the new values
    setSelectedStoreDetails(prev => ({
      ...prev,
      MANAGER: storeManager || prev.MANAGER,
      OP: opNumber || prev.OP,
      TE: teNumber || prev.TE,
    }));

    closeTerminalModal();
  } catch (error) {
    console.error('Error updating manager name:', error.message || error.response || error);
  }
};

const handleAlert = () => {
  Alert.alert(
  '', // The title of the alert
  'Are you sure you want to cancel this receipt?', // The message displayed in the alert
  [
    {
      text: 'Yes',
      onPress: () => {
        console.log('OK Pressed');
        navigation.navigate('ShopScreen', { randomFirstName, randomName });
      }
    },    {
      text: 'No', // Text displayed on the button
      onPress: () => console.log('Cancel Pressed'), // Callback function when the button is pressed
      style: 'cancel', // (iOS only) Specifies button style: 'default', 'cancel', or 'destructive'
    },

  ],
  {
    cancelable: true, // (Android only) If true, the alert can be dismissed by tapping outside or pressing back button
    onDismiss: () => console.log('Alert dismissed by tapping outside'), // (Android only) Callback when alert is dismissed without pressing a button
  }
)};

const formatItemName = (name = '') => {
  if (!name) return '';

  let shortName = name.trim().toUpperCase();

  // 🔤 Replace common retail terms with realistic abbreviations
  shortName = shortName
    .replace(/\bOUNCES?\b/g, 'OZ')
    .replace(/\bFLUID\b/g, 'FL')
    .replace(/\bPOUNDS?\b/g, 'LB')
    .replace(/\bPACK(S)?\b/g, 'PK')
    .replace(/\bCOUNT\b/g, 'CT')
    .replace(/\bBOTTLES?\b/g, 'BTL')
    .replace(/\bCANS?\b/g, 'CN')
    .replace(/\bGALLONS?\b/g, 'GAL')
    .replace(/\bLARGE\b/g, 'LRG')
    .replace(/\bMEDIUM\b/g, 'MED')
    .replace(/\bSMALL\b/g, 'SML')
    .replace(/\bFAMILY SIZE\b/g, 'FAM SZ')
    .replace(/\bVALUE SIZE\b/g, 'VAL SZ')
    .replace(/\bORIGINAL\b/g, 'ORG')
    .replace(/\bREGULAR\b/g, 'REG')
    .replace(/\bDIET\b/g, 'DT')
    .replace(/\bZERO SUGAR\b/g, 'ZERO')
    .replace(/\bEXTRA STRENGTH\b/g, 'XSTR')
    .replace(/\bDOUBLE\b/g, 'DBL')
    .replace(/\bTRIPLE\b/g, 'TPL')
    .replace(/\bBARBEQUE\b/g, 'BBQ')
    .replace(/\bCALORIES?\b/g, 'CAL')
    .replace(/\bCHOCOLATE\b/g, 'CHOC')
    .replace(/\bCHICKEN\b/g, 'CHKN')
    .replace(/\bWRAP\b/g, 'WRP')
    .replace(/\bBOTTLED\b/g, 'BTLD')
    .replace(/\bBRAISED\b/g, 'BRSD')
    .replace(/\bBROILED\b/g, 'BRLD')
    .replace(/\bBOILED\b/g, 'CKD')
    .replace(/\bAVERAGE\b/g, 'AVG')
    .replace(/\bCHARBROILED\b/g, 'CHAR')
    .replace(/\bEACH\b/g, 'EA')
    .replace(/\bFROM\b/g, 'F/')
    .replace(/\bINTERNATIONAL\b/g, 'INTL')
    .replace(/\bPIECES?\b/g, 'PC')
    .replace(/\bWITH\b/g, 'W/')

  // 🏷️ Optional brand-style abbreviations
  shortName = shortName
    .replace(/\bGREAT VALUE\b/g, 'GV')
    .replace(/\bMOUNTAIN DEW\b/g, 'MTN DEW')
    .replace(/\bCOCA-COLA\b/g, 'COKE')
    .replace(/\bPEPSI-COLA\b/g, 'PEPSI')
    .replace(/\bGENERAL MILLS\b/g, 'GEN MILLS')
    .replace(/\bKRAFT\b/g, 'KFT')
    .replace(/\bHEINZ\b/g, 'HNZ')
    .replace(/\bCAMPBELL'?S?\b/g, 'CAMPBELL');

  // 🧠 Remove duplicate spaces
  shortName = shortName.replace(/\s{2,}/g, ' ').trim();

  // 🪓 Limit to realistic receipt width (~18 characters)
  if (shortName.length > 18) {
    shortName = shortName.substring(0, 11).trim();
  }

  return shortName;
};
const handleBarcodeScanned = ({ data }) => {
  setScannedUPC(data);  // Save scanned UPC
  handleInputChange('upc', data); // Populate text input
  setScannerModalVisible(false); // Close scanner modal
};

const dashedNumber = formattedNumber.replace(/\s+/g, '-');
const formattedNumberWithSpaces = formattedNumber.replace(/-/g, '    ');
const cleanPhone = (selectedStoreDetails?.PHONE || '').replace(/-/g, '');

  return (
    <>
      <View style={{flex: 1, backgroundColor: 'white', position: 'absolute', top: verticalScale(0), bottom: verticalScale(0), left: scale(0), right: scale(0) }}>
        <View style={commonStyles.header}>
          <View style={styles.headerItems}>

            <Spark width={scale(50)} height={scale(50)} />
            <Pressable onPress={handleAlert} style={{flexDirection: 'row', width: '100%', position: 'absolute', top: verticalScale(20), padding: scale(5)}}>
              <BackIcon width={scale(20)} height={scale(20)} />
            </Pressable>
          </View>
        </View>
        <View style={{height: heightPercentageToDP(22), paddingBottom: verticalScale(15), flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', padding: scale(10), borderBottomWidth: verticalScale(0.45), borderBottomColor: '#999'}}>
            <Text style={commonStyles.titleText}>Input info to generate your Exit Pass!</Text>
            <Text style={[commonStyles.text, { textAlign: 'center' }]}>Welcome, {randomFirstName} {randomName}</Text>
          <Picker
                    selectedValue={storeNumber || 'null'}
                    mode='dropdown'
                    onValueChange={(value) => {
                      if (value === 'add_location') {
                        toggleModal2(); // Open the modal to add a location
                      } else {
                        try {
                          handleStoreChange(value); // Make sure handleStoreChange can handle errors
                        } catch (error) {
                          console.error('Error changing store:', error);
                          }
                        }
                      }}
                      style={{color: '#707070', width: '100%'}}
                      fontFamily={'EverydaySansRegular'}
                  >
              <Picker.Item 
                itemStyle={[{position: 'absolute', left: scale(-30), height: verticalScale(35), fontSize: moderateScale(7), right: scale(-30), fontFamily: 'EverydaySansRegular', textAlign: 'center', color: '#707070'}]} 
                label="Select a store" 
                key="null" 
                value="null" 
              />
              <Picker.Item 
                itemStyle={[{position: 'absolute', left: scale(-30), right: scale(-30), fontFamily: 'EverydaySansBold', textAlignVertical: 'center', color: '#707070'}]} 
                label="Add a location" 
                key="add_location" 
                value="add_location" 
              />
              {storeOptions && storeOptions.length > 0 && storeOptions.map((option) => (
                <Picker.Item 
                  itemStyle={[{position: 'absolute', left: scale(-30), right: scale(-30),fontFamily: 'EverydaySansRegular', textAlignVertical: 'center', color: '#707070'}]} 
                  label={option.label} 
                  key={option.value} 
                  value={option.value} 
                />
              ))}
          </Picker>
        <View style={{height: verticalScale(30), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginVertical: verticalScale(0)}}>
                <TextInput placeholder="Time (H:MM:SS AM/PM)" underlineColorAndroid='#888' onChangeText={(text) => setTime(text)} value={time} style={[commonStyles.textInput, {textAlign: 'center', height: '100%', fontFamily: 'EverydaySansRegular', fontSize: moderateScale(12), color: '#808080', width: '50%'}]} />
            <Pressable onPress={generateRandomMaleLastName} style={[commonStyles.button, {borderRadius: scale(15), width: '50%', height: verticalScale(23), marginHorizontal: scale(5)}]} android_ripple={{ color: 'white'}}>
              <Text style={[commonStyles.buttonText, {}]}>GENERATE NAME</Text>
            </Pressable>
        </View>
        </View>
          <Animated.FlatList
            ListHeaderComponent={() => (
              <View style={{height: heightPercentageToDP(13), flexDirection: 'column', alignItems: 'space-evenly', justifyContent: 'center', width: '100%', padding: scale(8), rowGap: verticalScale(8)}}>               
                <Pressable onPress={() => {navigation.navigate('BarcodeScanner2', { items: items || [], randomFirstName, randomName, selectedStoreDetails, time, userId })}} style={[commonStyles.button, {height: verticalScale(25), width: '100%', backgroundColor: '#fdbd32'}]} android_ripple={{ color: 'white'}}>
                    <Text style={commonStyles.buttonText}>SCAN BARCODE</Text>
                </Pressable>
                <Pressable onPress={toggleAddItemModal} style={[commonStyles.button, {height: verticalScale(25), width: '100%', backgroundColor: '#fdbd32'}]} android_ripple={{ color: 'white'}}>
                    <Text style={commonStyles.buttonText}>MANUALLY ADD ITEM</Text>
                </Pressable>           
              </View>
            )}
            data={items}
            onScroll={scrollHandler}
            scrollEventThrottle={16} // Ensures smooth scroll events
            renderItem={({ item, index }) => (
              <View key={item.upc} style={{ height: verticalScale(170), justifyContent: 'space-around', padding: scale(8), flexDirection: 'column', borderBottomColor: '#0000', borderBottomWidth: scale(1), borderColor: '#e0e0e0'}}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', height: '50%', alignItems: 'flex-start' }}>
                  {item.firstPhoto ? (
                    <View style={{ width: '30%', height: '100%', top: verticalScale(0), left: scale(0), alignItems: 'center', justifyContent: 'center' }}>
                      <Image source={{ uri: item.firstPhoto }} style={{width: scale(90), height: scale(90)}}/>
                    </View>
                    ) : (
                    <View style={{ width: '30%', height: '100%', top: verticalScale(0), left: scale(0), alignItems: 'center', justifyContent: 'center' }}>
                      <Image source={require('../assets/images/INF.png')} style={commonStyles.image} />
                    </View> 
                    )
                  }
                  <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', width: '70%', height: heightPercentageToDP(5), rowGap: verticalScale(0) }}>
                    <View style={{width: '65%', height: '100%', alignItems: 'flex-start', justifyContent: 'center', marginVertical: verticalScale(10), rowGap: verticalScale(0) }}>
                        <TextInput
                            key={item.upc}
                            style={[{textAlign: 'center', borderColor: '#dadada68', fontFamily: 'EverydaySansBold', color: '#2b8704', fontSize: scale(13), width: scale(60), borderWidth: scale(1), height: '100%', borderRadius: scale(10), textAlignVertical: 'center', textAlign: 'center'}]}
                            placeholder={String(item.price)}
                            value={manualPrice}
                            cursorColor='#2b8704'
                            placeholderTextColor='#2b8704'
                            keyboardType="numeric"
                            onChangeText={handleManualPriceChange}
                            onSubmitEditing={() => handleManualPrice(item.upc)}
                        />
                    </View>
                    <View style={{width: '100%', height: heightPercentageToDP(10) }}>
                      <Text numberOfLines={3}  style={[{fontFamily: 'EverydaySansBold', fontSize: moderateScale(11.5), color: '#000'}]}>{item.name}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', width: '90%', height: heightPercentageToDP(8), columnGap: scale(5), alignItems: 'center', justifyContent: 'space-between', marginVertical: verticalScale(10) }}>
                <View style={[styles.checkboxContainer, { rowGap: verticalScale(2) }]}>
                  <Pressable
                    onPress={() => {
                      toggleRequiresSerial(item.upc);
                      // if just turned on, optionally open your scan modal
                      if (!item.requiresSerial) {
                        setCurrentItemIndex(index);
                        setSerialScanVisible(true);
                      }
                    }}
                    style={styles.checkbox}
                    hitSlop={12}
                  >
                    <Text style={commonStyles.text2}>
                      {item.requiresSerial ? '☑' : '☐'} Requires Serial #
                    </Text>
                  </Pressable>

                  {item.requiresSerial && (
                    <TextInput
                      placeholder="Serial Number"
                      value={item.serialNumber}
                      editable={true}
                      style={[
                        commonStyles.textBox,
                        {
                          textAlign: 'center',
                          right: scale(3),
                          borderWidth: scale(1),
                          borderColor: '#888',
                          width: '90%',
                          height: verticalScale(30),
                          color: '#707070',
                          borderRadius: scale(7),
                          fontSize: moderateScale(11),
                          height: heightPercentageToDP(4),
                          fontFamily: 'EverydaySansRegular',
                          paddingLeft: scale(10),
                        },
                      ]}
                      onChangeText={(newSerial) => {
                        setItems(prev =>
                          prev.map(it =>
                            it.upc === item.upc ? { ...it, serialNumber: newSerial } : it
                          )
                        );
                      }}
                    />
                  )}
                </View>
                  <View style={{ flexDirection: 'row', width: scale(110), height: verticalScale(23), justifyContent: 'center', alignItems: 'center', borderWidth: scale(1), borderColor: '#282828ff' , borderRadius: scale(40)}}>
                    <Pressable onPress={() => removeItem(item.upc, -1)} style={[{ width: '33%', height: verticalScale(23) }]} hitSlop={8}>
                      <Text style={[commonStyles.buttonText, {color: '#000', fontFamily: 'EverydaySansRegular', fontSize: moderateScale(17), textAlignVertical: 'center'}]}>-</Text>
                    </Pressable>
                      <View style={{ flexDirection: 'column', width: '33%', height: verticalScale(30), alignItems: 'center', justifyContent: 'center' }}>
                        <TextInput
                            key={item.upc}
                            style={{textAlign: 'center', fontFamily: 'EverydaySansRegular', textAlignVertical: 'center', color: '#000', height: '100%', width: '50%'}}
                            placeholder={String(item.quantity)}                  
                            value={String(item.quantity || 1)}
                            onChangeText={(text) => handleQuantityChange(text, item.upc)}
                            keyboardType="numeric"
                            onSubmitEditing={() => handleItemQuantity(item.upc, itemQuantity - item.quantity)}
                        />
                      </View>
                    <Pressable onPress={() => addItemAgain(item.upc, 1)} style={[{width: '33%',  height: verticalScale(23) }]} hitSlop={8}>
                      <Text style={[commonStyles.buttonText, {color: '#000', fontFamily: 'EverydaySansRegular', fontSize: moderateScale(17), textAlignVertical: 'center'}]}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.upc} // Unique identifier for each item
            contentContainerStyle={{ paddingBottom: 10, height: 'auto', backgroundColor: '#fff', width: '100%' }}
          />
          <Animated.View style={[commonStyles.button, actionBar, {bottom: verticalScale(28), borderRadius: 0, zIndex: 1, height: verticalScale(40), position: 'absolute', bottom: verticalScale(0), left: scale(0), right: scale(0), elevation: 5}]}>
              <Pressable onPress={toggleModal3} android_ripple={{ color: 'white' }} style={{width: '100%', height: '100%', justifyContent: 'center'}}>
                  <Text style={commonStyles.buttonText}>SUBMIT</Text>
              </Pressable>
            </Animated.View>
      <Modal isVisible={isSerialScanVisible} onBackdropPress={toggleSerialModal} backdropColor="black" backdropOpacity={0.1} hasBackdrop={true} animationIn="slideInUp" style={[commonStyles.modal, {position: 'absolute', bottom: verticalScale(-18), left: scale(-18), right: scale(-18), height: heightPercentageToDP(85)}]}>
      <CameraView
        style={[styles.camera]}
        barcodeScannerSettings={{
        barcodeTypes: ["code39", "code93", "code128","aztec", "pdf417", "datamatrix", "codabar", "qr", "itf14", "upc_e", "ean13"],
      }}
      onBarcodeScanned={scannedUPC ? undefined : handleSerialScanned}  // Ensure proper serial scanning
      >
        <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
          <View style={styles.overlayCenter}>
            <Image source={require('../assets/images/barcode2.png')} style={{width: scale(315), height: moderateScale(100), zIndex: 1}}/>
            <View style={[styles.overlayHighlight, {zIndex: 2, bottom: verticalScale(35)}]}/>
          </View>
        </View>
      </CameraView>
      </Modal>
        <Modal isVisible={isModal2Visible} onBackdropPress={toggleModal2} backdropColor="black" backdropOpacity={0.6} hasBackdrop={true} animationIn="slideInUp">
          <View style={[commonStyles.modal, {position: 'absolute', bottom: verticalScale(-18), left: scale(-18), right: scale(-18), height: heightPercentageToDP(90)}]}>
            <View style={commonStyles.modalContent}>
              <Text style={commonStyles.titleText}>Add Location Information</Text>
              <TextInput placeholder="Store Number" underlineColorAndroid='#888' onChangeText={(text) => setAddStoreNumber(text)} style={[commonStyles.textInput, {textAlign: 'center',width: '90%', fontSize: moderateScale(12), height: '7%'}]} />
              <TextInput placeholder="Address" underlineColorAndroid='#888' onChangeText={(text) => setAddStoreLocation(text)} style={[commonStyles.textInput, {textAlign: 'center', width: '90%', fontSize: moderateScale(12), height: '7%'}]} />
              <TextInput placeholder="City" underlineColorAndroid='#888' onChangeText={(text) => setAddStoreCity(text)} style={[commonStyles.textInput, {textAlign: 'center', width: '90%', fontSize: moderateScale(12), height: '7%'}]} />
              <TextInput placeholder="State" underlineColorAndroid='#888' onChangeText={(text) => setAddStoreState(text)} style={[commonStyles.textInput, {textAlign: 'center', width: '90%', fontSize: moderateScale(12), height: '7%'}]} />
              <TextInput placeholder="Zip" underlineColorAndroid='#888' onChangeText={(text) => setAddStoreZip(text)} style={[commonStyles.textInput, {textAlign: 'center', width: '90%', fontSize: moderateScale(12), height: '7%'}]} />
              <TextInput placeholder="Phone Number (xxx-xxx-xxxx)" underlineColorAndroid='#888' onChangeText={(text) => setAddStorePhone(text)} style={[commonStyles.textInput, {textAlign: 'center', width: '90%', fontSize: moderateScale(12),height: '7%'}]} />
              <TextInput placeholder="OP" underlineColorAndroid='#888' onChangeText={(text) => setAddStoreOP(text)} style={[commonStyles.textInput, {textAlign: 'center', width: '90%', fontSize: moderateScale(12), height: '7%'}]} />
              <TextInput placeholder="TE" underlineColorAndroid='#888' onChangeText={(text) => setAddStoreTE(text)} style={[commonStyles.textInput, {textAlign: 'center', width: '90%', fontSize: moderateScale(12), height: '7%'}]} />
              <TextInput placeholder="TR" underlineColorAndroid='#888' onChangeText={(text) => setAddStoreTR(text)} style={[commonStyles.textInput, {textAlign: 'center',width: '90%', fontSize: moderateScale(12), height: '7%'}]} />
              <Pressable onPress={addLocationOnPress} style={[commonStyles.button, {height: '5%', width: '90%'}]} android_ripple={{ color: 'white' }}>
                <Text style={commonStyles.buttonText}>ADD LOCATION</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Modal isVisible={isModal3Visible} onBackdropPress={toggleModal3} backdropColor="black" backdropOpacity={0.6} hasBackdrop={true} animationIn="slideInUp">
            <View style={[commonStyles.modal, {position: 'absolute', bottom: verticalScale(-18), left: scale(-18), right: scale(-18), height: heightPercentageToDP(37), padding: scale(5)}]}>
              <View style={[commonStyles.modalContent, {paddingHorizontal: scale(10)}]}>
                <Text style={[commonStyles.titleText, {fontSize: moderateScale(28)}]}>IMPORTANT!!!</Text>
                <Text style={[commonStyles.text, {textAlign: 'center'}]}>DO NOT TAP SUBMIT UNTIL YOU ARE 100% CERTAIN YOU ARE GOING TO MAKE IT OUT OF THE STORE. IF FOR WHATEVER REASON YOU CREATE THE EXIT PASS AND ARE UNABLE TO MAKE IT OUT OF THE STORE... YOU WILL STILL BE RESPONSIBLE FOR THE CREATOR'S FEE.</Text>
                <Text style={[commonStyles.text, {textAlign: 'center'}]}>Pay attention to your notifications, as well, there will be one requiring your response about 5 mins after creating Exit Pass.</Text>
                <Pressable onPress={()=>handleSaveOrder(items, formattedNumber, taxRate, userId)} style={[commonStyles.button, {height: heightPercentageToDP(4), width: widthPercentageToDP(92), marginVertical: verticalScale(5)}]} android_ripple={{ color: 'white' }}>
                  <Text style={commonStyles.buttonText}>SUBMIT</Text>
                </Pressable>
              </View>
            </View>
        </Modal>
        <Modal isVisible={isTerminalModalVisible} onBackdropPress={toggleTerminalModal} backdropColor="black" backdropOpacity={0.6} hasBackdrop={true} animationIn="slideInUp" >
            <View style={[commonStyles.modal, {overflow: 'hidden', height: heightPercentageToDP(45), padding: scale(10), alignItems: 'center', position: 'absolute', bottom: verticalScale(-30), left: scale(-18), right: scale(-18)}]}>
              <View style={[commonStyles.modalContent, {justifyContent: 'center', alignItems: 'center'}]}>
            <View style={{height: heightPercentageToDP(5)}}>
              <Text style={commonStyles.titleText}>Update OP & TE Numbers, as well as Manager's name (if necessary)</Text>
            </View>
            <View style={{height: heightPercentageToDP(25), marginBottom: verticalScale(0)}}>
              <View style={{height: heightPercentageToDP(7), width: widthPercentageToDP(92)}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', height: '100%'}}>
                    <Text style={[commonStyles.text, {fontSize: moderateScale(12)}]}>OP:</Text>
                    <TextInput
                      underlineColorAndroid='#888'
                      placeholder={selectedStoreDetails.OP}  
                      value={opNumber}
                      maxLength={4}
                      defaultValue={selectedStoreDetails.OP}
                      onChangeText={(text) => setOpNumber(text)}
                      style={[commonStyles.textInput, {textAlign: 'center', marginHorizontal: scale(15), fontSize: moderateScale(12), width: '85%', height: heightPercentageToDP(5)}]}
                    />
                  </View>
              </View>
              <View style={{height: heightPercentageToDP(7), width: widthPercentageToDP(92)}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', width: widthPercentageToDP(92), height: '100%'}}>
                    <Text style={[commonStyles.text, {fontSize: moderateScale(12)}]}>TE:</Text>
                    <TextInput
                      underlineColorAndroid='#888'
                      placeholder={selectedStoreDetails.TE}  
                      value={teNumber}
                      maxLength={2}
                      defaultValue={selectedStoreDetails.TE}
                      onChangeText={(text) => setTeNumber(text)}
                      style={[commonStyles.textInput, {textAlign: 'center', fontSize: moderateScale(12), marginHorizontal: scale(15), width: '85%', height: heightPercentageToDP(5)}]}
                  />
                </View>
              </View>
              <View style={{height: heightPercentageToDP(7), width: widthPercentageToDP(92)}}>
                <View style={{flexDirection: 'row', alignItems: 'center', height: '100%'}}>
                  <Text style={[commonStyles.text, {fontSize: moderateScale(12)}]}>Manager:</Text>
                  <TextInput
                    underlineColorAndroid='#888'
                    placeholder={selectedStoreDetails.MANAGER}
                    autoCapitalize={'characters'}
                    value={storeManager}
                    defaultValue={selectedStoreDetails.MANAGER}
                    onChangeText={(text) => setStoreManager(text)}
                    style={[commonStyles.textInput, { textAlign: 'center', fontSize: moderateScale(12), marginHorizontal: scale(15), width: '75%', height: heightPercentageToDP(5)}]}
                />
                </View>
              </View>
            </View>
            <Pressable onPress={() => handleSave(selectedStoreDetails)}>
                <View style={[commonStyles.button, {width: widthPercentageToDP(94), height: heightPercentageToDP(4) }]}>
                    <Text style={commonStyles.buttonText}>SAVE</Text>
                </View>
            </Pressable>
            </View>
          </View>
        </Modal>
        <Modal isVisible={isAddItemModalVisible} onBackdropPress={toggleAddItemModal} backdropColor="black" backdropOpacity={0.2} hasBackdrop={true} animationIn="slideInUp" style={[commonStyles.modal, {height: verticalScale(575), alignItems: 'center', position: 'absolute', bottom: verticalScale(-30), left: scale(-18), right: scale(-18)}]}>
          <View style={{height: '90%', width: '100%', alignItems: 'center', justifyContent: 'space-evenly', padding: scale(10)}}>
            <Text style={[commonStyles.titleText, {fontSize: moderateScale(16)}]}>Enter Item Details</Text>
            <TextInput placeholder="Name (required)" value={manualItem.name} onChangeText={(text) => handleInputChange('name', text)} style={[commonStyles.textInput, {textAlign: 'center', color: '#888', borderBottomColor: '#666', width: '90%', borderBottomWidth: verticalScale(0.5), height: verticalScale(40), fontSize: moderateScale(12)}]} />
            <View style={{borderBottomColor: '#666', borderBottomWidth: verticalScale(0.5), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '90%'}}>
              <TextInput placeholder="UPC (required)" value={manualItem.upc || scannedUPC} onChangeText={(text) => handleInputChange('upc', text)} style={[commonStyles.textInput, {textAlign: 'center', color: '#888', width: '90%', height: verticalScale(40), fontSize: moderateScale(12)}]} />
              <Pressable onPress={toggleScannerModal} style={{alignItems: 'center', width: '1%', height: '50%'}}>
                <ScannerIcon2 width={scale(16)} height={verticalScale(16)} />
              </Pressable>
            </View>
            <TextInput placeholder="Price (required)" value={manualItem.price} onChangeText={(text) => handleInputChange('price', text)} keyboardType="numeric" style={[commonStyles.textInput, {textAlign: 'center',color: '#888', borderBottomColor: '#666', width: '90%', borderBottomWidth: verticalScale(0.5), height: verticalScale(40), fontSize: moderateScale(12)}]} />
            <TextInput placeholder="Photos (comma-separated URLs)" value={manualItem.photos} onChangeText={handlePhotoInput} style={[commonStyles.textInput, {textAlign: 'center', color: '#888', borderBottomColor: '#666', width: '90%', borderBottomWidth: verticalScale(0.5), height: verticalScale(40), fontSize: moderateScale(12)}]} />
            <TextInput placeholder="Description" value={manualItem.description} onChangeText={(text) => handleInputChange('description', text)} style={[commonStyles.textInput, {textAlign: 'center', color: '#666', borderBottomColor: '#666', width: '90%', borderBottomWidth: verticalScale(0.5), height: verticalScale(40), fontSize: moderateScale(12)}]} />
            <TextInput placeholder="Rating" value={manualItem.rating} onChangeText={(text) => handleInputChange('rating', text)} keyboardType="numeric" style={[commonStyles.textInput, {textAlign: 'center', color: '#888', borderBottomColor: '#666', width: '90%', borderBottomWidth: verticalScale(0.5), height: verticalScale(40), fontSize: moderateScale(12)}]} />
            <TextInput placeholder="Total Ratings" value={manualItem.totalRatings} onChangeText={(text) => handleInputChange('totalRatings', text)} keyboardType="numeric" style={[commonStyles.textInput, {textAlign: 'center', color: '#888', borderBottomColor: '#666', width: '90%', borderBottomWidth: verticalScale(0.5), height: verticalScale(40), fontSize: moderateScale(12)}]} />
            <TextInput placeholder="Aisle" value={manualItem.aisle} onChangeText={(text) => handleInputChange('aisle', text)} style={[commonStyles.textInput, {textAlign: 'center', color: '#888', borderBottomColor: '#666', width: '90%', borderBottomWidth: verticalScale(0.5), height: verticalScale(40), fontSize: moderateScale(12)}]} />
            <TextInput placeholder="Brand" value={manualItem.brand} onChangeText={(text) => handleInputChange('brand', text)} style={[commonStyles.textInput, {textAlign: 'center', color: '#888', borderBottomColor: '#666', width: '90%', borderBottomWidth: verticalScale(0.5), height: verticalScale(40), fontSize: moderateScale(12)}]} />
            <View style={{width: '90%', marginTop: verticalScale(25)}}>
              <Pressable onPress={handleAddItem} style={[commonStyles.button, {width: '100%'}]}>
                <Text style={commonStyles.buttonText}>ADD ITEM</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Modal
          isVisible={isScannerModalVisible}
          onBackdropPress={toggleScannerModal}
          style={{ flex: 1, backgroundColor: 'white' }}
        >
          <View style={{ flex: 1 }}>
            <CameraView
              style={{ flex: 1 }}
              barcodeScannerSettings={{ barcodeTypes: ["upc_a", "ean13"] }}
              onBarcodeScanned={handleBarcodeScanned}
            >
              <Pressable onPress={toggleScannerModal} style={{ position: 'absolute', top: 40, right: 20 }}>
                <Text style={{ color: '#fff', fontSize: 18 }}>Close</Text>
              </Pressable>
            </CameraView>
          </View>
        </Modal>
      </View>
<View
  ref={receiptRef}
  onLayout={() => setReceiptReady(true)}
  style={{
    backgroundColor: '#fff',
    padding: scale(5),
    opacity: 0, // keep invisible for screenshot only
    pointerEvents: 'none',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    zIndex: 10
  }}
  collapsable={false}
>
  <View
    style={{
      flexDirection: 'column',
      width: width,
      height: 'auto',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      backgroundColor: '#fff',
      rowGap: verticalScale(10),
    }}
  >
    {/* ✅ HEADER */}
    <View style={{ width: width - scale(10), height: verticalScale(130), justifyContent: 'space-evenly', alignItems: 'center' }}>
        <WalmartLogo width={width - scale(10)} height={scale(90)} />
      <View style={{width: width - scale(10), height: verticalScale(10)}}>
        <Text style={styles.headerText}>WAL*MART</Text>
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center', width: width - scale(10), height: verticalScale(10)}}>
        <Text style={[styles.headerText, { textTransform: 'capitalize' }]}>{cleanPhone}  Mgr. {selectedStoreDetails.MANAGER}</Text>
      </View>
      <View style={{width: width - scale(10), height: verticalScale(10)}}>
        <Text style={styles.headerText}>
        {selectedStoreDetails.CITY}, {selectedStoreDetails.STATE}
        </Text>
      </View>
      <View style={{width: width - scale(10), height: verticalScale(10)}}>
        <Text style={styles.headerText}>
          ST# 0{selectedStoreDetails.STORE}   OP# 0{selectedStoreDetails.OP}   TE# {selectedStoreDetails.TE}   TR# 0{selectedStoreDetails.TR}
        </Text>
      </View>
    </View>

    {/* ✅ ITEMS LIST */}
    <View style={{ width: width - scale(10), height: 'auto', alignItems: 'center', justifyContent: 'space-evenly' }}>
      {items.length > 0 ? (
        items.map((item, index) =>
          [...Array(item.quantity)].map((_, i) => (
            <View key={`${index}-${i}`} style={{width: width - scale(10), height: verticalScale(12)}}>
              {i === 0 && item.serialNumber && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignSelf: 'flex-start', width: width - scale(10), height: verticalScale(10) }}>
                  <Text style={styles.serialNumberText}>
                    PRODUCT SERIAL #: {item.serialNumber}
                  </Text>
                </View>
              )}
              <View
                style={{
                  width: width - scale(10),
                  flexDirection: 'row',
                  alignItems: 'space-between',
                  justifyContent: 'center',
                }}
              >
                <View style={{alignSelf: 'flex-start', width: '38%'}}>
                  <Text style={styles.itemName}>{formatItemName(item.name)}</Text>
                </View>
                <View style={{flexDirection: 'row', alignSelf: 'center', width: '38%'}}>
                  <Text style={styles.itemUPC}>{item.upc}</Text>
                  {item.isFood === true && (
                    <Text style={[styles.itemUPC, {marginLeft: scale(10)}]}>F</Text>
                  )}
                </View>
                <View style={{alignSelf: 'flex-end', width: '24%'}}>
                  <Text style={styles.itemPrice}>
                    {parseFloat(item.price || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )
      ) : (
        <View style={{alignItems: 'center'}}>
          <Text style={styles.noItemsText}>NO ITEMS ADDED</Text>
        </View>
      )}
    </View>

    {/* ✅ TOTALS */}
    <View
      style={{
        width: width - scale(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ flexDirection: 'column', width: '71%', alignItems: 'flex-end' }}>
        <Text style={styles.totalText}>SUBTOTAL</Text>
        {items.some(i => i.isFood === false || i.isFood === 'false') && (
          <Text style={styles.totalText}>TAX 1 8.750%{'     '}</Text>
        )}
        {items.some(i => i.isFood === true || i.isFood === 'true') && (
          <Text style={styles.totalText}>TAX 12   0 %</Text>
        )}
        <Text style={styles.totalText}>TOTAL</Text>
        <Text style={styles.totalText}>WMP VISA CREDIT TEND</Text>
        <Text style={styles.totalText}>WMP VISA  ****   ****</Text>
        <Text style={styles.totalText}>CHANGE DUE</Text>
      </View>
      <View style={{ flexDirection: 'column', width: '29%', alignItems: 'flex-end' }}>
        <Text style={styles.totalText}>{totalSubtotal.toFixed(2) || 0.00}</Text>
        {items.some(i => i.isFood === false || i.isFood === 'false') && (
          <Text style={styles.totalText}>{taxAmount.toFixed(2)}{''}</Text>
        )}
        {items.some(i => i.isFood === true || i.isFood === 'true') && (
          <Text style={styles.totalText}>0.00</Text>
        )}
        <Text style={styles.totalText}>{total.toFixed(2)}</Text>
        <Text style={styles.totalText}>{total.toFixed(2)}</Text>
        <Text style={styles.totalText}>**** 0569</Text>
        <Text style={styles.totalText}>0.00</Text>
      </View>
    </View>

    {/* ✅ FOOTER */}
    <View style={{width: width - scale(10), height: verticalScale(30), alignItems: 'center', justifyContent: 'center'}}>
      <Text style={styles.itemsSoldText}>
        # ITEMS SOLD {items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
      </Text>
    </View>
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: verticalScale(50),
        overflow: 'hidden'
      }}
    >
      <View style={{width: '100%', height: verticalScale(10), zIndex: 1, top: verticalScale(4)}}>
        <Text style={styles.tc}>TC# {formattedNumberWithSpaces}</Text>
      </View>
      <Barcode
        displayValue={false}
        width={scale(1.15)}
        height={verticalScale(30)}
        value={barcode}
        format="CODE39"
      />
    </View>
    <View style={{width: '100%', height: verticalScale(12)}}>
      <Text style={styles.date}>
        {numericDate}   {convertToMilitaryTime(time)}
      </Text>
    </View>
  </View>
</View>

    </>
  )
}
// Additional Styles for New Features
const styles = StyleSheet.create({
  date: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  headerLocationText: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'center',
  },
  headerText: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  headerText2: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'center',
    textAlignVertical: 'center',
    textTransform: 'uppercase',
  },
  itemName: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  itemPrice: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  itemUPC: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  itemsSoldText: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(30),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(26),
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  noItemsText: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    justifyContent: 'center',
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  receiptContent: {

  },
  serialNumberText: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  serialNumberText2: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'left',
  },
  tc: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  totalText: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(11),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(10),
    textAlign: 'right',
    textAlignVertical: 'center',
    alignSelf: 'flex-end'
  },
  checkboxContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-start',
    left: scale(6),
    top: verticalScale(8),
    width: '70%',
  },
  checkbox: {
    alignItems: 'flex-start',
    bottom: moderateScale(2),
    height: verticalScale(20),
    justifyContent: 'center',
    left: moderateScale(7),
    width: '100%',
  },
  overlayCenter: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  overlayHighlight: {
    backgroundColor: 'opaque',
    borderColor: '#ffffff44',
    borderWidth: moderateScale(2),
    height: '1%',
    width: '115%',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#0053e2',
    elevation: 5,
    height: verticalScale(130),
    justifyContent: 'center',
    zIndex: 2
  },
  headerTop: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    top: verticalScale(85),
  },
  noteText: {
    fontFamily: 'EverydaySansMedium',
    fontSize: 15,
    textAlign: 'center',
    top: 33
  },
  createText: {
    bottom: 35,
    color: 'white',
    fontFamily: 'EverydaySansMedium',
    fontSize: 16,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  headerItems: {
    alignItems: 'center',
    flexDirection: 'column',
    marginBottom: verticalScale(10)
  },
  spark: {
    height: verticalScale(110),
    top: verticalScale(20),
    width: moderateScale(110),
  },
  input2: {
    borderBottomWidth: 3,
    fontFamily: 'EverydaySansRegular',
    fontSize: 9,
    height: 26,
    marginVertical: 3
  },
  nameButton: {
    alignItems: 'center',
    backgroundColor: '#0053e2',
    borderRadius: 30,
    elevation: 5,
    flex: 0.4,
    height: 27,
    justifyContent: 'center',
  },
  addLocationButtonContainer: {
    position: 'relative',
  },

  modal: {
    alignItems: 'center',
    bottom: 0,
    elevation: 10,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '30%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 30,
    height: '100%',
    padding: 20,
    width: '100%',
  },
  scanAgainButton: {
    backgroundColor: '#0053e2',
    borderRadius: 30,
    bottom: 50,
    left: '50%',
    padding: 10,
    position: 'absolute',
  },
  scanAgainButtonText: {
    color: 'white',
    fontFamily: 'EverydaySansMedium',
    fontSize: 16,
  },
  buttonContainer: {
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0053e2',
    borderRadius: 30,
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    zIndex: 1
  },
  buttonText: {
    color: 'white',
    fontFamily: 'EverydaySansMedium',
    fontSize: 17,
  },
  permissionButton: {
    backgroundColor: '#0053e2',
    borderRadius: 30,
    padding: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontFamily: 'EverydaySansMedium',
    fontSize: 16,
  },
  modal2Content: {
    backgroundColor: '#fff',
    borderRadius: 30,
    height: '65%',
    justifyContent: 'space-evenly',
    padding: 20,
    width: '100%'
  },
  modal2Title: {
    color: 'black',
    fontFamily: 'EverydaySansBold',
    fontSize: 9,
    marginVertical: 10,
  },
  modal2Button: {
    alignItems: 'center',
    backgroundColor: '#0053e2',
    borderRadius: 30,
    elevation: 10,
    height: 25,
    justifyContent: 'center',
    marginVertical: 5,
    padding: 5,
    width: '100%',
    zIndex: 1
  },
  modal2ButtonText: {
    color: 'white',
    fontFamily: 'EverydaySansMedium',
    fontSize: 13,
  },
  modal3Title: {
    color: 'black',
    fontFamily: 'EverydaySansBold',
    fontSize: 17,
    textALign: 'center',
  },
  modal3Text: {
    color: 'black',
    fontFamily: 'EverydaySansRegular',
    fontSize: 14,
  },
  modal3Button: {
    alignItems: 'center',
    backgroundColor: '#0053e2',
    borderRadius: 30,
    elevation: 10,
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    zIndex: 1
  },
  modal3ButtonText: {
    color: 'white',
    fontFamily: 'EverydaySansMedium',
    fontSize: 13,
  },
  modal3Content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: moderateScale(15),
    borderTopRightRadius: moderateScale(15),
    bottom: 0,
    elevation: 10,
    height: verticalScale(240),
    justifyContent: 'space-evenly',
    left: scale(-18.5),
    padding: 20,
    position: 'absolute',
    right: 0,
    top: verticalScale(398),
    width: scale(350)
  },
});

