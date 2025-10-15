import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse } from '../utils/response.ts';

interface CreateRestaurantRequest {
  name: string;
  email: string;
  password_hash: string;
  address?: string;
  phone?: string;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { name, email, password_hash, address, phone }: CreateRestaurantRequest = await req.json();

    // Validation
    if (!name || !email || !password_hash) {
      return createValidationErrorResponse('Missing required fields: name, email, password_hash');
    }

    if (!email.includes('@')) {
      return createValidationErrorResponse('Invalid email format');
    }

    // Check if restaurant with this email already exists
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('email', email)
      .single();

    if (existingRestaurant) {
      return createValidationErrorResponse('Restaurant with this email already exists');
    }

    // Create restaurant
    const { data, error } = await supabase
      .from('restaurants')
      .insert([{ name, email, password_hash, address, phone }])
      .select('id, name, email, address, phone, created_at')
      .single();

    if (error) throw error;

    return createSuccessResponse(data);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
