import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Servers from "@/pages/Servers";
import Playlists from "@/pages/Playlists";
import Settings from "@/pages/Settings";
import AppBar from "@/components/AppBar";
import SideNavigation from "@/components/SideNavigation";
import BottomNavigation from "@/components/BottomNavigation";
import MobileDrawer from "@/components/MobileDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppContext } from "./contexts/AppContext";
import { AppProvider } from "./contexts/AppContext";
import AddServerDialog from "./components/AddServerDialog";
import GeneratePlaylistDialog from "./components/GeneratePlaylistDialog";

function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { mobileDrawerOpen } = useAppContext();

  return (
    <div className="flex flex-col h-screen">
      <AppBar />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {!isMobile && <SideNavigation />}
        {isMobile && mobileDrawerOpen && <MobileDrawer />}
        
        <main className="flex-1 overflow-y-auto bg-background mobile-custom-height md:h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
      
      {isMobile && <BottomNavigation />}
      
      <AddServerDialog />
      <GeneratePlaylistDialog />
    </div>
  );
}

function Router() {
  return (
    <AppProvider>
      <AppLayout>
        <Switch>
          <Route path="/">
            <Home />
          </Route>
          <Route path="/servers">
            <Servers />
          </Route>
          <Route path="/playlists">
            <Playlists />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </AppLayout>
    </AppProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
