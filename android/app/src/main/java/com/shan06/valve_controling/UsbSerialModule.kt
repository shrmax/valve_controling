package com.shan06.valve_controling

import android.app.PendingIntent
import android.content.*
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.util.Log
import com.facebook.react.bridge.*
import com.hoho.android.usbserial.driver.UsbSerialDriver
import com.hoho.android.usbserial.driver.UsbSerialPort
import com.hoho.android.usbserial.driver.UsbSerialProber

class UsbSerialModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val ACTION_USB_PERMISSION = "com.shan06.USB_PERMISSION"
    }

    private var serialPort: UsbSerialPort? = null

    override fun getName(): String = "UsbSerialModule"

    @ReactMethod
    fun listDevices(promise: Promise) {
        try {
            val manager = reactContext.getSystemService(Context.USB_SERVICE) as UsbManager
            val availableDrivers = UsbSerialProber.getDefaultProber().findAllDrivers(manager)

            if (availableDrivers.isEmpty()) {
                promise.resolve("No USB devices found.")
                return
            }

            val devicesList = availableDrivers.joinToString("\n") { it.device.deviceName }
            promise.resolve(devicesList)
        } catch (e: Exception) {
            Log.e("UsbSerialModule", "Error listing devices", e)
            promise.reject("USB_LIST_ERROR", "Error listing devices: ${e.localizedMessage}", e)
        }
    }

    @ReactMethod
    fun connect(promise: Promise) {
        try {
            val manager = reactContext.getSystemService(Context.USB_SERVICE) as UsbManager
            val availableDrivers = UsbSerialProber.getDefaultProber().findAllDrivers(manager)

            if (availableDrivers.isEmpty()) {
                promise.reject("NO_DEVICES", "No USB devices found.")
                return
            }

            val driver = availableDrivers[0]
            val device: UsbDevice = driver.device

            if (!manager.hasPermission(device)) {
                val permissionIntent = PendingIntent.getBroadcast(
                    reactContext,
                    0,
                    Intent(ACTION_USB_PERMISSION),
                    PendingIntent.FLAG_IMMUTABLE
                )
                manager.requestPermission(device, permissionIntent)
                promise.reject("NO_PERMISSION", "Requested permission, please try again once granted.")
                return
            }

            val connection = manager.openDevice(device)
            if (connection == null) {
                promise.reject("CONNECTION_FAILED", "Failed to open device connection.")
                return
            }

            // Close any previous port
            serialPort?.apply {
                try {
                    close()
                } catch (e: Exception) {
                    Log.w("UsbSerialModule", "Failed to close previous port: ${e.localizedMessage}")
                }
            }

            serialPort = driver.ports[0].apply {
                open(connection)
    setParameters(9600, 8, UsbSerialPort.STOPBITS_1, UsbSerialPort.PARITY_NONE)

    // 💡 Clear the buffer after opening
    val buffer = ByteArray(64)
    while (read(buffer, 100) > 0) {
        // Just clearing leftover data, do nothing with it
    }
            }

            promise.resolve("Connected to ${device.deviceName}")
        } catch (e: Exception) {
            Log.e("UsbSerialModule", "Connection failed", e)
            promise.reject("CONNECT_ERROR", "Error connecting to device: ${e.localizedMessage}", e)
        }
    }

    private val usbReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val action = intent.action
            if (ACTION_USB_PERMISSION == action) {
                synchronized(this) {
                    val device = intent.getParcelableExtra<UsbDevice>(UsbManager.EXTRA_DEVICE)
                    if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                        device?.apply {
                            // You can connect here if needed
                            Log.d("USB", "Permission granted for device $device")
                        }
                    } else {
                        Log.d("USB", "Permission denied for device $device")
                    }
                }
            }
        }
    }

    init {
        val filter = IntentFilter(ACTION_USB_PERMISSION)
        reactContext.registerReceiver(usbReceiver, filter,
        Context.RECEIVER_NOT_EXPORTED)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        reactContext.unregisterReceiver(usbReceiver)
    }

    @ReactMethod
@ReactMethod
fun sendCommand(command: String, promise: Promise) {
    val port = serialPort
    if (port == null) {
        promise.reject("PORT_NULL", "Serial port is not connected.")
        return
    }

    try {
        // Flush stale data before sending a new command
        val flushBuffer = ByteArray(256)
        while (port.read(flushBuffer, 200) > 0) {
            // Discard stale data
        }

        // Write the command
        val data = command.toByteArray()
        port.write(data, 2000)

        // Read the response
        val responseBuffer = StringBuilder()
        val buffer = ByteArray(256)
        val startTime = System.currentTimeMillis()
        val timeout = 5000L // 5-second timeout

        var bytesRead: Int
        while (System.currentTimeMillis() - startTime < timeout) {
            bytesRead = port.read(buffer, 200)
            if (bytesRead > 0) {
                val chunk = String(buffer, 0, bytesRead)
                responseBuffer.append(chunk)
                // Assuming the response ends with a newline character
                if (chunk.contains("\n")) {
                    break
                }
            }
            // Add a small delay to prevent busy-waiting
            Thread.sleep(50)
        }

        val response = responseBuffer.toString().trim()
        if (response.isNotEmpty()) {
            promise.resolve(response)
        } else {
            promise.reject("NO_RESPONSE", "No acknowledgment received from the device within the timeout period.")
        }
    } catch (e: Exception) {
        promise.reject("SEND_COMMAND_ERROR", "Failed to send command: ${e.message}", e)
    }
}


}
