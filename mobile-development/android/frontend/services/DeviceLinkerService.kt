package com.example.androidfrontend.services

import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.client.call.*
import io.ktor.client.engine.okhttp.*

object DeviceLinkerService {
    private val client = HttpClient(OkHttp)

    suspend fun linkDevice(deviceName: String, callback: (String) -> Unit) {
        try {
            val response: String = client.post("http://10.0.2.2:8080/api/device-linker") {
                // Send deviceName
            }.body()
            callback(response)
        } catch (e: Exception) {
            callback("Error linking device: ${e.localizedMessage}")
        }
    }
} 