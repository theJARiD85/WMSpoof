import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

import Barcode2 from '../assets/icons/Barcode2.svg';

const BarcodeContainer = ({ handleLongPress, randomName, total }) => {
  // Shared values for Reanimated
  const bar1Anim = useSharedValue(0);
  const bar2Anim = useSharedValue(0);

  // Define animation in useEffect
  useEffect(() => {
    // Bar 1 animation loop
    bar1Anim.value = withRepeat(
      withTiming(1, { duration: 1450, easing: Easing.linear }),
      -1, // Infinite loop
      true // Reverse animation
    );

    // Bar 2 animation loop
    bar2Anim.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.linear }),
      -1, // Infinite loop
      true // Reverse animation
    );
  }, []);

  // Animated styles using useAnimatedStyle
  const bar1AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bar1Anim.value * 72 }],
    };
  });

  const bar2AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bar2Anim.value * 72 }],
    };
  });

  return (
    <View style={styles.barcodeContainer}>
      <Pressable
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: moderateScale(340),
          height: moderateScale(120),
        }}
        onLongPress={handleLongPress}
        delayLongPress={1500}
      >
        <View
          style={{
            width: '90%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: moderateScale(18),
          }}
        >
          <Text style={styles.name}>{randomName}</Text>
          <Text style={styles.total}>Total ${total.toFixed(2)}</Text>
        </View>
        <View
          style={{
            width: '100%',
            height: moderateScale(60),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
        <Barcode2 width={'87%'} height={moderateScale(100)} />
          <Animated.View style={[styles.bar2, bar1AnimatedStyle]} />
          <Animated.View style={[styles.bar1, bar2AnimatedStyle]} />
        </View>
        <View style={{ flex: 0.41, height: '100%', width: '100%', paddingBottom: moderateScale(18) }}>
          <Text style={styles.tc}>TC# 2177 4352 9483 2747 9384</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    height: moderateScale(60),
    justifyContent: 'flex-start',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  },
  bar1: {
    backgroundColor: '#0172dccc',
    height: moderateScale(1),
    left: 0,
    position: 'absolute',
    right: 0,
    top: moderateScale(0),
    zIndex: 1,
  },
  bar2: {
    backgroundColor: '#096ac475',
    height: moderateScale(3),
    left: 0,
    position: 'absolute',
    right: 0,
    top: moderateScale(0),
    zIndex: 1,
  },
  barcodeContainer: {
    alignItems: 'center',
    borderColor: '#ddd',
    borderRadius: moderateScale(9),
    borderWidth: moderateScale(1),
    bottom: moderateScale(8),
    flex: 0.75,
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  name: {
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(14.5),
  },
  tc: {
    color: '#000',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(13),
    textAlign: 'center',
  },
  total: {
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(14.5),
    textAlign: 'right',
  },
});

export default BarcodeContainer;
