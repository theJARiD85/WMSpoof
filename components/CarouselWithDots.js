import React, { useRef, useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

export default function CarouselWithDots() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const data = [
    { id: '1', color: '#e74c3c' },
    { id: '2', color: '#2ecc71' },
    { id: '3', color: '#3498db' },
    { id: '4', color: '#f1c40f' },
  ];

  const onScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.color }]} />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {data.map((_, index) => (
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
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    height: verticalScale(250),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: verticalScale(12),
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginHorizontal: scale(4),
    backgroundColor: '#ccc',
  },
  activeDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    backgroundColor: '#0053e2',
  },
});
