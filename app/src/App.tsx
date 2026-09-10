import { Route, Routes } from "react-router-dom";
import BoardScreen from "./BoardScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BoardScreen editable={false} />} />
      <Route path="/edit" element={<BoardScreen editable={true} />} />
    </Routes>
  );
}

export default App;
