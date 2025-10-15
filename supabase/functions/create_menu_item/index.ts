import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

interface CreateMenuItemRequest {
  restaurant_id: string;
  name: string;
  description?: string;
  category: string;
  image_url?: string;
  cost: number;
  available?: boolean;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { restaurant_id, name, description, category, image_url, cost, available = true }: CreateMenuItemRequest = await req.json();

    // Validation
    if (!restaurant_id || !name || !category || cost === undefined) {
      return createValidationErrorResponse('Missing required fields: restaurant_id, name, category, cost');
    }

    if (cost < 0) {
      return createValidationErrorResponse('Cost must be non-negative');
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

    // Create menu item
    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ restaurant_id, name, description, category, image_url, cost, available }])
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse(data);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
