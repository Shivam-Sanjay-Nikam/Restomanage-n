import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const url = new URL(req.url);
    const restaurant_id = url.searchParams.get('restaurant_id');
    const status = url.searchParams.get('status');

    // Validation
    if (!restaurant_id) {
      return createValidationErrorResponse('Missing required parameter: restaurant_id');
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

    // Build query
    let query = supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurant_id);

    if (status) {
      if (!['available', 'occupied', 'reserved'].includes(status)) {
        return createValidationErrorResponse('Invalid status. Must be "available", "occupied", or "reserved"');
      }
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('table_number', { ascending: true });

    if (error) throw error;

    return createSuccessResponse(data || []);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
