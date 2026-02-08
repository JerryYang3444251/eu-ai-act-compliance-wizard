import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WizardProvider } from "./state/WizardContext";
import * as S from "./screens";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWizard } from "./state/WizardContext";
import ProgressBar from "./components/ProgressBar";

function NavigationTracker() {
  const location = useLocation();
  const { pushHistory } = useWizard();

  useEffect(() => {
    // Map /screenFinal to /screen14 for history tracking consistency
    const pathToTrack = location.pathname === "/screenFinal" ? "/screen14" : location.pathname;
    
    // Only track navigation changes, not duplicate calls from individual screen components
    // The screen components will handle their own pushHistory calls in useEffect
    // This tracker is mainly for direct URL navigation or progress bar clicks
    pushHistory(pathToTrack);
  }, [location.pathname, pushHistory]);

  // Scroll to top only when pathname changes (not on every render)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <WizardProvider>
      <Router>
        <NavigationTracker />
        <div className="app-layout">
          <ProgressBar />
          <div className="main-content">
            <Routes>
          {/* Modular flow: Information → Exclusions → Role → AnnexIA → AnnexIB → AnnexIII → Impact → GPAI → GPAI-Systemic → Prohibited → Transparency → FRIA → Classification → CA-Route → CA-Details → Checklist */}
          <Route path="/screen0" element={<S.Screen0 />} />          {/* Information */}
          <Route path="/" element={<S.Screen0 />} />                {/* Home → Information */}
          <Route path="/screen1" element={<S.Screen1 />} />          {/* Exclusions */}
          <Route path="/screen2" element={<S.Screen2 />} />          {/* Role */}
          <Route path="/screen3" element={<S.Screen3 />} />          {/* AnnexIA */}
          <Route path="/screen4" element={<S.Screen4 />} />          {/* AnnexIB */}
          <Route path="/screen5" element={<S.Screen5 />} />          {/* AnnexIII Use-Cases */}
          <Route path="/screen6" element={<S.Screen6 />} />          {/* AnnexIII Impact */}
          <Route path="/screen7" element={<S.Screen7 />} />          {/* GPAI */}
          <Route path="/screen8" element={<S.Screen8 />} />          {/* GPAI Systemic */}
          <Route path="/screen9" element={<S.Screen9 />} />          {/* Prohibited */}
          <Route path="/screen10" element={<S.Screen10 />} />        {/* Transparency */}
          <Route path="/screen11" element={<S.Screen11 />} />        {/* FRIA (gated by public body + high-risk) */}
          <Route path="/screen12" element={<S.Screen12 />} />        {/* Final Classification */}
          <Route path="/screen13" element={<S.Screen13 />} />        {/* CA Route (gated by high-risk + provider) */}
          <Route path="/screen14" element={<S.Screen14 />} />        {/* Checklist with merged CA Details */}
          <Route path="/screenFinal" element={<S.Screen14 />} />     {/* Terminal State → Checklist */}
            </Routes>
          </div>
        </div>
      </Router>
    </WizardProvider>
  );
}
