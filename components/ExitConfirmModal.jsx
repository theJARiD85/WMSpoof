// components/ExitConfirmModal.jsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { databases } from '../lib/appwrite';
import { toast } from '../lib/toast';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function ExitConfirmModal({ visible, onClose, exitPassId }) {
  const handleResponse = async (response) => {
    try {
      const status = response === 'yes' ? 'responded_yes' : 'responded_no';
      await databases.updateDocument('exits', 'exit_passes', exitPassId, { status });
      toast(response === 'yes' ? '✅ Glad you made it out safely!' : '⚠️ We’ll take a closer look.');

      onClose();
    } catch (err) {
      console.error('Error updating response:', err);
      toast('Error saving response.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Did you make it out successfully?</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.yes]} onPress={() => handleResponse('yes')}>
              <Text style={styles.text}>✅ Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.no]} onPress={() => handleResponse('no')}>
              <Text style={styles.text}>❌ No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  card: { backgroundColor: '#fff', borderRadius: scale(12), padding: scale(24), width: '80%' },
  title: { fontSize: moderateScale(18), fontWeight: 'bold', marginBottom: verticalScale(16), textAlign: 'center' },
  buttons: { flexDirection: 'row', justifyContent: 'space-around' },
  button: { paddingVertical: verticalScale(10), paddingHorizontal: scale(20), borderRadius: scale(8) },
  yes: { backgroundColor: '#2ecc71' },
  no: { backgroundColor: '#f56e5fff' },
  text: { color: '#fff', fontSize: moderateScale(16) },
});
