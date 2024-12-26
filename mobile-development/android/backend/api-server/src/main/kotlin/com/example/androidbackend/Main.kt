package com.example.androidbackend

import io.ktor.server.engine.*
import io.ktor.server.netty.*
import com.example.androidbackend.plugins.configureRouting
import com.example.androidbackend.plugins.configureSerialization

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        configureSerialization()
        configureRouting()
    }.start(wait = true)
} 