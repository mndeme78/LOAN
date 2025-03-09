-- Create custom admin user
DO $$
DECLARE
  custom_admin_id uuid := gen_random_uuid();
BEGIN
  -- Check if custom admin user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fadhiliamani80@gmail.com') THEN
    -- Create custom admin user in auth.users
    INSERT INTO auth.users (
      id, email, raw_user_meta_data, raw_app_meta_data,
      aud, role, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token
    ) VALUES (
      custom_admin_id,
      'fadhiliamani80@gmail.com',
      '{"first_name":"Fadhili","last_name":"Amani"}',
      '{"provider":"email","providers":["email"]}',
      'authenticated',
      'authenticated',
      crypt('Neema1998', gen_salt('bf')),
      now(),
      now(),
      now(),
      ''
    );
    
    -- Create custom admin profile
    INSERT INTO public.profiles (id, email, first_name, last_name, role, status, created_at, updated_at)
    VALUES (
      custom_admin_id,
      'fadhiliamani80@gmail.com',
      'Fadhili',
      'Amani',
      'admin',
      'active',
      now(),
      now()
    );
  END IF;
END$$;