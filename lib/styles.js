// styles.js
import { StyleSheet } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';

export const commonStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#0053e2',
    borderRadius: moderateScale(33.3),
    height: heightPercentageToDP(4.5),
    elevation: 5,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'EverydaySansMedium',
    fontSize: moderateScale(12),
    textAlign: 'center',
    textVerticalAlign: 'center',
  },
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#0053e2',
    flexDirection: 'column',
    height: heightPercentageToDP(11),
    justifyContent: 'flex-end',
    paddingBottom: verticalScale(5),
    paddingHorizontal: scale(10),
    width: '100%',
    zIndex: 3

  },
  headerItems: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: verticalScale(5),
    width: '100%',
  },
  headerLabelText: {
    color: '#fff',
    textAlignVertical: 'center',
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(13.5),
    textAlign: 'left',
  },
  headerText: {
    color: '#fff',
    textAlignVertical: 'center',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(11.5),
    textAlign: 'left',
  },
  image: {
    height: moderateScale(50),
    width: moderateScale(50),
  },
  itemText: {
    color: 'black',
    textAlignVertical: 'center',
    fontFamily: 'EverydaySansMedium',
    fontSize: moderateScale(11),
  },
  itemText2: {
    color: 'black',
    textAlignVertical: 'center',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(14.5),
  },
  modal: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    justifyContent: 'space-evenly',
    elevation: 10,
  },
  modalContent: {
    padding: moderateScale(10),
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  text: {
    color: 'black',
    textAlignVertical: 'center',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(14),
  },
  text2: {
    color: 'black',
    fontFamily: 'EverydaySansRegular',
    textAlignVertical: 'center',
    fontSize: moderateScale(11.5),
  },
  textBox: {
    borderColor: '#888',
    borderRadius: moderateScale(7),
    borderWidth: moderateScale(1),
    textAlignVertical: 'center',
    fontFamily: 'EverydaySansRegular',
    height: '100%',
    color: '#808080'
  },
  textInput: {
    color: '#888',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(12),
    height: heightPercentageToDP(4.5),
    textAlignVertical: 'center',
  },
  textInput2: {
    borderColor: '#888',
    borderRadius: moderateScale(11),
    borderWidth: moderateScale(1),
    height: '100%',
    color: '#888',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(11),
    textAlign: 'center',
    textAlignVertical: 'center',
    width: '50%',
    color: '#808080'
  },
  titleText: {
    color: 'black',
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(14),
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
