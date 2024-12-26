package com.example.androidfrontend.services

import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.client.call.*
import io.ktor.client.engine.okhttp.*

object AuthService {
    private val client = HttpClient(OkHttp)

    suspend fun login(username: String, password: String, callback: (Boolean) -> Unit) {
        try {
            val response: String = client.post("http://10.0.2.2:8080/api/login") {
                // Send credentials
            }.body()
            callback(response.contains("authenticated"))
        } catch (e: Exception) {
            callback(false)
        }
    }
} 