import React from "react";
import {atom} from "recoil";

export const userNFTsState = atom({
    key: 'userNFTsState',
    default: [] as any
});
export const userTraitsState = atom({
    key: 'userTraitsState',
    default: [] as any
});
export const cdpState = atom({
    key: 'cdpState',
    default: [] as any
});
export const aiState = atom({
    key: 'aiState',
    default: [] as any
});
export const deviceState = atom({
    key: 'deviceState',
    default: [] as any
});
export const cdpHashlistState = atom({
    key: 'cdpHashlistState',
    default: [] as any
});
export const loadingState = atom({
    key: 'loadingState',
    default: true as Boolean
});
export const storeItemsState = atom({
    key: 'storeItemsState',
    default: [] as any
});
export const videoPlayingState = atom({
    key: 'videoPlayingState',
    default: true as Boolean
});
export const tokenBalanceState = atom({
    key: 'tokenBalanceState',
    default: {sol: 0, pltmx: 0} as any
})
export const selectedState = atom({
    key: 'selectedState',
    default: null as any
})
export const paymentOptionState = atom({
    key: 'paymentOptionState',
    default: "mango" as any
})
export const loadingNumberState = atom({
    key: 'loadingNumberState',
    default: 0
});
export const smoothiesHashlistState = atom({
    key: 'smoothiesHashlistState',
    default: 0
});