import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Button, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const append = (line: string) => setLog((lines) => [...lines, line]);

  const pick = async (label: string) => {
    append(`${label}: calling getDocumentAsync`);
    try {
      const result = await DocumentPicker.getDocumentAsync();
      append(`${label}: settled, canceled=${result.canceled}`);
    } catch (error) {
      append(`${label}: rejected, ${String(error)}`);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>expo-document-picker orphaned pick</Text>
      <Button title="1. Open sheet" onPress={() => setSheetVisible(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 80, paddingHorizontal: 16, gap: 12, backgroundColor: '#fff' },
  heading: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
});
