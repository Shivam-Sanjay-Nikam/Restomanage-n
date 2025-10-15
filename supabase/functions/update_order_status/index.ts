import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

interface UpdateOrderStatusRequest {
  id: string;
  status: 'placed' | 'preparing' | 'served' | 'completed' | 'cancelled';
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { id, status }: UpdateOrderStatusRequest = await req.json();

    // Validation
    if (!id || !status) {
      return createValidationErrorResponse('Missing required fields: id, status');
    }

    if (!['placed', 'preparing', 'served', 'completed', 'cancelled'].includes(status)) {
      return createValidationErrorResponse('Invalid status. Must be "placed", "preparing", "served", "completed", or "cancelled"');
    }

    // Check if order exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, status, table_id')
      .eq('id', id)
      .single();

    if (!existingOrder) {
      return createNotFoundResponse('Order');
    }

    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If order is completed or cancelled, update table status to available
    if (status === 'completed' || status === 'cancelled') {
      const { error: tableUpdateError } = await supabase
        .from('tables')
        .update({ status: 'available' })
        .eq('id', existingOrder.table_id);

      if (tableUpdateError) {
        console.error('Error updating table status:', tableUpdateError);
        // Don't fail the request if table update fails
      }
    }

    return createSuccessResponse(data);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
