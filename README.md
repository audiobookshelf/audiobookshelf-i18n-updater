# audiobookshelf-i18n-updater
A GitHub action that validates the localization files are alphabetized and copies any missing keys from the English file.

## Inputs

### `directory`

**Required** The directory where the localization files are kept. For example: `client/strings/`.

## Example Usage

```yaml
uses: audiobookshelf/audiobookshelf-i18n-updater
with:
  directory: 'client/strings/'
```
