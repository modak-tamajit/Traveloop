import React from "react"
import ReactDOM from "react-dom/client"
import {BrowserRouter} from "react-router-dom"
import {App} from "@/App"
import {ToastProvider} from "@/components/ui/toast"
import {AuthProvider} from "@/providers/auth-provider"
import {ThemeProvider} from "@/providers/theme-provider"
import "@/styles.css"
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
