import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

interface RemoveFromCartRequest {
  cart_id: string;
  menu_item_id: string;
  quantity?: number; // If not provided, removes all of this item
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { cart_id, menu_item_id, quantity }: RemoveFromCartRequest = await req.json();

    // Validation
    if (!cart_id || !menu_item_id) {
      return createValidationErrorResponse('Missing required fields: cart_id, menu_item_id');
    }

    if (quantity !== undefined && quantity <= 0) {
      return createValidationErrorResponse('Quantity must be positive');
    }

    // Check if cart exists and is active
    const { data: cart } = await supabase
      .from('carts')
      .select('id, status')
      .eq('id', cart_id)
      .single();

    if (!cart) {
      return createNotFoundResponse('Cart');
    }

    if (cart.status !== 'active') {
      return createValidationErrorResponse('Cart is not active');
    }

    // Check if item exists in cart
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart_id)
      .eq('menu_item_id', menu_item_id)
      .single();

    if (!cartItem) {
      return createNotFoundResponse('Item in cart');
    }

    if (quantity === undefined || quantity >= cartItem.quantity) {
      // Remove item completely
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItem.id);

      if (error) throw error;

      return createSuccessResponse({ message: 'Item removed from cart' });
    } else {
      // Reduce quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: cartItem.quantity - quantity })
        .eq('id', cartItem.id)
        .select()
        .single();

      if (error) throw error;

      return createSuccessResponse(data);
    }
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
