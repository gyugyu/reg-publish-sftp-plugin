# reg-publish-sftp-plugin

reg-suit plugin to fetch and publish snapshot images using SFTP.

## Installation

```bash
npm install reg-publish-sftp-plugin --save-dev
npx reg-suit prepare --plugin publish-sftp
```

## Authentication

You can log in the SFTP server with SSH private key authentication or password authentication.

### Environmental variables (Recommended)

Choose one of the items below.

```bash
export SFTP_PASSWORD=xxxxxxxx
export SFTP_PRIVATE_KEY_PATH=xxxxxxx
export SFTP_PRIVATE_KEY=xxxxxxx
```

### `regconfig.json`

```json
{
  // ...
  "reg-plugin-sftp-plugin": {
    // ...
    "password": "xxxxxxxxx"
  }
}
```
