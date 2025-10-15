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
    const category = url.searchParams.get('category');
    const available_only = url.searchParams.get('available_only') === 'true';

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
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurant_id);

    if (category) {
      query = query.eq('category', category);
    }

    if (available_only) {
      query = query.eq('available', true);
    }

    const { data, error } = await query.order('category', { ascending: true });

    if (error) throw error;

    return createSuccessResponse(data || []);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
