import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

interface CreateTableRequest {
  restaurant_id: string;
  table_number: number;
  capacity?: number;
  status?: 'available' | 'occupied' | 'reserved';
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { restaurant_id, table_number, capacity = 4, status = 'available' }: CreateTableRequest = await req.json();

    // Validation
    if (!restaurant_id || !table_number) {
      return createValidationErrorResponse('Missing required fields: restaurant_id, table_number');
    }

    if (table_number <= 0) {
      return createValidationErrorResponse('Table number must be positive');
    }

    if (capacity <= 0) {
      return createValidationErrorResponse('Capacity must be positive');
    }

    if (!['available', 'occupied', 'reserved'].includes(status)) {
      return createValidationErrorResponse('Invalid status. Must be "available", "occupied", or "reserved"');
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

    // Check if table number already exists for this restaurant
    const { data: existingTable } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .eq('table_number', table_number)
      .single();

    if (existingTable) {
      return createValidationErrorResponse('Table number already exists for this restaurant');
    }

    // Create table
    const { data, error } = await supabase
      .from('tables')
      .insert([{ restaurant_id, table_number, capacity, status }])
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse(data);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
