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

                // 💡 Clear buffer after open
                val buffer = ByteArray(64)
                while (read(buffer, 100) > 0) {
                    // Drain initial junk data
                }
            }

            promise.resolve("Connected to ${device.deviceName}")
        } catch (e: Exception) {
            Log.e("UsbSerialModule", "Connection failed", e)
            promise.reject("CONNECT_ERROR", "Error connecting to device: ${e.localizedMessage}", e)
        }
    }

    @ReactMethod
    fun disconnect(promise: Promise) {
        try {
            serialPort?.close()
            serialPort = null
            promise.resolve("Disconnected successfully")
        } catch (e: Exception) {
            Log.e("UsbSerialModule", "Disconnection failed", e)
            promise.reject("DISCONNECT_ERROR", "Error disconnecting: ${e.localizedMessage}", e)
        }
    }

    @ReactMethod
    fun isConnected(promise: Promise) {
        try {
            val connected = serialPort != null
            promise.resolve(connected)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", "Error checking connection: ${e.localizedMessage}")
        }
    }

    @ReactMethod
@ReactMethod
@ReactMethod
fun sendCommand(command: String, promise: Promise) {
    try {
        val port = serialPort ?: run {
            promise.reject("PORT_NULL", "Serial port is not connected.")
            return
        }

        // Clear any old data in buffer
        val drainBuffer = ByteArray(64)
        while (port.read(drainBuffer, 100) > 0) {
            // drain stale data
        }

        // Send command
        port.write(command.toByteArray(), 1000)
        Log.d("UsbSerialModule", "Command sent: $command")

        // Wait for response
        val buffer = ByteArray(64)
        val startTime = System.currentTimeMillis()
        val responseBuilder = StringBuilder()

        while (System.currentTimeMillis() - startTime < 3000) {
            val len = port.read(buffer, 200)
            if (len > 0) {
                val data = buffer.copyOfRange(0, len).toString(Charsets.UTF_8)
                responseBuilder.append(data)

                if (data.contains("\n") || data.contains("\r") || responseBuilder.length > 5) {
                    break // Stop reading once a newline or sufficient data is received
                }
            }
        }

        val response = responseBuilder.toString().trim()
        if (response.isNotEmpty()) {
            Log.d("UsbSerialModule", "Response received: $response")
            promise.resolve(response)
        } else {
            promise.reject("NO_RESPONSE", "No valid response received within timeout.")
        }

    } catch (e: Exception) {
        Log.e("UsbSerialModule", "Send command failed", e)
        promise.reject("SEND_ERROR", "Failed to send command: ${e.localizedMessage}", e)
    }
}

    

}
