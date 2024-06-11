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
    /*
    const baseFilePath = path.join(directory, baseFileName);
    const baseData = loadJSONFile(baseFilePath);

    // Sort the base data alphabetically by key (case insensitive)
    const sortedBaseData = {};
    Object.keys(baseData)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .forEach(key => {
            sortedBaseData[key] = baseData[key];
        });
    */

    fs.readdirSync(directory).forEach(filename => {
        const filePath = path.join(directory, filename);
        if (filename.endsWith('.json')) {
            let otherData = loadJSONFile(filePath);

            // Check if keys are in alphabetical order
            const keys = Object.keys(otherData);
            for (let i = 1; i < keys.length; i++) {
                if (keys[i] < keys[i - 1]) {
                    throw new Error('Keys are not alphabetized in ' + filename);
                }
            }
        }
        /*
        if (filename.endsWith('.json') && filename !== baseFileName) {
            let otherData = loadJSONFile(filePath);

            // Check if there are keys in another langague that are not in the base English file
            for (const key in otherData) {
                if (!(key in sortedBaseData)) {
                    throw new Error(`Key '${key}' found in '${filename}' but not in '${baseFileName}' file`);
                }
            }

            // Copy missing fields from the base data
            for (const key in sortedBaseData) {
                if (!(key in otherData)) {
                    console.log(`Copying key '${key}' to '${filename}'`);
                    otherData[key] = sortedBaseData[key];
                }
            }

            const keys = Object.keys(otherData);
            // Sort the other data alphabetically by key (case insensitive)
            const sortedOtherData = {};
            keys.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .forEach(key => {
                    sortedOtherData[key] = otherData[key];
                });

            saveJSONFile(filePath, sortedOtherData);
        }
        */
    });

}

const directory = core.getInput('directory');

try {
    updateJSONFiles(`en-us.json`, directory);
    console.log("All files in alphabetical order");
} catch (error) {
    console.error(error.message);
    core.setFailed(error.message);
}
