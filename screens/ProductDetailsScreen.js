import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ScrollView, FlatList, Dimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters'; // If you are using scaling
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { commonStyles } from '../lib/styles';
import CartIcon from '../assets/icons/CartIcon.svg';
import BackIcon from '../assets/icons/BackIcon';
import StarRating from '../components/StarRating';
const ProductDetailsScreen = () => {
    const { width } = Dimensions.get('window');

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = (event) => {
        const index = Math.floor(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
      };

    const navigation = useNavigation();

    const maxStars = 5; // Total number of stars

// Calculate the number of filled, half-filled, and empty stars
const filledStars = Math.floor(rating); // Full stars
const hasHalfStar = rating - filledStars >= 0.5; // Check if there's a half star
const emptyStars = maxStars - filledStars - (hasHalfStar ? 1 : 0); // Remaining empty stars

  const route = useRoute();
  const {
    name,
    description,
    price,
    brand,
    photos,
    rating,
    totalratings,
    upc,
    items,
    storeLocation,
    storeNumber,
    totalSubtotal,
    taxAmount,
    dayOfWeek,
    total,
    formattedDate,
    dateLong,
    time,
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
    randomName,
} = route.params;

  return (
    <View style={{flex: 1, height: 'auto', backgroundColor: '#fff'}}>
        <View style={commonStyles.header}>
            <View style={commonStyles.headerItems}>
                <Pressable
                    onPress={() => navigation.navigate('Splash', {
                    nextScreen: 'DetailsScreen',
                    items: items || [],
                    storeLocation,
                    storeNumber,
                    totalSubtotal,
                    taxAmount,
                    dayOfWeek,
                    total,
                    formattedDate,
                    dateLong,
                    time,
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
                    randomName,
                    })}
                    style={{flexDirection: 'row', width: '90%', alignItems: 'center', justifyContent: 'flex-start'}}
                    >
                    <View>
                    <BackIcon style={styles.back} />
                    </View>
                </Pressable>
                <View style={{ width: '10%', justifyContent: 'flex-end', top: moderateScale(2), left: moderateScale(11)}}>
                    <CartIcon />
                </View>
            </View>
        </View>
        <ScrollView contentContainerStyle={{flexDirection: 'column', justifyContent: 'space-around', marginBottom: moderateScale(15), backgroundColor: '#fff', rowGap: moderateScale(10)}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: moderateScale(15)}}>
                <Text style={[commonStyles.text, {textDecorationLine: 'underline'}]}>{brand}</Text>
                <StarRating rating={rating} totalratings={totalratings} />
            </View>
        <Text style={[commonStyles.text, {padding: moderateScale(15)}]}>{name}</Text>
        <FlatList
        data={photos}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={[styles.image, {width: width, padding: moderateScale(15)}]} resizeMode="contain" />
        )}
        keyExtractor={(item, index) => index.toString()}
      />

            <Text style={[styles.price, {padding: moderateScale(15)}]}>${price}</Text>


        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: moderateScale(20),
  },

});

export default ProductDetailsScreen;
