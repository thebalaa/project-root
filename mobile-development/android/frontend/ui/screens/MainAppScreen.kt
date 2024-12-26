package com.example.androidfrontend.ui.screens

import androidx.compose.runtime.*
import com.example.androidfrontend.ui.screens.auth.LoginScreen
import com.example.androidfrontend.ui.screens.linker.DeviceLinkerScreen

@Composable
fun MainAppScreen() {
    var isAuthenticated by remember { mutableStateOf(false) }

    if (!isAuthenticated) {
        LoginScreen(onLoginSuccess = {
            isAuthenticated = true
        })
    } else {
        DeviceLinkerScreen()
    }
} 