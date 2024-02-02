import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { RouterProvider } from "react-router-dom";
RouterProvider;
import { router } from "./router.jsx";
import theme from "./theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <ChakraProvider theme={theme}>
    <RouterProvider router={router} />
  </ChakraProvider>
  // </React.StrictMode>
);
