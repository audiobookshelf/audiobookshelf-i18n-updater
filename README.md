# audiobookshelf-i18n-updater
A GitHub action that validates the localization files are alphabetized and copies any missing keys from the English file.

The script which copies missing keys ensures there is a newline at the end of each file to prevent the last line from being marked as a change whenever additional lines are added.

The action will exit with an error if any localization files do not have keys in alphabetical order.

## Inputs

### `directory`

**Required** The directory where the localization files are kept. For example: `client/strings/`.

## Example Usage

```yaml
uses: audiobookshelf/audiobookshelf-i18n-updater
with:
  directory: 'client/strings/'
```

## Example Integration Workflow
This workflow can be used to validate that all language files are alphabetized.
Any language file being out of order will cause the workflow to throw an error.
The workflow will also throw an error if any keys exists in a language file and do not exist in the base file.
```yaml
name: Verify all i18n files are alphabetized

on:
  push:
  pull_request:
    paths:
      - client/strings/** # Should only check if any strings changed

jobs:
  update_translations:
    runs-on: ubuntu-latest
    steps:
    # Check out the repository
    - name: Checkout repository
      uses: actions/checkout@v4

    # Set up node to run the javascript
    - name: Set up node
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    # The only argument is the `directory`, which is where the i18n files are
    # stored.
    - name: Run Update JSON Files action
      uses: audiobookshelf/audiobookshelf-i18n-updater@v0.1.14
      with:
        directory: 'client/strings/'  # Adjust the directory path as needed
```

## Example Automatic Updates
This workflow runs on a commit action for the main branch to update localization files.
If any changes are made to a localization file by running this action, a new branch is made and a PR is opened with the updated localization files.
This workflow requires write access to the repository and for the workflow to be able to open PRs.

```yaml
name: Update JSON Files

on:
  push:
    branches:
      - main
      - master
    paths:
      - client/strings/** # Should only check if any strings changed

jobs:
  update_translations:
    runs-on: ubuntu-latest
    steps:

    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Set up node
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    # The only argument is the `directory`, which is where the i18n files are
    # stored.
    - name: Run Update JSON Files action
      uses: audiobookshelf/audiobookshelf-i18n-updater@v0.1.14
      with:
        directory: 'client/strings/'  # Adjust the directory path as needed

    # Does a git diff to see if any language files were changed from running
    # the script. This will be false if the local script was already ran
    # locally so no changes are needed for the language files.
    - name: Check diff of strings
      run: |
        if git diff --exit-code; then
          echo "CHANGED=false" >>${GITHUB_ENV}
        else
          echo "CHANGED=true" >>${GITHUB_ENV}
        fi


    # If changes were detected, create a branch with the changes and open
    # a PR to `main`. This requires changing the Workflow Permissions
    # to be "read and write" to create the branch and commit, and then
    # also need to enable "Allow GitHub actions to create and approve PR"
    # so the PR can actually be made. Also set up secrets for user email
    # name if anyone cares about that since it's available in git logs anyway.
    - name: If changes, commit and open PR
      if: ${{ env.CHANGED == 'true' }}
      run: |
        branch_name="update-strings-$(git log --format=%h -n 1)"
        git config user.email "${{secrets.USER_EMAIL}}"
        git config user.name "${{secrets.USER_NAME}}"
        git checkout -b $branch_name
        git add .
        git commit -m "Automatic update strings"
        git push origin $branch_name
        gh pr create -B main -H $branch_name --title 'Automatic translation updates' --body 'Created by GH Action. Can be ignored if there are other open translation PRs.'
      env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
