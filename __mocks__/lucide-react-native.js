// Jest stub: lucide-react-native ships ESM (.mjs) that Jest does not transform.
// Every named icon renders as an empty View.
const React = require('react');
const { View } = require('react-native');

const Icon = (props) => React.createElement(View, { testID: props.testID });

module.exports = new Proxy({ __esModule: true }, { get: (target, key) => (key in target ? target[key] : Icon) });
