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
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
