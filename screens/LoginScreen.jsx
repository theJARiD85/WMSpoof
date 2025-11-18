import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import Spark from '../assets/icons/Spark.svg';
import { useUser } from '../contexts/UserContext';
import { commonStyles } from '../lib/styles';

export default function LoginScreen({ navigation }) {
  const { login, register } = useUser();
    const [userId, setUserId] = useState('');
    const [newUserId, setNewUserId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);

    // Modal inputs
    const [name, setName] = useState('');

const handleLogin = async (email, password) => {
  try {
    const session = await login(email, password);
    console.log('✅ Login successful! Session:', session);
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
};

    const handleRegister = async () => {
        try {
            await register(newUserId, email, password, name);
            await login(email, password); // Auto-login after registration
            toggleModal(); // Close the modal after successful registration
        } catch (error) {
            console.error('Registration failed:', error.message);
        }
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    return (
        <View style={styles.container}>
          <View style={{ justifyContent: 'center', alignItems: 'center'}}>
            <Spark width={scale(150)} height={scale(150)} />
          </View>
            <View style={{width: '100%', height: heightPercentageToDP(30), alignItems: 'center', justifyContent: 'flex-start', rowGap: verticalScale(10), marginBottom: verticalScale(100)}}>
                <View style={[styles.inputView]}>
                    <TextInput
                        style={[commonStyles.textInput, { textAlign: 'left'}]}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        style={[commonStyles.textInput, { textAlign: 'left'}]}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
            </View>
            <View style={styles.buttonsContainer}>
              <Pressable
                onPress={() => handleLogin(email, password)}
                style={[commonStyles.button, { height: heightPercentageToDP(4.5), width: '100%', backgroundColor: '#ecb823', marginTop: verticalScale(20) }]}
              >
                <Text style={commonStyles.buttonText}>Login</Text>
              </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonsContainer: {
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        width: '100%',
    },
    container: {
        alignItems: 'center',
        backgroundColor: '#0053e2',
        flex: 1,
        padding: moderateScale(15),
        justifyContent: 'space-evenly',
        rowGap: verticalScale(10)
    },
    inputView: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(10),
        height: heightPercentageToDP(5),
        paddingLeft: scale(10),
        width: '100%',
    }
});
