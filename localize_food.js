const fs = require('fs');
const path = require('path');

const foodPath = path.join(__dirname, 'food.html');
const foodDataPath = path.join(__dirname, 'data', 'food.js');

let content = fs.readFileSync(foodPath, 'utf8');
const foodData = fs.readFileSync(foodDataPath, 'utf8');

// 1. Inject food data script
content = content.replace('<script>', `<script>\n${foodData}\n`);

// 2. Replace the old database with window.TAIWAN_FOOD_DB
const startMarker = 'const db = {';
const endMarker = '};';
const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
    let braceCount = 1;
    let endIndex = startIndex + startMarker.length;
    while (braceCount > 0 && endIndex < content.length) {
        if (content[endIndex] === '{') braceCount++;
        if (content[endIndex] === '}') braceCount--;
        endIndex++;
    }
    const oldBlock = content.slice(startIndex, endIndex);
    content = content.replace(oldBlock, 'const db = window.TAIWAN_FOOD_DB;');
}

// 3. Global Text Replacements
content = content.replace(/釜山美食/g, '台灣美食');
content = content.replace(/釜山/g, '台灣');
content = content.replace(/Naver MAP/g, 'Google Maps');
content = content.replace(/需下載APP，韓國建議使用/g, '本地導航首選');
content = content.replace(/naver/g, 'google'); // map links

fs.writeFileSync(foodPath, content, 'utf8');
console.log('food.html localized successfully');
