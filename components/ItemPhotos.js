import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';


const ItemPhotos = ({ items }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return <View><Text>No photos available</Text></View>;
  }

  // Flatten the array by repeating each item based on its quantity
  let itemPhotos = [];
  items.forEach(item => {
    itemPhotos = [...itemPhotos, ...Array(item.quantity).fill(item.photo)];
  });

  // Slice the array to include only the first 5 photos
  const limitedItemPhotos = itemPhotos.slice(0, 5);

  return (
    <View style={styles.photosContainer}>
      {limitedItemPhotos.map((photo, index) => (
        photo ? (
          <Image 
            key={index} 
            source={{ uri: photo }} 
            style={styles.itemPhoto}  // Using local styles
          />
        ) : (
          <View key={index} style={[styles.itemPhoto, styles.placeholder]}>
            <Text>No Image</Text>
          </View>
        )
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  itemPhoto: {
    borderRadius: moderateScale(8),
    bottom: moderateScale(15),
    height: moderateScale(30),
    marginHorizontal: moderateScale(13),
    width: moderateScale(30),
  },
  photosContainer: {
    bottom: moderateScale(15),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    left: moderateScale(8),
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: '#ccc',
    justifyContent: 'center',
  },
});

export default ItemPhotos;
