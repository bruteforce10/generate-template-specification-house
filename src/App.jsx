import { BrowserRouter, Routes, Route } from "react-router-dom";
import VideoGenerator from "./components/VideoGenerator";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VideoGenerator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
