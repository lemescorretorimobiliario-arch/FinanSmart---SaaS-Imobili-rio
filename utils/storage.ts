import { supabase } from './supabaseClient';

/**
 * Uploads a profile image (avatar or cover) to Supabase Storage.
 * It uses a folder structure 'userId/fileName' to ensure organization and security policies.
 */
export const uploadImage = async (
  userId: string, 
  file: File, 
  bucket: 'avatars' | 'covers' = 'avatars'
): Promise<string> => {
  
  // SECURITY: Sanitize filename to prevent weird characters or path traversal attempts
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  
  // Whitelist allowed extensions
  const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  if (!fileExt || !allowedExts.includes(fileExt)) {
     throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.');
  }

  // Create a clean filename
  const cleanFileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${cleanFileName}`;

  // 1. Upload
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Erro no upload: ${uploadError.message}`);
  }

  // 2. Get Public URL
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};