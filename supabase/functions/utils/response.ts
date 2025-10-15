import { corsHeaders } from './cors.ts';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export function createSuccessResponse<T>(data: T, status: number = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

export function createErrorResponse(error: string, status: number = 400): Response {
  return new Response(JSON.stringify({ success: false, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

export function createValidationErrorResponse(message: string): Response {
  return createErrorResponse(`Validation error: ${message}`, 400);
}

export function createNotFoundResponse(resource: string): Response {
  return createErrorResponse(`${resource} not found`, 404);
}

export function createUnauthorizedResponse(): Response {
  return createErrorResponse('Unauthorized', 401);
}

export function createServerErrorResponse(error: string): Response {
  return createErrorResponse(`Server error: ${error}`, 500);
}
