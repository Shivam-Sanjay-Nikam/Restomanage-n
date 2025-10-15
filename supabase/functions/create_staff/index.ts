import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

interface CreateStaffRequest {
  restaurant_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'waiter' | 'chef' | 'cashier';
  active?: boolean;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { restaurant_id, name, email, password_hash, role, active = true }: CreateStaffRequest = await req.json();

    // Validation
    if (!restaurant_id || !name || !email || !password_hash || !role) {
      return createValidationErrorResponse('Missing required fields: restaurant_id, name, email, password_hash, role');
    }

    if (!email.includes('@')) {
      return createValidationErrorResponse('Invalid email format');
    }

    if (!['waiter', 'chef', 'cashier'].includes(role)) {
      return createValidationErrorResponse('Invalid role. Must be "waiter", "chef", or "cashier"');
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

    // Check if staff with this email already exists for this restaurant
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .eq('email', email)
      .single();

    if (existingStaff) {
      return createValidationErrorResponse('Staff with this email already exists for this restaurant');
    }

    // Create staff
    const { data, error } = await supabase
      .from('staff')
      .insert([{ restaurant_id, name, email, password_hash, role, active }])
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse(data);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
