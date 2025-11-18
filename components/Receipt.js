import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Barcode from 'react-native-barcode-svg';
import { commonStyles } from '../lib/styles';
import { parseItemName } from '../lib/itemParser';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';

import WalmartLogo from '../assets/icons/WalmartLogo.svg';

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
  shortName = shortName.replace(/\s{2,}/g, '')
    .replace(/[\u00AE\u2122©®™]/g, '')
    .replace(/[,*_+=[\]{}()<>\/\\|'&:;!?~^%$#@"]/g, '')
    .replace(/[-]+/g, ' ')                // turn dashes into spaces
    .replace(/\s+/g, ' ')
    .replace(/\s+/g, '  ')
    .trim();

  // 🪓 Limit to realistic receipt width (~18 characters)
  if (shortName.length > 11) {
    shortName = shortName.substring(0, 11).trim();
  }

  return shortName;
};
export default function Receipt({
  items,
  storeNumber,
  militaryTime,
  numericDate,
  totalSubtotal,
  taxAmount,
  total,
  storeManager,
  barcode,
  taxRate,
  storePhone,
  storeLocation,
  storeCity,
  storeState,
  op,
  te,
  formattedNumber,
  manualPrice,
}) {
  const { width, height } = useWindowDimensions();

  const tr = Math.floor(1050 + Math.random() * 9000);
  const formattedNumberWithSpaces = (formattedNumber || '').replace(/-/g, '     ');
  const cleanPhone = (storePhone || '').replace(/-/g, '');

  return (
    <View style={{alignItems: 'center', justifyContent: 'center', width: scale(1050), height: 'auto'}}>
      <View style={{flexDirection: 'column', width: scale(1050), alignItems: 'center', justifyContent: 'space-evenly', bottom: heightPercentageToDP(50 + (items.length * 1)), rowGap: heightPercentageToDP(4)}}>
        <View style={{alignItems: 'center', width: scale(1050)}}>
          <WalmartLogo width={scale(1200)} height={scale(280)} style={{paddingBottom: heightPercentageToDP(2)}}/>
          <Text style={[styles.headerText]}>WAL*MART</Text>
          <View style={{justifyContent: 'center', alignItems: 'center', width: scale(1050)}}>
            <Text style={[styles.headerText, {textTransform: 'capitalize'}]}>{cleanPhone}{'  '}Mgr.{'  '}{storeManager}</Text>
          </View>
          <Text style={[styles.headerText, {}]}>{storeCity}, CA</Text>
          <Text style={[styles.headerText, {alignSelf: 'stretch'}]}>{''}ST# 0{storeNumber}  OP# 0{op}  TE# {te}  TR# 0{tr}{''}</Text>
        </View>
        <View style={{flexDirection: 'column', alignItems: 'center', width: scale(1050), justifyContent: 'space-evenly'}}>
        {items.length > 0 ? (
          items.map((item, index) => (
            [...Array(item.quantity)].map((_, i) => ( // Duplicate the item based on quantity
              <View key={`${index}-${i}`} >
                {/* Display serial number if it exists, only for the first instance of the item */}
                {i === 0 && item.serialNumber && (
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignSelf: 'flex-start', width: scale(1050)}}>
                      <Text style={styles.serialNumberText}>
                        PRODUCT SERIAL #:{' '}{item.serialNumber}
                      </Text>
                  </View>
                )}
              <View
                style={{
                  width: scale(1050),
                  flexDirection: 'row',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  right: scale(8)
                }}
              >
                <View style={{alignSelf: 'flex-start', width: scale(355)}}>
                  <Text style={styles.itemName}>{formatItemName(item.name)}</Text>
                </View>
                <View style={{alignSelf: 'center', width: scale(400)}}>
                  <View style={{alignItems: 'flex-end', widht: '100%'}}>
                    <Text style={styles.itemUPC}>{item.upc} </Text>
                  </View>
                </View>
                  <View style={{alignSelf: 'flex-end', width: scale(55)}}>
                  {item.isFood === true && (
                    <Text style={[styles.itemUPC, {marginLeft: scale(10)}]}>F</Text>
                  )}
                </View>
                <View style={{alignSelf: 'flex-end', width: scale(240)}}>
                  <Text style={styles.itemPrice}>{parseFloat(item.price).toFixed(2)}</Text>
                </View>
              </View>
            </View>
            ))
          ))
        ) : (
          <View style={{}}>
            <Text style={styles.noItemsText}>No items added</Text>
          </View>
        )}
        </View>
          <View style={{width: scale(1050)}}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', left: scale(13) }}>
            <View style={{ flexDirection: 'column', width: scale(730), alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={styles.totalText}>SUBTOTAL   </Text>
              {items.some(i => i.isFood === false || i.isFood === 'false') && (
              <Text style={styles.totalText}>TAX 1 8.750%{'      '}</Text>
              )}
              {/* ✅ Conditional TAX 12 line for food items */}
              {items.some(i => i.isFood === true || i.isFood === 'true') && (
                <Text style={styles.totalText}>TAX 12     0%{'      '}</Text>
              )}

              <Text style={styles.totalText}>TOTAL   </Text>
              <Text style={styles.totalText}>VISA CREDIT TEND   </Text>
            </View>
            <View style={{ flexDirection: 'column', width: scale(270), alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={styles.totalText}>{totalSubtotal.toFixed(2)}{''}</Text>
              {items.some(i => i.isFood === false || i.isFood === 'false') && (
              <Text style={styles.totalText}>{taxAmount.toFixed(2)}{''}</Text>
              )}
              {/* ✅ Match spacing on right column */}
              {items.some(i => i.isFood === true || i.isFood === 'true') && (
                <Text style={styles.totalText}>0.00</Text>
              )}

              <Text style={styles.totalText}>{total.toFixed(2)}{''}</Text>
              <Text style={styles.totalText}>{total.toFixed(2)}{''}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', right: scale(12)}}>
            <Text style={styles.totalText}>VISA  **** **** **** 0569</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', right: scale(12) }}>
            <View style={{ flexDirection: 'column', width: '72%', alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={styles.totalText}>CHANGE DUE  </Text>
            </View>

            <View style={{ flexDirection: 'column', width: '28%', alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={styles.totalText}>0.00{''}</Text>
            </View>
          </View>
          </View>
        <View style={{width: scale(1050), height: heightPercentageToDP(10), justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.itemsSoldText}> #  ITEMS SOLD {items.reduce((total, item) => total + item.quantity, 0)}</Text>
        </View>
          <View style={{height: verticalScale(30), justifyContent: 'flex-start'}}>
            <Text style={styles.tc}>TC# {formattedNumberWithSpaces}</Text>
          </View>

          <View style={{height: heightPercentageToDP(19), width: scale(1050), alignItems: 'center', justifyContent: 'flex-end' }}>
          <Barcode maxWidth={scale(1025)} singleBarWidth={scale(5)} backgroundColor={'#FFFFFF00'} height={verticalScale(140)} value={barcode} format='CODE39'style={{alignSelf: 'center', justifyContent: 'center'}}/>          </View>    
          <View style={{backgroundColor: '#fff', width: '100%', height: heightPercentageToDP(4), zIndex: 2, bottom: verticalScale(30)}}/>  
          <Text style={styles.date}>{numericDate}   {militaryTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  date: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(37),
    textAlign: 'center',
    top: verticalScale(-40)
  },
  headerLocationText: {
    width: scale(1050),
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(37),
    textAlign: 'center',
  },
  headerText: {
    width: scale(1050),
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(37),
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  headerText2: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(37),
    textAlign: 'center',
    textAlignVertical: 'center',
    textTransform: 'uppercase',
  },
  itemName: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(37),
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  itemPrice: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(37),
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  itemUPC: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(37),
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  itemsSoldText: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(85),
    letterSpacing: scale(-4),
    lineHeight: verticalScale(85),
    textAlign: 'center',
    textAlignVertical: 'center',
    top: verticalScale(5)
  },
  noItemsText: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(45),
    justifyContent: 'center',
    letterSpacing: scale(-1),
    lineHeight: verticalScale(45),
    textAlign: 'center',
    textAlignVertical: 'center',
    right: scale(30)
  },
  receiptContent: {

  },
  serialNumberText: {
    color: '#000',
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(37),
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  serialNumberText2: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(37),
    textAlign: 'left',
  },
  tc: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    top: verticalScale(5),
    lineHeight: verticalScale(37),
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  totalText: {
    color: '#000',
    fontFamily: 'NimbusMonoBold',
    fontSize: moderateScale(39),
    letterSpacing: scale(-1),
    lineHeight: verticalScale(37),
    textAlign: 'right',
    textAlignVertical: 'center',
  }
});
