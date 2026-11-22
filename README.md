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

## Result

Each tap was sent as a mouse click on the simulator and the log read back from screenshots.
The app was relaunched before every run because the stuck state lasts for the life of the process.
"Fixed" runs use the same app with the change from the fix PR applied to
`node_modules/expo-document-picker/ios/DocumentPickerModule.swift`.

### A. Sheet closed and pick started in the same tick (buttons 1, 2, 3)

| Step | 58.0.5 as published | Fixed |
| --- | --- | --- |
| 2. Attach a file | Sheet closes, **no picker**, `pick 1` **never settles** | Sheet closes, no picker, `pick 1` pending |
| 3. Pick again | **Rejected**: `Different document picking in progress. Await other document picking first` | `pick 1` settles with `canceled=true`, picker appears, `pick 2` settles on close |
| Workaround switch on, buttons 1, 2, 3 | `onDismiss` fires, picker appears, both picks settle | same |

The first call is orphaned in both builds: the native call runs before the Modal starts to
dismiss, so the picker is presented on the sheet's view controller and torn down with it. The
fix cannot see that at call time. What changes is that the next call recovers instead of
rejecting forever.

### B. Native-stack modal screen popped under an open picker (buttons 4, 5, 3)

| Step | 58.0.5 as published | Fixed |
| --- | --- | --- |
| 5. Pick here, then go back | Picker appears over the modal screen; 2 s later both are gone, `pick 3` **never settles** | same |
| 3. Pick again | **Rejected** with the same error | `pick 3` settles with `canceled=true`, picker appears, `pick 2` settles on close |

Raw tap logs: `media/bug-same-tick.txt`, `media/fixed-same-tick.txt`,
`media/bug-modal-popped-under-picker.txt`, `media/fixed-modal-popped-under-picker.txt`,
`media/workaround-on-dismiss.txt`.
