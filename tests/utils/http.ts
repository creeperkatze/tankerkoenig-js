export type MockFetch = ReturnType<typeof createMockFetch>;

/** Creates a fetch mock that records calls and replays queued responses in order. */
export function createMockFetch(responses: Response[] = []) {
  const calls: Request[] = [];
  const queue = [...responses];

  const mockFetch = async (input: Request | URL | string, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    calls.push(request);
    const response = queue.shift();
    if (!response) {
      throw new Error(`Unexpected fetch call: ${request.method} ${request.url}`);
    }
    return response;
  };

  return Object.assign(mockFetch, {
    calls,
    lastCall: () => calls[calls.length - 1],
    callCount: () => calls.length,
  });
}

export function jsonResponse(data: unknown, status = 200, statusText = 'OK'): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' },
  });
}
