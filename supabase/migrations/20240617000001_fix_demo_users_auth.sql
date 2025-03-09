-- Create admin and user accounts directly in auth.users table
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
  user_id uuid := gen_random_uuid();
BEGIN
  -- First clean up any existing demo accounts
  DELETE FROM auth.users WHERE email IN ('admin@example.com', 'user@example.com');
  DELETE FROM public.profiles WHERE email IN ('admin@example.com', 'user@example.com');
  
  -- Create admin user directly with password hash
  INSERT INTO auth.users (
    id, email, raw_user_meta_data, raw_app_meta_data,
    aud, role, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token
  ) VALUES (
    admin_id,
    'admin@example.com',
    '{"first_name":"Admin","last_name":"User"}',
    '{"provider":"email","providers":["email"]}',
    'authenticated',
    'authenticated',
    '$2a$10$EgxJvGtDHpZBs0TvOKTQeOXAFQnKUAEMhJkALKCOdMnOArZGKUWTy', -- This is 'admin123'
    now(),
    now(),
    now(),
    ''
  );
  
  -- Create admin profile
  INSERT INTO public.profiles (id, email, first_name, last_name, role, status, created_at, updated_at)
  VALUES (
    admin_id,
    'admin@example.com',
    'Admin',
    'User',
    'admin',
    'active',
    now(),
    now()
  );
  
  -- Create user account directly with password hash
  INSERT INTO auth.users (
    id, email, raw_user_meta_data, raw_app_meta_data,
    aud, role, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token
  ) VALUES (
    user_id,
    'user@example.com',
    '{"first_name":"Demo","last_name":"User"}',
    '{"provider":"email","providers":["email"]}',
    'authenticated',
    'authenticated',
    '$2a$10$EgxJvGtDHpZBs0TvOKTQeOXAFQnKUAEMhJkALKCOdMnOArZGKUWTy', -- This is 'admin123' (we'll use same password for simplicity)
    now(),
    now(),
    now(),
    ''
  );
  
  -- Create user profile
  INSERT INTO public.profiles (id, email, first_name, last_name, role, status, created_at, updated_at)
  VALUES (
    user_id,
    'user@example.com',
    'Demo',
    'User',
    'user',
    'active',
    now(),
    now()
  );

END$$;