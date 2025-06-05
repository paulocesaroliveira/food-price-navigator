
-- Criar bucket para avatars se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket avatars
CREATE POLICY "Avatar upload for authenticated users" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Avatar update for own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Avatar read for all users" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars'
);

-- Adicionar coluna avatar_url na tabela profiles se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
