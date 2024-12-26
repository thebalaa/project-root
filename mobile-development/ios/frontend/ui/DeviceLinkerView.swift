import SwiftUI

struct DeviceLinkerView: View {
    @State private var deviceName = ""
    @State private var isLinked = false
    
    var body: some View {
        VStack(spacing: 16) {
            Text("Device Linker")
                .font(.title2)
            TextField("Device Name", text: $deviceName)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            Button("Link Device") {
               // Example: call backend endpoint /api/device-linker
               // On success:
               isLinked = true
            }
            .padding()
            
            if isLinked {
                Text("Device \(deviceName) linked successfully!")
                    .foregroundColor(.green)
            }
        }
        .padding()
    }
} 