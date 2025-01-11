import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: [
    '@discordjs/voice',
    '@discordjs/opus',
    'opusscript',
    'ffmpeg-static',
    'prism-media'
  ],
  noExternal: [
    'debug',
    'discord.js'
  ]
}); 