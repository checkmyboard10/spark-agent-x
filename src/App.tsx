import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Clients from "./pages/Clients";
import Agents from "./pages/Agents";
import Campaigns from "./pages/Campaigns";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";
import Inbox from "./pages/Inbox";
import FlowEditor from "./pages/FlowEditor";
import Flows from "./pages/Flows";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/inbox" element={<Layout><Inbox /></Layout>} />
          <Route path="/clients" element={<Layout><Clients /></Layout>} />
          <Route path="/agents" element={<Layout><Agents /></Layout>} />
          <Route path="/campaigns" element={<Layout><Campaigns /></Layout>} />
          <Route path="/integrations" element={<Layout><Integrations /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/flows" element={<Layout><Flows /></Layout>} />
          <Route path="/flows/editor/:agentId" element={<FlowEditor />} />
          <Route path="/flows/editor/:agentId/:flowId" element={<FlowEditor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
