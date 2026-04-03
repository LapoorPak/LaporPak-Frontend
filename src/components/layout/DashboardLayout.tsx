import { Outlet, Link, useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function DashboardLayout() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/dashboard" className="text-xl font-bold font-heading">
            LaporPak
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
