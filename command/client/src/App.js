import ThemeProvider from "./utilities/themeProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LayoutRaw from "./pages/layout/layoutRaw";
import Login from "./pages/login/login";
import { useEffect } from "react";
import { get } from "./utilities/api";
import { sha256 } from "js-sha256";

function App() {
    useEffect(() => {
        if (!window.location.pathname.includes("/login")) {
            get("/status").then((data) => {
                if (data.result) {
                    alert("Error " + data.code + ": " + data.reason);
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
