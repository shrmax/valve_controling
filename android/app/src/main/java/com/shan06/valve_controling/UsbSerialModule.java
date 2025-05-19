package com.shan06.valve_controling;

import android.content.Context;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;

public class UsbSerialModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public UsbSerialModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "UsbSerialModule";
    }

    @ReactMethod
    public void listDevices(Promise promise) {
        try {
            UsbManager manager = (UsbManager) reactContext.getSystemService(Context.USB_SERVICE);
            HashMap<String, UsbDevice> deviceList = manager.getDeviceList();
            if (deviceList.isEmpty()) {
                promise.resolve("No USB devices found.");
            } else {
                StringBuilder result = new StringBuilder();
                for (UsbDevice device : deviceList.values()) {
                    result.append(device.getDeviceName()).append("\n");
                }
                promise.resolve(result.toString());
            }
        } catch (Exception e) {
            promise.reject("USB_ERROR", e);
        }
    }
}
