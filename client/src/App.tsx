import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Experts from "./pages/Experts";
import ExpertDetail from "./pages/ExpertDetail";
import MapPage from "./pages/MapPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import MyPage from "./pages/MyPage";
import ProfileForm from "./pages/ProfileForm";
import MyLicenses from "./pages/MyLicenses";
import MyExperiences from "./pages/MyExperiences";
import MyEducations from "./pages/MyEducations";
import AdminPage from "./pages/AdminPage";

function Router() {
  const baseUrl = import.meta.env.BASE_URL || "/";

  return (
    <Switch base={baseUrl}>
      <Route path="/" component={Home} />
      <Route path="/experts" component={Experts} />
      <Route path="/experts/:id" component={ExpertDetail} />
      <Route path="/map" component={MapPage} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/about" component={About} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/mypage" component={MyPage} />
      <Route path="/mypage/profile/create" component={ProfileForm} />
      <Route path="/mypage/profile/edit" component={ProfileForm} />
      <Route path="/mypage/licenses" component={MyLicenses} />
      <Route path="/mypage/experiences" component={MyExperiences} />
      <Route path="/mypage/educations" component={MyEducations} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Layout>
            <Router />
          </Layout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
