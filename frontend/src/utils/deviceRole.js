/** @param {{ owner_id?: number } | null} device */
export function isDeviceOwner(device, userId) {
  return device != null && userId != null && Number(device.owner_id) === Number(userId)
}
