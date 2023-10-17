# Direct patches to the JupyterLite distribution

## Overview

This directory contains patches to the JupyterLite distribution.
They may include custom scripts ran at page loads, custom CSS or other assets.

These patches are applied after the `jupyter lite build` command via `patch.py` script,
which is located in the main `jupyterlite` directory.

Two environment variables are used to control the patching process:

* `PATCHES_DIRECTORY` - the directory containing the patches (default: `patches`)
* `TARGET_DIRECTORY` - the directory containing the JupyterLite distribution (default: `public`)

Atomic patch operations are defined in the `operations.json` file.
Currently, the following operations are supported:

```json
{
  "delete": [
    ... list of files to delete (paths relative to TARGET_DIRECTORY)
    Example: "src/extension.js"
  ],
  "copy": {
    ... map of files to copy (paths relative to PATCHES_DIRECTORY)
    Example: "src/extension.js": "extension.js"
  }
}
```
