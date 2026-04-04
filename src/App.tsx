import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/config/react-query";
import { RouteMiddleware } from "@/components/auth";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouteMiddleware />
      </BrowserRouter>
      <Toaster position="top-right" richColors duration={8000} closeButton />
    </QueryClientProvider>
  );
}

export default App;
