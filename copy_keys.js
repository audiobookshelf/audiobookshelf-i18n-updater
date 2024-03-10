const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

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

    let isSorted = true;

    console.log("In updateJSONFiles");

    // Sort the base data alphabetically by key (case insensitive)
    const sortedBaseData = {};
    Object.keys(baseData)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .forEach(key => {
            sortedBaseData[key] = baseData[key];
        });

    fs.readdirSync(directory).forEach(filename => {
        const filePath = path.join(directory, filename);
        if (filename.endsWith('.json')) {
            let otherData = loadJSONFile(filePath);

            // Check if keys are in alphabetical order
            const keys = Object.keys(otherData);
            for (let i = 1; i < keys.length; i++) {
                if (keys[i].toLowerCase() < keys[i - 1].toLowerCase()) {
                    isSorted = false;
                    break;
                }
            }
        }
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
            keys.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .forEach(key => {
                    sortedOtherData[key] = otherData[key];
                });

            saveJSONFile(filePath, sortedOtherData);
        }
    });

    if (!isSorted) {
        return 1; // Keys not in alphabetical order
    } else {
        return 0; // All files are in alphabetical order
    }
}

const directory = core.getInput('directory');

console.log("Printing the directory");
console.log(directory);

const resultCode = updateJSONFiles(`en-us.json`, directory);
console.log("Result Code: ", resultCode);

// Check if keys were not in alphabetical order
if (resultCode == 1) {
    console.log("Files are not alphabetized");
    core.setFailed('Keys are not alphabetized');
}
