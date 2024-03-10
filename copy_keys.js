const fs = require('fs');
const path = require('path');

function loadJSONFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

function saveJSONFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n'); // Updated to 2 spaces and appending newline
}

function updateJSONFiles(baseFileName, directory) {
    const baseFilePath = path.join(directory, baseFileName);
    const baseData = loadJSONFile(baseFilePath);

    // Sort the base data alphabetically by key (case insensitive)
    const sortedBaseData = {};
    Object.keys(baseData)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .forEach(key => {
            sortedBaseData[key] = baseData[key];
        });

    fs.readdirSync(directory).forEach(filename => {
        const filePath = path.join(directory, filename);
        if (filename.endsWith('.json') && filename !== baseFileName) {
            let otherData = loadJSONFile(filePath);

            // Copy missing fields from the base data
            for (const key in sortedBaseData) {
                if (!(key in otherData)) {
                    otherData[key] = sortedBaseData[key];
                }
            }

            // Sort the other data alphabetically by key (case insensitive)
            const sortedOtherData = {};
            Object.keys(otherData)
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .forEach(key => {
                    sortedOtherData[key] = otherData[key];
                });

            saveJSONFile(filePath, sortedOtherData);
        }
    });

    // Save the sorted base data to its file
    saveJSONFile(baseFilePath, sortedBaseData);
}

// Get command line arguments
const baseFileName = 'en-us.json';
const directory = process.env.INPUT_DIRECTORY;

// Example usage:
updateJSONFiles(baseFileName, directory);
