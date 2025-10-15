import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

interface PlaceOrderRequest {
  cart_id: string;
  created_by: string;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { cart_id, created_by }: PlaceOrderRequest = await req.json();

    // Validation
    if (!cart_id || !created_by) {
      return createValidationErrorResponse('Missing required fields: cart_id, created_by');
    }

    // Check if cart exists and is active
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select(`
        *,
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

    if (cart.status !== 'active') {
      return createValidationErrorResponse('Cart is not active');
    }

    if (!cart.cart_items || cart.cart_items.length === 0) {
      return createValidationErrorResponse('Cart is empty');
    }

    // Check if staff member exists
    const { data: staff } = await supabase
      .from('staff')
      .select('id, restaurant_id')
      .eq('id', created_by)
      .single();

    if (!staff) {
      return createNotFoundResponse('Staff member');
    }

    if (staff.restaurant_id !== cart.restaurant_id) {
      return createValidationErrorResponse('Staff member does not belong to this restaurant');
    }

    // Calculate total amount
    const total_amount = cart.cart_items.reduce((total: number, item: any) => {
      return total + (item.menu_item.cost * item.quantity);
    }, 0);

    // Start transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        restaurant_id: cart.restaurant_id,
        table_id: cart.table_id,
        cart_id: cart.id,
        total_amount,
        status: 'placed',
        created_by
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Update cart status to ordered
    const { error: cartUpdateError } = await supabase
      .from('carts')
      .update({ status: 'ordered' })
      .eq('id', cart_id);

    if (cartUpdateError) throw cartUpdateError;

    // Update table status to occupied
    const { error: tableUpdateError } = await supabase
      .from('tables')
      .update({ status: 'occupied' })
      .eq('id', cart.table_id);

    if (tableUpdateError) throw tableUpdateError;

    return createSuccessResponse(order);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
