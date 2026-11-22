# getDocumentAsync never settles after a dismissing sheet, then rejects every later call (iOS)

Reproduction for https://github.com/expo/expo/issues/53827 on iOS.

Versions: Expo SDK 58 (`expo` 58.0.26), `expo-document-picker` 58.0.5, `expo-modules-core` 58.1.0,
`react-native` 0.88.1, New Architecture.
Recorded on the iPhone 17 Pro simulator, iOS 26.5, Xcode 27.2, 11/22/26.
