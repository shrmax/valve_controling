# 🚀 Valve Controller App (Expo Dev Client)

This is a custom [Expo](https://expo.dev) project created using [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) and migrated to use the **Expo Dev Client** for native module support.

> 🔧 Built for controlling valves via USB serial using STM32 and LoRa technology.

---

## 📦 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development build

This project uses a **custom Expo Dev Client** to support native modules like `usb-serial-for-android`.

```bash
npx expo start --dev-client
```

> Make sure you have the custom dev client installed on your device.

---

## 💠 Native Modules Used

* `usb-serial-for-android`: Native USB communication with STM32.
* Custom Kotlin module for serial communication integrated into the app.

> ⚠️ Expo Go will not work. This project **must be run with Expo Dev Client**.

---

## 📱 Running on Device or Emulator

To run on a physical Android device with native features:

```bash
npx expo run:android
```

To open on an emulator:

```bash
npx expo run:android --variant devClientDebug
```

Ensure:

* USB debugging is enabled.
* You’ve accepted permissions for USB device access.

---

## 📁 Project Structure

```
/app              → All screens & routes (uses Expo Router)
/android          → Native Android configuration
/ios              → (If applicable)
/usb              → Custom native module (Kotlin) for USB Serial
```

---

## 🔍 Troubleshooting

* **USB Permission Denied**: Ensure you’ve declared proper permissions in `AndroidManifest.xml`.
* **Build errors**: Make sure you're using Java 17+ and the correct Gradle version.
* **Expo Go fallback**: Not supported due to native modules.

---

## 📚 Resources

* [Expo Dev Client](https://docs.expo.dev/clients/introduction/)
* [Custom Native Modules](https://docs.expo.dev/modules/intro/)
* [usb-serial-for-android GitHub](https://github.com/mik3y/usb-serial-for-android)
* [STM32 USB CDC](https://www.st.com/en/embedded-software/stm32cubefw.html)

---

## 🧑‍💻 Contributors

* **Developers:** Shravan K, Rakshith R Poojary, Dinesh Raj Upadhya, Shetty Nimesh, Nishant U
* **Organization:** Ukshati Technologies

---

## 📝 License

This project is for internal internship and academic purposes.
