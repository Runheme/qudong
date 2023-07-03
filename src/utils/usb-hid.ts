import {HID} from '../shims/node-hid';
import {usbDetect} from '../shims/usb-detection';
import type {Device, WebVIADevice} from '../types/types';

export {HID} from '../shims/node-hid';
export {usbDetect} from '../shims/usb-detection';

export async function scanDevices(
  forceRequest: boolean,
): Promise<WebVIADevice[]> {
  return HID.devices(forceRequest);
}

// TODO: 解决打字。这实际上返回一个HID对象，但如果您这样键入它，它会报错。
export function initAndConnectDevice({path}: Pick<Device, 'path'>): Device {
  const device = new HID.HID(path);
  return device;
}

export function startMonitoring() {
  usbDetect.startMonitoring();
}
