-- Fix demo users by ensuring they exist with correct credentials
DO $$
DECLARE
  admin_id uuid;
  user_id uuid;
BEGIN
  -- Delete existing demo users if they exist
  DELETE FROM auth.users WHERE email IN ('admin@example.com', 'user@example.com');
  
  -- Create admin user with explicit UUID
  admin_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (
    admin_id,
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Admin","last_name":"User"}'
  );
  
  -- Create admin profile
  DELETE FROM public.profiles WHERE email = 'admin@example.com';
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
  
  -- Create demo user with explicit UUID
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (
    user_id,
    'user@example.com',
    crypt('user123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Demo","last_name":"User"}'
  );
  
  -- Create demo user profile
  DELETE FROM public.profiles WHERE email = 'user@example.com';
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