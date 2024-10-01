import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import routes from "./routes/routes";
import PublicLayout from "./components/layouts/PublicLayout";
import { loadFile, getArrLoadFiles } from "./utils/loadFiles";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  let $ = window.$;

  //list of js/css dependencies.
  let arrJsCssFiles = [
    {
      dir: "/assets/js/",
      pos: "body",
      type: "js",
      files: ["bundleall.js", "common.js", "wow.js"],
    },
  ];

  useEffect(() => {
    //load js/css depedency files.
    let arrLoadFiles = getArrLoadFiles(arrJsCssFiles);
    arrLoadFiles.map(loadFile);
  }, []);

  const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);

    return null;
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <PublicLayout>
          <Suspense>
            <Routes>
              {routes.map((r, idx) => {
                return (
                  <Route
                    key={idx}
                    path={r.path}
                    element={
                      r.isprotected == true ? (
                        <ProtectedRoute>
                          <r.element />
                        </ProtectedRoute>
                      ) : (
                        <r.element />
                      )
                    }
                    exact={r.isexact}
                    index={r.index}
                  />
                );
              })}
            </Routes>
          </Suspense>
          <ScrollToTop />
        </PublicLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
