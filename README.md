# getDocumentAsync never settles after its presenter is dismissed, then rejects every later call (iOS)

Reproduction for https://github.com/expo/expo/issues/53827 on iOS, with two ways into the stuck
state and a run against the fix.

Versions: Expo SDK 58 (`expo` 58.0.26), `expo-document-picker` 58.0.5, `expo-modules-core` 58.1.0,
`react-native` 0.88.1, `@react-navigation/native-stack` 7.21.1, `react-native-screens` 4.30.1,
New Architecture.
Recorded on the iPhone 17 Pro simulator, iOS 26.5, Xcode 27.2, 11/22/26.

## Run

```sh
npm install
npx expo run:ios   # development build, iOS simulator or device
```

## What the screen shows

A home screen in a native stack with a switch, three buttons and a log. Every
`getDocumentAsync()` call and its outcome is appended to the log.

| Button | What it does |
| --- | --- |
| 1. Open sheet | Presents a React Native `Modal` with `presentationStyle="pageSheet"` |
| 2. Attach a file (in the sheet) | `setSheetVisible(false)` and `getDocumentAsync()` in the same tick, the pattern from the issue |
| 3. Pick again | `getDocumentAsync()` from the home screen |
| 4. Open modal screen | Pushes a native-stack screen with `presentation: 'modal'` |
| 5. Pick here, then go back (in the modal screen) | `getDocumentAsync()`, then `navigation.goBack()` 2 s later while the picker is up |

The switch changes **2. Attach a file** to defer the pick to the Modal's `onDismiss` instead of
calling it in the same tick.
