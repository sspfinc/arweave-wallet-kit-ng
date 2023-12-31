# Arweave-Wallet-Kit-Ng

**_Arweave-Wallet-Kit-Ng_** is a remake of another project **_Arweave Wallet Kit_** designed to work with Angular Apps.

## Supported wallets

- [ArConnect](https://arconnect.io)
- [Arweave.app](https://arweave.app)
- [Othent](https://othent.io/)

## Installation

```sh
yarn add arweave-wallet-kit-ng
```

or

```sh
npm i arweave-wallet-kit-ng
```

## Peer Dependencies

```sh
# arconnect | arweave | arweave-wallet-connector | othent
yarn add arconnect@^0.4.2 arweave@^1.14.4 arweave-wallet-connector@^1.0.2 othent@^1.0.641

# @apollo/client | apollo-angular | graphql
yarn add @apollo/client@^3.0.0 apollo-angular@^5.0.0 graphql@^16.6.0
```

## Setup

Add the following into your **tsconfig.json** under **compilerOptions**.
This allows arweave-js to function.

```json
"allowSyntheticDefaultImports": true,
"paths": {
  "crypto": [
    "./node_modules/crypto-js"
  ],
  "@angular/*": [
    "./node_modules/@angular/*"
  ]
},
```

Import the global style sheet in your styles.scss.

```scss
@import "/node_modules/arweave-wallet-kit-ng/styles.scss";
```

Import `ArweaveWalletKitNgModule.forRoot()` In `AppModule` ( Creates A Singleton Service )

```ts
import { ArweaveWalletKitNgModule } from "arweave-wallet-kit-ng";
@NgModule({
  // Import ArweaveWalletKitNgModule with forRoot() Into Your AppModule
  imports: [ArweaveWalletKitNgModule.forRoot()],
})
export class AppModule {}
```

### Connect Button

![Screen Shot of Button Sizes](https://wm6hbzyln2g3qupwf7umqo6ge65pnst44x747zrrpfjeriybwjxq.arweave.net/szxw5wtujbhR9i_oyDvGJ7r2ynzl_8_mMXlSSKMBsm8)

```ts
// Import AWKConnectButtonModule where ever its needed.
import { AWKConnectButtonModule } from "arweave-wallet-kit-ng";
@NgModule({
  imports: [AWKConnectButtonModule],
})
```

```html
<!-- Default -->
<awk-connect-button></awk-connect-button>

<!-- Custom Label -->
<awk-connect-button [label]="'Connect'"></awk-connect-button>

<!-- Size ('xs', 'sm', 'md, 'lg, 'xl') -->
<awk-connect-button [size]="'xs'"></awk-connect-button>

<!-- Customize With Your Own HTML/CSS -->
<awk-connect-button custom>
  <div class="custom-button" style="color: blue; background: yellow;">My Custom Button</div>
</awk-connect-button>
```

### Connection Modal

![Screen Shot of Connection Modal](https://au72ufbh6btelgpo4yjuwzf4xma2nkvvgyzb4pjjcdm2y5hom6ba.arweave.net/BT-qFCfwZkWZ7uYTS2S8uwGmqrU2Mh49KRDZrHTuZ4I)

![Screen Shot of Resume Popup](https://d5222nknikgwnzmmb6z62s4bbzbo4cdrg5nhlzbqpmjo5yo2kk7q.arweave.net/H3WtNU1CjWbljA-z7UuBDkLuCHE3WnXkMHsS7uHaUr8)

```ts
// Import AWKConnectionModalModule where ever its needed.
import { AWKConnectionModalModule } from "arweave-wallet-kit-ng";
@NgModule({
  imports: [AWKConnectionModalModule],
})
```

```html
<!-- THIS IS THE CONNECTION MODAL -->
<awk-connection-modal
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
></awk-connection-modal>
```

### Profile Modal

![Screen Shot of Profile Modal](https://zcjdgnthyywkdb75bvyqqbxj6ib55vyl6eafwkgbt5g5vyj5ef5a.arweave.net/yJIzNmfGLKGH_Q1xCAbp8gPe1wvxAFsowZ9N2uE9IXo)

![Screen Shot of Profile Buttons](https://5dpgb5bgd6myxdirjkwxu2v7v337ddmgkouucrjizgjlgs2sguoq.arweave.net/6N5g9CYfmYuNEUqtemq_rvfxjYZTqUFFKMmSs0tSNR0)

```ts
// Import AWKProfileModalModule where ever its needed.
import { AWKProfileModalModule } from "arweave-wallet-kit-ng";
@NgModule({
  imports: [AWKProfileModalModule],
})
```

```html
<!-- Default -->
<awk-profile-modal></awk-profile-modal>

<!-- Size ('xs', 'sm', 'md, 'lg, 'xl') -->
<awk-profile-modal [size]="'xs'"></awk-profile-modal>
```

## Listening For Events

```ts
// Import ArweaveWalletKitNgService.
import { ArweaveWalletKitNgService, EVENT_CODES, formatAddress } from 'arweave-wallet-kit-ng';

// Inject It Into Your Component.
constructor(private arweaveWalletKitNgService: ArweaveWalletKitNgService){}

// Listening For Events
this.arweaveWalletKitNgService.eventEmitterObservable.subscribe(async (event) => {
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

  TRY_CONNECT = 1010,
  TRY_DISCONNECT = 1011,
  TRY_ACTIVE_ADDRESS = 1012,
  TRY_ALL_ACTIVE_ADDRESSES = 1013,
  TRY_SIGN = 1014,
  TRY_PERMISSIONS = 1015,
  TRY_WALLET_NAMES = 1016,
  TRY_ENCRYPT = 1017,
  TRY_DECRYPT = 1018,
  TRY_ARWEAVE_CONFIG = 1019,
  TRY_SIGNATURE = 1020,
  TRY_ACTIVE_PUBLIC_KEY = 1021,
  TRY_ADD_TOKEN = 1022,
  TRY_DISPATCH = 1023,
  TRY_RESUME = 1024,
  TRY_BALANCE = 1025,

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
  RESUME = 3014,
  BALANCE = 3015,

  ERROR = 5000,
  CONNECT_ERROR = 5001,
  DISCONNECT_ERROR = 5002,
  ACTIVE_ADDRESS_ERROR = 5003,
  ALL_ACTIVE_ADDRESSES_ERROR = 5004,
  SIGN_ERROR = 5005,
  PERMISSIONS_ERROR = 5006,
  WALLET_NAMES_ERROR = 5007,
  ENCRYPT_ERROR = 5008,
  DECRYPT_ERROR = 5009,
  ARWEAVE_CONFIG_ERROR = 5010,
  SIGNATURE_ERROR = 5011,
  ACTIVE_PUBLIC_KEY_ERROR = 5012,
  ADD_TOKEN_ERROR = 5013,
  DISPATCH_ERROR = 5014,
  RESUME_ERROR = 5015,
  BALANCE_ERROR = 5016,
```

## Custom Styling

If you don't want to use the default styling you can copy the styles.scss from /projects/arweave-wallet-kit-ng/styles.scss and bring it to your main applications assets directory and skip the step above telling your to import the style sheet.

## Change Log

### 2023-08-24

- Updated Service To Emit Try Events.
- Added Try Event Types Codes.
- Refactored SCSS To Include A Global Reset Wrapper.
- Refactored HTML based on CSS changes
- Listening For Try Events to Render UI.

### 2023-08-21

- Updated connection-button component.
- Updated connection-modal component.
- Added Profile Modal and Profile Button.
- Refactored ArweaveWebWallet.ts and Added specify disconnect functionality.
- Add balance function to retrieve balance using arweavejs.
- Removed component relative scss files.
- Refactored styles into /styles directory that build into styles.scss.

### 2023-08-17

- Created github workflow to publish package to npm.
- Modified directory structure for new components.
- Add Empty Templates for each of the components ( Connect-Button | Connection-Modal | Profile-Modal ).
- Created Connect Button Component with separate Module Load.
- Separated the component from the ar-kit-ng module so you can import on its owns.
- Modified the README.md with up to date information.

### 2023-08-16

- Added Connection Strategies from Arweave Wallet Kit! - Thanks @ropats16!
- New Event System ( LISTEN FOR INCOMING EVENTS AND REACT ACCORDINGLY )
- Refactored CSS with BEM naming convention.
- Refactored HTML to maintain better document structure.
- Modified the README.md with up to date information.

## TODO

- [x] Add Reconnect Popup for Arweave Web Wallet Page Refresh.
- [x] Add "Out of the Box" Connect Button.
- [x] Add "Out of the Box" Profile Modal.
- [x] Get Handle and Avatar from ArProfile.

## References

[Arweave Kit](https://www.arweavekit.com/)

[Arweave Kit (Github)](https://github.com/labscommunity/arweavekit)

[Arweave Wallet Kit (Github)](https://github.com/labscommunity/arweave-wallet-kit)
