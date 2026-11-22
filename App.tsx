import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import { createContext, useContext, useRef, useState } from 'react';
import { Button, Modal, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

type Picker = { log: string[]; pick: (label: string) => Promise<void> };

const PickerContext = createContext<Picker>({ log: [], pick: async () => {} });

type RootStack = { Home: undefined; ModalScreen: undefined };

const Stack = createNativeStackNavigator<RootStack>();

function HomeScreen({ navigation }: NativeStackScreenProps<RootStack, 'Home'>) {
  const { log, pick } = useContext(PickerContext);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [waitForDismiss, setWaitForDismiss] = useState(false);
  const pendingPick = useRef<string | null>(null);

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

  const onSheetDismissed = () => {
    const label = pendingPick.current;
    pendingPick.current = null;
    if (label) {
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
      <Button title="4. Open modal screen" onPress={() => navigation.navigate('ModalScreen')} />
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
        </View>
      </Modal>
    </View>
  );
}

function ModalScreen({ navigation }: NativeStackScreenProps<RootStack, 'ModalScreen'>) {
  const { pick } = useContext(PickerContext);

  // Presents the picker on top of this screen, then pops the screen from under it.
  const pickThenGoBack = () => {
    pick('pick 3');
    setTimeout(() => navigation.goBack(), 2000);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Modal screen</Text>
      <Button title="5. Pick here, then go back" onPress={pickThenGoBack} />
    </View>
  );
}

export default function App() {
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
    <PickerContext.Provider value={{ log, pick }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ModalScreen" component={ModalScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PickerContext.Provider>
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
