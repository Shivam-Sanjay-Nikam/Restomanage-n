import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../utils/cors.ts';
import { createSuccessResponse, createValidationErrorResponse, createServerErrorResponse, createNotFoundResponse } from '../utils/response.ts';

interface UpdateMenuItemRequest {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  image_url?: string;
  cost?: number;
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

    const { id, ...updates }: UpdateMenuItemRequest = await req.json();

    // Validation
    if (!id) {
      return createValidationErrorResponse('Missing required field: id');
    }

    if (updates.cost !== undefined && updates.cost < 0) {
      return createValidationErrorResponse('Cost must be non-negative');
    }

    // Check if menu item exists
    const { data: existingItem } = await supabase
      .from('menu_items')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingItem) {
      return createNotFoundResponse('Menu item');
    }

    // Update menu item
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse(data);
  } catch (err) {
    return createServerErrorResponse(err.message);
  }
});
