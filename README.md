# Arweave-Wallet-Kit-Ng | Capsl8

## Introduction

Arweave-Wallet-Kit-Ng is an angular remake of another project `Arweave Wallet Kit` designed to work with Angular Apps.

## Usage

### Import `ArKitNgModule.forRoot()` In `AppModule` ( Creates A Singleton Service )

```ts
import { ArKitNgModule } from "ArKitNg";
@NgModule({
  // Import ArKitNgModule with forRoot() Into Your AppModule
  imports: [ArKitNgModule.forRoot()],
})
export class AppModule {}
```

### Connect Button

![Screen Shot of Button Sizes](https://raw.githubusercontent.com/sspfinc/ArKitNg/main/images/ConnectButtons.png)

```ts
// Import AKNConnectButtonModule where ever its needed.
import { AKNConnectButtonModule } from "ArKitNg";
@NgModule({
  imports: [AKNConnectButtonModule],
})
```

```html
<!-- Default -->
<akn-connect-button></akn-connect-button>

<!-- Custom Label -->
<akn-connect-button [label]="'Connect'"></akn-connect-button>

<!-- Size ('xs', 'sm', 'md, 'lg, 'xl') -->
<akn-connect-button [size]="'xs'"></akn-connect-button>

<!-- Customize With Your Own HTML/CSS -->
<akn-connect-button custom>
  <div class="custom-button" style="color: blue; background: yellow;">My Custom Button</div>
</akn-connect-button>
```

### Connection Modal

![Screen Shot of Button Sizes](https://raw.githubusercontent.com/sspfinc/ArKitNg/main/images/ConnectionModal.png)

```ts
// Import AKNConnectionModalModule where ever its needed.
import { AKNConnectionModalModule } from "ArKitNg";
@NgModule({
  imports: [AKNConnectionModalModule],
})
```

```html
<!-- THIS IS THE CONNECTION MODAL -->
<akn-connection-modal
  [appInfo]="{ name: '<APP NAME>', logo: '<LOGO URL>' }"
  [permissions]="[
    'ACCESS_ADDRESS',
    'ACCESS_PUBLIC_KEY',
    'ACCESS_ALL_ADDRESSES',
    'SIGN_TRANSACTION',
    'ENCRYPT',
    'DECRYPT',
    'SIGNATURE',
    'ACCESS_ARWEAVE_CONFIG',
    'DISPATCH'
  ]"
></akn-connection-modal>
```

### Profile Modal

```ts
// Import AKNProfileModalModule where ever its needed.
import { AKNProfileModalModule } from "ArKitNg";
@NgModule({
  imports: [AKNProfileModalModule],
})
```

### Listen For Events

```ts
// Import ArKitNgService.
import { ArKitNgService, EVENT_CODES, formatAddress } from 'ArKitNg';

// Inject It Into Your Component.
constructor(private arKitNg: ArKitNgService){}

// Listening For Events
this.arKitNg.eventEmitterObservable.subscribe(async (event) => {
  switch (event.code) {

    case EVENT_CODES.READY:
      // Do Something After Ready ( PAGE RELOAD AND CONNECTED )
      break;

    case EVENT_CODES.CONNECT:
      // Do Something After Connect
      break;

    case EVENT_CODES.DISCONNECT:
      // Do Something After Disconnect
      break;
  }
});

```

### Event Codes

```ts
  READY = 1000,
  MODAL = 1001,
  CAN_RESUME = 1002,

  CONNECT = 3000,
  DISCONNECT = 3001,
  ACTIVE_ADDRESS = 3002,
  ALL_ACTIVE_ADDRESSES = 3003,
  SIGN = 3004,
  PERMISSIONS = 3005,
  WALLET_NAMES = 3006,
  ENCRYPT = 3007,
  DECRYPT = 3008,
  ARWEAVE_CONFIG = 3009,
  SIGNATURE = 3010,
  ACTIVE_PUBLIC_KEY = 3011,
  ADD_TOKEN = 3012,
  DISPATCH = 3013,
  RESUME = 30014,

  ERROR = 5000,
  RESUME_ERROR = 5001,
  CONNECT_ERROR = 5002,
  DISCONNECT_ERROR = 5003,
  ACTIVE_ADDRESS_ERROR = 5004,
  ALL_ACTIVE_ADDRESSES_ERROR = 5005,
  SIGN_ERROR = 5006,
  PERMISSIONS_ERROR = 5007,
  WALLET_NAMES_ERROR = 5008,
  ENCRYPT_ERROR = 5009,
  DECRYPT_ERROR = 5010,
  ARWEAVE_CONFIG_ERROR = 5011,
  SIGNATURE_ERROR = 5012,
  ACTIVE_PUBLIC_KEY_ERROR = 5013,
  ADD_TOKEN_ERROR = 5014,
  DISPATCH_ERROR = 5015,
```

## Change Log

- `2023-08-17` - Modified directory structure for new components.
- `2023-08-17` - Add Empty Templates for each of the components ( Connect-Button | Connection-Modal | Profile-Modal ).
- `2023-08-17` - Created Connect Button Component with separate Module Load.
- `2023-08-17` - Separated the component from the ar-kit-ng module so you can import on its owns.
- `2023-08-17` - Modified the README.md with up to date information.

- `2023-08-16` - Added Connection Strategies from Arweave Wallet Kit! - Thanks @ropats16!
- `2023-08-16` - New Event System ( LISTEN FOR INCOMING EVENTS AND REACT ACCORDINGLY )
- `2023-08-16` - Refactored CSS with BEM naming convention.
- `2023-08-16` - Refactored HTML to maintain better document structure.
- `2023-08-16` - Modified the README.md with up to date information.

## TODO

- [ ] Add Reconnect Popup for ArweaveWebWallet Page Refresh.
- [x] Add "Out of the Box" Connect Button.
- [ ] Add "Out of the Box" Profile Modal.

## References

[Arweave Kit](https://www.arweavekit.com/)

[Arweave Kit (Github)](https://github.com/labscommunity/arweavekit)

[Arweave Wallet Kit (Github)](https://github.com/labscommunity/arweave-wallet-kit)
