-- Create admin user if it doesn't exist
DO $$
DECLARE
  admin_id uuid;
  user_id uuid;
BEGIN
  -- Check if admin user exists
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@example.com';
  
  -- If admin doesn't exist, create one
  IF admin_id IS NULL THEN
    -- Create admin user in auth.users
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Admin","last_name":"User"}'
    )
    RETURNING id INTO admin_id;
    
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
  END IF;
  
  -- Check if demo user exists
  SELECT id INTO user_id FROM auth.users WHERE email = 'user@example.com';
  
  -- If demo user doesn't exist, create one
  IF user_id IS NULL THEN
    -- Create demo user in auth.users
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      'user@example.com',
      crypt('user123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Demo","last_name":"User"}'
    )
    RETURNING id INTO user_id;
    
    -- Create demo user profile
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
  END IF;
END$$;
