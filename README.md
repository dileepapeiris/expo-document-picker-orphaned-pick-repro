# getDocumentAsync never settles after a dismissing sheet, then rejects every later call (iOS)

Reproduction for https://github.com/expo/expo/issues/53827 on iOS.

Versions: Expo SDK 58 (`expo` 58.0.26), `expo-document-picker` 58.0.5, `expo-modules-core` 58.1.0,
`react-native` 0.88.1, New Architecture.
Recorded on the iPhone 17 Pro simulator, iOS 26.5, Xcode 27.2, 11/22/26.

## Run

```sh
npm install
npx expo run:ios   # development build, iOS simulator or device
```

## What the screen shows

Three buttons and a log. **1. Open sheet** presents a React Native `Modal` with
`presentationStyle="pageSheet"`. Inside the sheet, **2. Attach a file** closes the sheet and calls
`DocumentPicker.getDocumentAsync()` in the same tick, which is the pattern from the issue.
**3. Pick again** calls `getDocumentAsync()` from the root screen. Every call and its outcome is
appended to the log.

The switch at the top swaps how the attach button behaves:

| Switch | `2. Attach a file` |
| --- | --- |
| off (bug) | `setSheetVisible(false)` then `getDocumentAsync()` immediately, as in the issue |
| on (workaround) | `setSheetVisible(false)`, then `getDocumentAsync()` from the Modal's `onDismiss` |
