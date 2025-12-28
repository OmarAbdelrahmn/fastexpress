import { formatPlateNumber } from './src/lib/utils/formatters.js';

console.log("Input: أبج١٢٣٤");
const res1 = formatPlateNumber("أبج١٢٣٤");
console.log("Output: " + res1);
console.log("Hex chars: " + res1.split('').map(c => c.charCodeAt(0).toString(16)).join(' '));

console.log("Input: ABC1234");
const res2 = formatPlateNumber("ABC1234");
console.log("Output: " + res2);
