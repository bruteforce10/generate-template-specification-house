import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./components/Homepage";
import VideoGenerator from "./components/VideoGenerator";
import CalloutLabelGenerator from "./components/CalloutLabelGenerator";
import BumperOutGenerator from "./components/BumperOutGenerator";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/property-video" element={<VideoGenerator />} />
          <Route path="/callout-label" element={<CalloutLabelGenerator />} />
          <Route path="/bumper-out" element={<BumperOutGenerator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
