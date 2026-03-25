const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const mrtDataPath = path.join(__dirname, 'data', 'mrt.js');

let indexContent = fs.readFileSync(indexPath, 'utf8');
const mrtData = fs.readFileSync(mrtDataPath, 'utf8');

// 1. Inject MRT_DATA script at the top of the main script block
indexContent = indexContent.replace('<script>', `<script>\n${mrtData}\n`);

// 2. Replace the old hardcoded busLinesDataLocal
const startMarker = 'const busLinesDataLocal = [';
const endMarker = '];';
const startIndex = indexContent.indexOf(startMarker);
if (startIndex !== -1) {
    let bracketCount = 1;
    let endIndex = startIndex + startMarker.length;
    while (bracketCount > 0 && endIndex < indexContent.length) {
        if (indexContent[endIndex] === '[') bracketCount++;
        if (indexContent[endIndex] === ']') bracketCount--;
        endIndex++;
    }
    const oldBlock = indexContent.slice(startIndex, endIndex);
    indexContent = indexContent.replace(oldBlock, 'const busLinesDataLocal = MRT_DATA;');
}

// 3. Fix weather display function to use the backend
indexContent = indexContent.replace(
    /setTimeout\(\(\) => \{.*?document\.getElementById\('weather-display'\)\.innerHTML = '.*?';.*?\}, 1500\);/s,
    `fetch('http://localhost:3001/api/weather?city=Taipei')
        .then(r => r.json())
        .then(data => {
            document.getElementById('weather-display').innerHTML = \`<i class="ph-fill ph-cloud-sun text-yellow-400 text-sm"></i> \${data.condition} \${data.temp}°C\`;
        })
        .catch(() => {
            document.getElementById('weather-display').innerHTML = '<i class="ph-fill ph-sun text-yellow-400 text-sm"></i> 晴天 25°C';
        });`
);

// 4. Update Timezone
indexContent = indexContent.replace('Asia/Seoul', 'Asia/Taipei');
indexContent = indexContent.replace('(韓國時間)', '(台北時間)');

// 5. Fix Carousel Offset Bug (93% -> calc(90% + 12px))
indexContent = indexContent.replace(/track\.style\.transform = `translateX\(- \$\{slide \* 93\}%\)`/g, 'track.style.transform = `translateX(-${slide * (90 + 3)}%)`');

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('index.html localized successfully');
