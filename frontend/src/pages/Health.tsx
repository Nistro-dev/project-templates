import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";

interface HealthCheck {
  name: string;
  status: "ok" | "error";
  latencyMs?: number;
  error?: string;
}

interface HealthResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: HealthCheck[];
}

export function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch health");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(" ");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">System Health</CardTitle>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </CardHeader>
        <CardContent>
          {loading && !health ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-destructive font-medium">Connection Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : health ? (
            <div className="space-y-4">
              {/* Overall Status */}
              <div className="flex items-center gap-3 pb-4 border-b">
                {health.status === "healthy" ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-destructive" />
                )}
                <div>
                  <p className="font-semibold capitalize">{health.status}</p>
                  <p className="text-sm text-muted-foreground">
                    Uptime: {formatUptime(health.uptime)}
                  </p>
                </div>
              </div>

              {/* Individual Checks */}
              <div className="space-y-3">
                {health.checks.map((check) => (
                  <div
                    key={check.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {check.status === "ok" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium">{check.name}</span>
                    </div>
                    {check.latencyMs !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {check.latencyMs}ms
                      </span>
                    )}
                    {check.error && (
                      <span className="text-xs text-destructive">
                        {check.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                Last checked: {new Date(health.timestamp).toLocaleString()}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
