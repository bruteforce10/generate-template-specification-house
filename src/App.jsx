import { BrowserRouter, Routes, Route } from "react-router-dom";
import VideoGenerator from "./components/VideoGenerator";
import CalloutLabelGenerator from "./components/CalloutLabelGenerator";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VideoGenerator />} />
          <Route path="/callout-label" element={<CalloutLabelGenerator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
