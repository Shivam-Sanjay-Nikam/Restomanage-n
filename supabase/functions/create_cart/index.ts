import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

interface CreateCartRequest {
  restaurant_id: string;
  table_id: string;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { restaurant_id, table_id }: CreateCartRequest = await req.json();

    // Validation
    if (!restaurant_id || !table_id) {
      return createValidationErrorResponse('Missing required fields: restaurant_id, table_id');
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

    // Check if table exists and belongs to restaurant
    const { data: table } = await supabase
      .from('tables')
      .select('id, restaurant_id')
      .eq('id', table_id)
      .single();

    if (!table) {
      return createNotFoundResponse('Table');
    }

    if (table.restaurant_id !== restaurant_id) {
      return createValidationErrorResponse('Table does not belong to this restaurant');
    }

    // Check if there's already an active cart for this table
    const { data: existingCart } = await supabase
      .from('carts')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .eq('table_id', table_id)
      .eq('status', 'active')
      .single();

    if (existingCart) {
      return createValidationErrorResponse('Active cart already exists for this table');
    }

    // Create cart
    const { data, error } = await supabase
      .from('carts')
      .insert([{ restaurant_id, table_id, status: 'active' }])
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse(data);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
