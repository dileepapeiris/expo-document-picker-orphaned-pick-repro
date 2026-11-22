import * as DocumentPicker from 'expo-document-picker';
import { useRef, useState } from 'react';
import { Button, Modal, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function App() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [waitForDismiss, setWaitForDismiss] = useState(false);
  const pendingPick = useRef<string | null>(null);
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

  // Closes the sheet and starts the pick in the same tick, as in expo/expo#53827.
  // With the workaround on, the pick is deferred until the Modal reports onDismiss.
  const closeSheetAndPick = () => {
    setSheetVisible(false);
    if (waitForDismiss) {
      pendingPick.current = 'pick 1';
    } else {
      pick('pick 1');
    }
  };

  // Presents the picker on top of the sheet, then closes the sheet underneath it.
  const pickThenCloseSheet = () => {
    pick('pick 3');
    setTimeout(() => setSheetVisible(false), 2000);
  };

  const onSheetDismissed = () => {
    const label = pendingPick.current;
    pendingPick.current = null;
    if (label) {
      append('sheet onDismiss fired');
      pick(label);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>expo-document-picker orphaned pick</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Workaround: pick after onDismiss</Text>
        <Switch value={waitForDismiss} onValueChange={setWaitForDismiss} />
      </View>
      <Button title="1. Open sheet" onPress={() => setSheetVisible(true)} />
      <Button title="3. Pick again" onPress={() => pick('pick 2')} />
      <ScrollView style={styles.log}>
        {log.map((line, index) => (
          <Text key={index} style={styles.line}>
            {line}
          </Text>
        ))}
      </ScrollView>
      <Modal
        visible={sheetVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onDismiss={onSheetDismissed}>
        <View style={styles.screen}>
          <Text style={styles.heading}>Sheet</Text>
          <Button title="2. Attach a file" onPress={closeSheetAndPick} />
          <Button title="2b. Pick here, then close the sheet" onPress={pickThenCloseSheet} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 80, paddingHorizontal: 16, gap: 12, backgroundColor: '#fff' },
  heading: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 15 },
  log: { flex: 1, marginTop: 12 },
  line: { fontSize: 13, marginBottom: 6 },
});
