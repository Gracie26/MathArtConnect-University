import * as ImagePicker from 'expo-image-picker';

import type { AvatarFile } from '@/services/profile';
import { fail, ok, type ServiceResult } from '@/services/types';

/** Matches the storage bucket's 2 MB limit. */
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Opens the photo library for a square, compressed avatar. Must be called
 * directly from a button press (required on mobile web). Returns ok(null)
 * when the learner cancels.
 */
export async function pickAvatar(): Promise<ServiceResult<AvatarFile | null>> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return ok(null);
    const bytes = asset.fileSize ?? (asset.base64 ? Math.floor((asset.base64.length * 3) / 4) : 0);
    if (bytes > MAX_BYTES) return fail('validation', 'Please choose an image smaller than 2 MB.');
    return ok({ uri: asset.uri, base64: asset.base64 ?? null, mimeType: asset.mimeType ?? null });
  } catch (error) {
    return fail('unknown', 'Your photo library could not be opened.', error);
  }
}
