import { SquareClient, SquareEnvironment } from 'square';

// Singleton Square client instance (server-side only)
let squareClient: SquareClient | null = null;

export function getSquareClient(): SquareClient {
  if (!squareClient) {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('SQUARE_ACCESS_TOKEN environment variable is not set');
    }

    const environment = process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox;

    squareClient = new SquareClient({
      token: accessToken,
      environment,
    });
  }

  return squareClient;
}

// Helper to serialize BigInt values in Square API responses.
// Returns unknown because JSON roundtrip erases the original SDK type.
// Callers must cast to their expected shape.
export function serializeSquareData(data: unknown): unknown {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}
