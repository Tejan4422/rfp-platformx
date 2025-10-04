import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2 } from 'lucide-react';

// Simple fetch function for health check
const fetchHealth = async () => {
  const response = await fetch('http://localhost:8001/health');
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
};

export function HealthCheck() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Backend Health Status
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="space-y-2">
            <Badge variant="destructive">Disconnected</Badge>
            <p className="text-sm text-red-600">
              Error: {error.message}
            </p>
            <button 
              onClick={() => refetch()}
              className="text-sm text-blue-600 hover:underline"
            >
              Retry Connection
            </button>
          </div>
        ) : data ? (
          <div className="space-y-2">
            <Badge variant="default" className="bg-green-500">
              Connected
            </Badge>
            <div className="text-sm space-y-1">
              <p><strong>Status:</strong> {data.status}</p>
              <p><strong>Message:</strong> {data.message}</p>
              <p><strong>Version:</strong> {data.version}</p>
              <p><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ) : (
          <Badge variant="secondary">Checking...</Badge>
        )}
      </CardContent>
    </Card>
  );
}