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
    const table_id = url.searchParams.get('table_id');
    const status = url.searchParams.get('status');
    const limit = url.searchParams.get('limit');

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
      .from('orders')
      .select(`
        *,
        table:tables(*),
        cart:carts(
          cart_items(
            *,
            menu_item:menu_items(*)
          )
        ),
        staff:staff(*)
      `)
      .eq('restaurant_id', restaurant_id);

    if (table_id) {
      query = query.eq('table_id', table_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (limit) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum <= 0) {
        return createValidationErrorResponse('Invalid limit parameter');
      }
      query = query.limit(limitNum);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return createSuccessResponse(data || []);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
