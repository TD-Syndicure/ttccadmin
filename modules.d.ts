// declare namespace NodeJS {
//   export interface ProcessEnv {
//     USERNAME_ENCRYPT: string;
//     TRAITS_ENCRYPT: string;
//     API_KEY: string;
//     AUTH_DOMAIN: string;
//     PROJECT_ID: string;
//     STORAGE_BUCKET: string;
//     MESSAGING_SENDER_ID: string;
//     APP_ID: string;
//     MEASUREMENT_ID: string;
//   }
// }

// declare module '@gemworks/gem-farm-ts'

declare namespace NodeJS {
  export interface ProcessEnv {
    USERNAME_ENCRYPT: string;
    ARWEAVE_KEY: string
    TRAITS_STORE_ENCRYPT: string;
    API_KEY: string;
    AUTH_DOMAIN: string;
    PROJECT_ID: string;
    STORAGE_BUCKET: string;
    MESSAGING_SENDER_ID: string;
    APP_ID: string;
    MEASUREMENT_ID: string;
  }
}
declare module 'react-alert'