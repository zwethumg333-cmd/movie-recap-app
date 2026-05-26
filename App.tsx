import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [screen, setScreen] = useState<'Upload' | 'Export'>('Upload');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const pickAudio = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: 'audio/mpeg' });
    if (!result.canceled && result.assets) {
      setAudioUri(result.assets[0].uri);
      Alert.alert("အောင်မြင်သည်", "MP3 ဖိုင် ထည့်သွင်းပြီးပါပြီ။");
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert("Error", "အသံဖမ်းယူခြင်း စတင်၍မရပါ။");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    setAudioUri(recording.getURI());
    setRecording(null);
    Alert.alert("အောင်မြင်သည်", "အသံဖမ်းယူမှု ပြီးဆုံးပါပြီ။");
  };

  const handleExport = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        Alert.alert("အောင်မြင်ပါသည် 🎉", "ဗီဒီယိုကို ChannelMSK Folder ထဲသို့ သိမ်းဆည်းပြီးပါပြီ။");
        setAudioUri(null);
        setScreen('Upload');
      } else {
        Alert.alert("Error", "Gallery ခွင့်ပြုချက် လိုအပ်ပါသည်။");
      }
    } catch (error) {
      Alert.alert("Error", "ထုတ်ယူမှု မအောင်မြင်ပါ။");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF0000" />
      {screen === 'Upload' ? (
        <View style={styles.subContainer}>
          <Text style={styles.title}>ChannelMSK - Movie Recap</Text>
          <TouchableOpacity style={styles.btn} onPress={pickAudio}>
            <Text style={styles.btnText}>🎵 Upload MP3 File</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, isRecording ? styles.recording : styles.record]} onPress={isRecording ? stopRecording : startRecording}>
            <Text style={styles.btnText}>{isRecording ? "🛑 Stop Recording" : "🎙️ Record Voice"}</Text>
          </TouchableOpacity>
          {audioUri && (
            <TouchableOpacity style={styles.nextBtn} onPress={() => setScreen('Export')}>
              <Text style={styles.nextText}>ဗီဒီယိုထုတ်ယူရန် ဆက်သွားမည် ➡️</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.subContainer}>
          <Text style={styles.title}>🎬 ဗီဒီယို ထုတ်ယူရန် အဆင်သင့်ဖြစ်ပါပြီ</Text>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportText}>ဗီဒီယို စတင်ထုတ်ယူမည် (Export)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 30 }} onPress={() => setScreen('Upload')}>
            <Text style={{ color: '#FFF' }}>⬅️ နောက်သို့ ပြန်သွားမည်</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF0000' },
  subContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, color: '#FFF', fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  btn: { backgroundColor: '#CC0000', padding: 16, borderRadius: 8, alignItems: 'center', marginVertical: 10, borderWidth: 1, borderColor: '#FFF' },
  record: { backgroundColor: '#333' },
  recording: { backgroundColor: '#900' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  nextBtn: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 40 },
  nextText: { color: '#FF0000', fontSize: 16, fontWeight: 'bold' },
  exportBtn: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  exportText: { color: '#FF0000', fontSize: 16, fontWeight: 'bold' }
});
