import ThemeProvider from "./utilities/themeProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutRaw from "./pages/layout/layoutRaw";
import Login from "./pages/login/login";
import { useEffect } from "react";
import { get } from "./utilities/api";

function App() {
    useEffect(() => {
        if (!window.location.pathname.includes("/login")) {
            get("/status").then((data) => {
                if (data.result) {
                    window.location.pathname = "/login";
                }
            });
        }
    }, []);
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
