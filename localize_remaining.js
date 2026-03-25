const fs = require('fs');
const path = require('path');

const filesToLocalize = ['hotel.html', 'shopping.html', 'trip.html', 'S.html'];

filesToLocalize.forEach(fileName => {
    const srcPath = path.join(__dirname, `src_${fileName}`);
    const destPath = path.join(__dirname, fileName);

    if (!fs.existsSync(srcPath)) return;

    let content = fs.readFileSync(srcPath, 'utf8');

    // Global replacements for these informational pages
    content = content.replace(/釜山/g, '台灣');
    content = content.replace(/韓國/g, '台灣');
    content = content.replace(/Korea/g, 'Taiwan');
    content = content.replace(/Busan/g, 'Taiwan');
    content = content.replace(/Naver MAP/g, 'Google Maps');
    content = content.replace(/naver/g, 'google');

    // Specific cleanup
    if (fileName === 'hotel.html') {
        content = content.replace(/選擇區域與住宿類型，快速探索專屬推薦清單/g, '全台優質住宿推薦，從五星飯店到特色民宿');
    }

    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`${fileName} localized successfully`);
});
