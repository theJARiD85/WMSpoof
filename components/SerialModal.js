import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { CameraView } from 'expo-camera';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import { commonStyles } from '../lib/styles';
const SerialModal = ({
    handleSerialScanned,
    scanned,
 }) => {

  return (
    <CameraView
    style={[styles.camera]}
    barcodeScannerSettings={{
    barcodeTypes: ["code39", "code93", "code128","aztec", "pdf417", "datamatrix", "codabar", "qr", "itf14", "upc_e", "ean13"],
  }}
  onBarcodeScanned={scanned ? undefined : handleSerialScanned}  // Ensure proper serial scanning
  >
        <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
          <View style={styles.overlayCenter}>
            <Image source={require('../assets/images/barcode2.png')} style={{width: scale(315), height: moderateScale(100), zIndex: 1}}/>
            <View style={[styles.overlayHighlight, {zIndex: 2, bottom: verticalScale(35)}]}/>
          </View>
        </View>
      </CameraView>

  )};

  export default SerialModal;

const styles = StyleSheet.create({

});