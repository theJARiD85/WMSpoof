import React from 'react';
import { Text, View, TextInput, Pressable } from 'react-native';
import { moderateScale } from'react-native-size-matters';

import { commonStyles } from '../lib/styles';

const UpdaterModal = ({
    selectedStoreDetails,
    opNumber,
    teNumber,
    storeManager,
    setOpNumber,
    setTeNumber,
    setStoreManager,
    closeTerminalModal,
}) => (
    <View style={[commonStyles.modal, {height: '40%', rowGap: moderateScale(5)}]}>
    <View style={{flex: 0.25}}>
      <Text style={commonStyles.titleText}>Update OP & TE Numbers, as well as Manager's name (if necessary)</Text>
      </View>
    <View style={{flex: 0.15, marginVertical: moderateScale(10)}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '100%', height: '100%'}}>
          <Text style={[commonStyles.text, {fontSize: moderateScale(16)}]}>OP:</Text>
          <TextInput
            placeholder={selectedStoreDetails.OP}  
              value={opNumber}
              onChangeText={(text) => setOpNumber(text)}
              style={[commonStyles.textInput, {borderBottomWidth: moderateScale(1), borderBottomColor: '#888', marginHorizontal: moderateScale(15), width: '85%', height: '70%'}]}
        />
      </View>
    </View>
    <View style={{flex: 0.15, marginVertical: moderateScale(10)}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '100%', height: '100%'}}>
          <Text style={[commonStyles.text, {fontSize: moderateScale(16)}]}>TE:</Text>
          <TextInput
            placeholder={selectedStoreDetails.TE}  
              value={teNumber}
              onChangeText={(text) => setTeNumber(text)}
              style={[commonStyles.textInput, {borderBottomWidth: moderateScale(1), borderBottomColor: '#888', marginHorizontal: moderateScale(15), width: '85%', height: '70%'}]}
         />
      </View>
    </View>
    <View style={{flex: 0.15, marginVertical: moderateScale(10)}}>
      <View style={{flexDirection: 'row', alignItems: 'center', width: '100%', height: '100%'}}>
        <Text style={[commonStyles.text, {fontSize: moderateScale(16)}]}>Manager:</Text>
        <TextInput
          placeholder={selectedStoreDetails.MANAGER}
          value={storeManager}
          onChangeText={(text) => setStoreManager(text)}
          style={[commonStyles.textInput, {borderBottomWidth: moderateScale(1), borderBottomColor: '#888', marginHorizontal: moderateScale(15), width: '72%', height: '70%'}]}
      />
      </View>
    </View>
    <Pressable onPress={() => closeTerminalModal(selectedStoreDetails)} style={{flex: 0.2, width: '100%' }}>
      <View style={[commonStyles.button, {width: '100%', height: moderateScale(40)}]}>
        <Text style={commonStyles.buttonText}>SAVE</Text>
      </View>
      </Pressable>
  </View>
);

export default UpdaterModal;
