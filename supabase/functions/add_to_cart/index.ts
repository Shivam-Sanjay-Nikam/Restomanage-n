import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

interface AddToCartRequest {
  cart_id: string;
  menu_item_id: string;
  quantity: number;
  notes?: string;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { cart_id, menu_item_id, quantity, notes }: AddToCartRequest = await req.json();

    // Validation
    if (!cart_id || !menu_item_id || quantity === undefined || quantity === null) {
      return createValidationErrorResponse('Missing required fields: cart_id, menu_item_id, quantity');
    }

    if (quantity <= 0) {
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

    // Check if menu item exists and is available
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select('id, available')
      .eq('id', menu_item_id)
      .single();

    if (!menuItem) {
      return createNotFoundResponse('Menu item');
    }

    if (!menuItem.available) {
      return createValidationErrorResponse('Menu item is not available');
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart_id)
      .eq('menu_item_id', menu_item_id)
      .single();

    if (existingItem) {
      // Update existing item quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: existingItem.quantity + quantity,
          notes: notes || null
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;

      return createSuccessResponse(data);
    } else {
      // Add new item to cart
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ cart_id, menu_item_id, quantity, notes }])
        .select()
        .single();

      if (error) throw error;

      return createSuccessResponse(data);
    }
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
