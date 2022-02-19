import ThemeProvider from "./utilities/themeProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutRaw from "./pages/layout/layoutRaw";
import Login from "./pages/login/login";

function App() {
    return (
        <ThemeProvider theme="main">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LayoutRaw />}>
                        <Route path="/login" element={<Login />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
