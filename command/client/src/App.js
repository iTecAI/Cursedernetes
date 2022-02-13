import ThemeProvider from "./utilities/themeProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./pages/layout/layout";

function App() {
    return (
        <ThemeProvider theme="main">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}></Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
