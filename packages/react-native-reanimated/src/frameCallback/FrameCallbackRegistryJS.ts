'use strict';
import { runOnUI } from 'react-native-worklets';

import type { FrameInfo } from './FrameCallbackRegistryUI';
import { prepareUIRegistry } from './FrameCallbackRegistryUI';

export default class FrameCallbackRegistryJS {
  private nextCallbackId = 0;

  constructor() {
    prepareUIRegistry();
  }

  registerFrameCallback(callback: (frameInfo: FrameInfo) => void): number {
    if (!callback) {
      return -1;
    }

    const callbackId = this.nextCallbackId;
    this.nextCallbackId++;

    runOnUI(() => {
      global._frameCallbackRegistry.registerFrameCallback(callback, callbackId);
    })();

    return callbackId;
  }

  unregisterFrameCallback(callbackId: number): void {
    runOnUI(() => {
      global._frameCallbackRegistry.unregisterFrameCallback(callbackId);
    })();
  }

  manageStateFrameCallback(callbackId: number, state: boolean): void {
    runOnUI(() => {
      global._frameCallbackRegistry.manageStateFrameCallback(callbackId, state);
    })();
  }
}
