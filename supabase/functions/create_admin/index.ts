import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

interface CreateAdminRequest {
  restaurant_id: string;
  name: string;
  email: string;
  password_hash: string;
  role?: 'owner' | 'manager';
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { restaurant_id, name, email, password_hash, role = 'manager' }: CreateAdminRequest = await req.json();

    // Validation
    if (!restaurant_id || !name || !email || !password_hash) {
      return createValidationErrorResponse('Missing required fields: restaurant_id, name, email, password_hash');
    }

    if (!email.includes('@')) {
      return createValidationErrorResponse('Invalid email format');
    }

    if (!['owner', 'manager'].includes(role)) {
      return createValidationErrorResponse('Invalid role. Must be "owner" or "manager"');
    }

    // Check if restaurant exists
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurant_id)
      .single();

    if (!restaurant) {
      return createNotFoundResponse('Restaurant');
    }

    // Check if admin with this email already exists for this restaurant
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return createValidationErrorResponse('Admin with this email already exists for this restaurant');
    }

    // Create admin
    const { data, error } = await supabase
      .from('admins')
      .insert([{ restaurant_id, name, email, password_hash, role }])
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse(data);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
