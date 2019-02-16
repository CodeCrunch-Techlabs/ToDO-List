/** @format */

import { AppRegistry, YellowBox } from 'react-native';
import TodoListComponent from './components/TodoListComponent';
import { name as appName } from './app.json';
//react-native v0.57 or greater:
YellowBox.ignoreWarnings(['Remote debugger']);
//react-native v0.56 or below:
console.ignoredYellowBox = ['Remote debugger'];
AppRegistry.registerComponent(appName, () => TodoListComponent);