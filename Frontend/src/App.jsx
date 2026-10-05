import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CrudPage from "./pages/CrudPage";
import IncomePage from "./pages/Incomepage";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import ExpensePage from "./pages/ExpensePage";
import ProductionPage from "./pages/ProductionPage";
import ReportPage from "./pages/ReportPage";
import UserManagementPage from "./pages/UserManagementPage";

const Protected = ({ children }) =>
  localStorage.getItem("access_token")
    ? children
    : <Navigate to="/login" replace />;


export default function App() {

  return (

    <Routes>

      {/* ========================= */}
      {/* LOGIN */}
      {/* ========================= */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* ========================= */}
      {/* DEFAULT */}
      {/* ========================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* ========================= */}
      {/* DASHBOARD */}
      {/* ========================= */}

      <Route
        path="/dashboard"
        element={
          <Protected>
            <Layout>
              <Dashboard />
            </Layout>
          </Protected>
        }
      />


      {/* ========================= */}
      {/* CATEGORIES */}
      {/* ========================= */}

      <Route
        path="/categories"
        element={
          <Protected>
            <Layout>
              <CrudPage
                type="categories"
              />
            </Layout>
          </Protected>
        }
      />


      {/* ========================= */}
      {/* PRODUCTS */}
      {/* ========================= */}

      <Route
        path="/products"
        element={
          <Protected>
            <Layout>
              <CrudPage
                type="products"
              />
            </Layout>
          </Protected>
        }
      />


      {/* ========================= */}
      {/* INCOME */}
      {/* ========================= */}

      <Route
        path="/income"
        element={
          <Protected>
            <Layout>
              <IncomePage />
            </Layout>
          </Protected>
        }
      />


      {/* ========================= */}
      {/* EXPENSES */}
      {/* ========================= */}

      <Route
        path="/expenses"
        element={
          <Protected>
            <Layout>
              <ExpensePage />
            </Layout>
          </Protected>
        }
      />


      {/* ========================= */}
      {/* PRODUCTION */}
      {/* ========================= */}

      <Route
        path="/production"
        element={
          <Protected>
            <Layout>
              <ProductionPage/>
            </Layout>
          </Protected>
        }
      />


      {/* ========================= */}
      {/* REPORTS */}
      {/* ========================= */}

      <Route
        path="/reports"
        element={
          <Protected>
            <Layout>
              <ReportPage />
            </Layout>
          </Protected>
        }
      />


      {/* ========================= */}
      {/* USERS */}
      {/* ========================= */}

      <Route
        path="/users"
        element={
          <Protected>
            <Layout>
              <UserManagementPage />
            </Layout>
          </Protected>
        }
      />

    </Routes>
  );
}