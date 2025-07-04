# Password Manager

Secure password management application that requires no server connection. Your sensitive data is encrypted on your device, stored securely within your file system and local data.

> This repo does not include the local encryption logic or private data used in app.

## Core Features

- No account required to register.
- No server or connection needed.
- Manual backup with encrypted file and recovery key.
- Supports subaddressing (e.g., example+subaddress@gmail.com).
- Friendly UI.

## Supported Platforms

### MacOS

<table>
  <tr>
    <th>Intel</th>
    <td>✅ (.dmg)</td>
  </tr>
  <tr>
    <th>arm64</th>
    <td>✅ (.dmg)</td>
  </tr>
</table>

### Windows

<table>
  <tr>
    <th>x64</th>
    <td>✅ (.exe)</td>
  </tr>
  <tr>
    <th>arm64</th>
    <td> - </td>
  </tr>
</table>

### Linux

<table>
  <tr>
    <th></th>
    <th>Debian</th>
    <th>Red Hat</th>
  </tr>
  <tr>
    <th>x64</th>
    <td>✅ (.deb)</td>
    <td>✅ (.rpm)</td>
  </tr>
  <tr>
    <th>arm64</th>
    <td> - </td>
    <td> - </td>
  </tr>
</table>

## After Installation

Since this app was built for personal use, I did not apply any code signing (which requires developer enrollment). Therefore, when you run the app for the first time, you will receive a warning.

You will need to grant permission to run the app when this warning appears.

### On MacOS

On macOS, you cannot run this app unless you grant permission using the following command in the Terminal:

```bash
xattr -cr /Applications/password-manager.app
```