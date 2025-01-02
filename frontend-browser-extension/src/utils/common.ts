/**
 * Converts a buffer to a hexadecimal string.
 * 
 * @param buffer - The buffer to convert
 * @returns Hexadecimal string representation of the buffer
 */
export function bufferToHex(buffer: Uint8Array): string {
    return Array.from(buffer)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Converts a hexadecimal string to a buffer.
 * 
 * @param hex - The hexadecimal string to convert
 * @returns Uint8Array representation of the hexadecimal string
 */
export function hexToBuffer(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string');
    }
    const buffer = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        buffer[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return buffer;
}
