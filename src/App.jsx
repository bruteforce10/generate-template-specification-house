import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./components/Homepage";
import VideoGenerator from "./components/VideoGenerator";
import CalloutLabelGenerator from "./components/CalloutLabelGenerator";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/property-video" element={<VideoGenerator />} />
          <Route path="/callout-label" element={<CalloutLabelGenerator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
