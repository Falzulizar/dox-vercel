//DOX//HELPER.JS
const fs = require('fs');
const path = require('path');
const os = require('os');

const helper = {
    generateTxtFile: (chatId, categoryName, listNumbers) => {
    try {
const tempDir = os.tmpdir();
const fileName = `Hasil_${categoryName}_${chatId}_${Date.now()}.txt`;
const filePath = path.join(tempDir, fileName);

const fileContent = listNumbers.join('\n');
      fs.writeFileSync(filePath, fileContent, 'utf-8');

    return filePath;
    } catch (error) {
    console.error('\x1b[31m%s\x1b[0m',
                  '[x] GAGAL MEMBUAT FILE TXT TEMPORER:', error);
    return null;
        }
    },

    cleanUpFile: (filePath) => {
    try {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); 
    }
    } catch (error) {
    console.error('\x1b[31m%s\x1b[0m',
                  '[x] GAGAL MENGHAPUS FILE SISA:', error); }
    }
};

module.exports = helper;

