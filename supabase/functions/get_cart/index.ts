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
    const cart_id = url.searchParams.get('cart_id');
    const table_id = url.searchParams.get('table_id');
    const restaurant_id = url.searchParams.get('restaurant_id');

    // Validation
    if (!cart_id && !table_id) {
      return createValidationErrorResponse('Missing required parameter: cart_id or table_id');
    }

    let cartData;

    if (cart_id) {
      // Get cart by ID
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select(`
          *,
          table:tables(*),
          cart_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('id', cart_id)
        .single();

      if (cartError) {
        if (cartError.code === 'PGRST116') {
          return createNotFoundResponse('Cart');
        }
        throw cartError;
      }
      if (!cart) {
        return createNotFoundResponse('Cart');
      }

      cartData = cart;
    } else {
      // Get active cart by table_id
      if (!restaurant_id) {
        return createValidationErrorResponse('restaurant_id is required when using table_id');
      }

      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select(`
          *,
          table:tables(*),
          cart_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('restaurant_id', restaurant_id)
        .eq('table_id', table_id)
        .eq('status', 'active')
        .single();

      if (cartError) throw cartError;
      if (!cart) {
        return createNotFoundResponse('Active cart for table');
      }

      cartData = cart;
    }

    return createSuccessResponse(cartData);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
