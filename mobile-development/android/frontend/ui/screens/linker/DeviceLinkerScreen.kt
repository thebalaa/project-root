package com.example.androidfrontend.ui.screens.linker

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.androidfrontend.services.DeviceLinkerService

@Composable
fun DeviceLinkerScreen() {
    var deviceName by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Device Linker")
        OutlinedTextField(
            value = deviceName,
            onValueChange = { deviceName = it },
            label = { Text("Device Name") }
        )
        Button(onClick = {
            DeviceLinkerService.linkDevice(deviceName) { response ->
                message = response
            }
        }) {
            Text("Link Device")
        }

        Text(text = message, modifier = Modifier.padding(top = 16.dp))
    }
} 