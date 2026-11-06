import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { ProjectProvider } from "./context/ProjectContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Settings from "./pages/Settings";
import Processing from "./pages/Processing";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Takedown from "./pages/Takedown";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="upload" element={<Upload />} />
              <Route path="settings" element={<Settings />} />
              <Route path="processing" element={<Processing />} />
              <Route path="results" element={<Results />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="signin" element={<SignIn />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="takedown" element={<Takedown />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </ThemeProvider>
  );
}
