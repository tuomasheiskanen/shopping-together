module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@stores': './src/stores',
          '@types': './src/types',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@navigation': './src/navigation',
        },
      },
    ],
  ],
};
