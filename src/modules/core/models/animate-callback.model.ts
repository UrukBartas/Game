export interface AnimateSettingsModel {
  startingDelay?: number;
  callback?: () => void;
  callbackTimeout?: number;
  // in case animationend trigger is not fired
  callbackSafeTimeout?: number;
}