module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Enable CSS minification and optimization in production
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeUnicode: false,
        }]
      }
    } : {})
  },
}
