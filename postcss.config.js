module.exports = {
    plugins: {
        'postcss-import': {},
        // autoprefixer: {},
        'postcss-salad': {
            browsers: ['ie > 9', 'last 2 versions'],
            features: {
                bem: {
                    shortcuts: {
                        component: 'b',
                        modifier: 'm',
                        descendent: 'e'
                    },
                    separators: {
                        descendent: '__',
                        modifier: '--'
                    }
                }
            }
        }
    }
};
