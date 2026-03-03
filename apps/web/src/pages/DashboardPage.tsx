/**
 * Dashboard Page — Protected page shown after login
 */
import { useAuth } from "@snackro/features";
import { Button, Card, Stack, Typography, Container } from "@snackro/ui";

export function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-primary)",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderBottom: "1px solid var(--color-border-soft)",
          padding: "var(--space-3) var(--space-4)",
        }}
      >
        <Container>
          <Stack direction="row" align="center" justify="space-between">
            <Stack direction="row" align="center" gap="var(--space-3)">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-orange-500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
                  S
                </span>
              </div>
              <Typography variant="h4">SNACKRO</Typography>
            </Stack>

            <Stack direction="row" align="center" gap="var(--space-3)">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "2px solid var(--color-border-soft)",
                  }}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                loading={isLoading}
              >
                Sign Out
              </Button>
            </Stack>
          </Stack>
        </Container>
      </header>

      {/* Main Content */}
      <main style={{ padding: "var(--space-6) var(--space-4)" }}>
        <Container maxWidth="960px">
          <Stack gap="var(--space-5)">
            <Stack gap="var(--space-2)">
              <Typography variant="h2">
                Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
              </Typography>
              <Typography variant="body" color="var(--color-text-secondary)">
                You are logged in as {user?.email}
              </Typography>
            </Stack>

            {/* Dashboard Cards */}
            <Stack direction="row" gap="var(--space-4)" wrap>
              <Card
                style={{ flex: "1 1 280px", minWidth: 280 }}
                padding="var(--space-5)"
              >
                <Stack gap="var(--space-3)">
                  <Typography variant="h4" color="var(--color-orange-600)">
                    🚀 Getting Started
                  </Typography>
                  <Typography
                    variant="body"
                    color="var(--color-text-secondary)"
                  >
                    Your SNACKRO application is running successfully. This
                    dashboard is protected by the enterprise authentication
                    system.
                  </Typography>
                </Stack>
              </Card>

              <Card
                style={{ flex: "1 1 280px", minWidth: 280 }}
                padding="var(--space-5)"
              >
                <Stack gap="var(--space-3)">
                  <Typography variant="h4" color="var(--color-green-700)">
                    ✅ Auth Status
                  </Typography>
                  <Typography
                    variant="body"
                    color="var(--color-text-secondary)"
                  >
                    Session is active. Tokens are managed via HTTP-only cookies.
                    Auto-refresh is configured via Axios interceptors.
                  </Typography>
                </Stack>
              </Card>

              <Card
                style={{ flex: "1 1 280px", minWidth: 280 }}
                padding="var(--space-5)"
              >
                <Stack gap="var(--space-3)">
                  <Typography variant="h4" color="var(--color-orange-500)">
                    📦 Architecture
                  </Typography>
                  <Typography
                    variant="body"
                    color="var(--color-text-secondary)"
                  >
                    Monorepo with shared packages: types, config, utils, api,
                    auth-core, store, features, and ui. Ready for mobile
                    expansion.
                  </Typography>
                </Stack>
              </Card>
            </Stack>
          </Stack>
        </Container>
      </main>
    </div>
  );
}
