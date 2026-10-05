import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  DollarSign,
  Receipt,
  WalletCards,
  Factory,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CalendarDays,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import StatCard from "../components/StatCard";
import { api } from "../services/api";


export default function Dashboard() {

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [chart, setChart] = useState([]);

  // Lifetime production
  const [production, setProduction] = useState([]);

  // Current month production
  const [monthlyProduction, setMonthlyProduction] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productionLoading, setProductionLoading] = useState(true);

  const [error, setError] = useState("");
  const [productionError, setProductionError] = useState("");


  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await api.get("dashboard/");

        setData(response.data);

      } catch (err) {

        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err.response?.data?.detail ||
          "Failed to load dashboard data."
        );

      } finally {

        setLoading(false);

      }

    };

    loadDashboard();

  }, []);


  // ==========================================
  // LOAD CHART
  // ==========================================

  useEffect(() => {

    const loadChart = async () => {

      try {

        const currentYear =
          new Date().getFullYear();

        const response = await api.get(
          `dashboard/chart/?year=${currentYear}`
        );

        if (response.data?.chart_data) {

          const formattedChart =
            response.data.chart_data.map(
              (item) => ({

                ...item,

                month: new Date(
                  currentYear,
                  item.month - 1,
                  1
                ).toLocaleString("en", {
                  month: "short",
                }),

              })
            );

          setChart(formattedChart);

        }

      } catch (err) {

        console.error(
          "Dashboard chart loading error:",
          err
        );

      }

    };

    loadChart();

  }, []);


  // ==========================================
  // LOAD PRODUCTION SUMMARY
  // ==========================================

  useEffect(() => {

    const loadProduction = async () => {

      try {

        setProductionLoading(true);
        setProductionError("");

        /*
          IMPORTANT:

          We are NOT loading every production record.

          We are NOT using:

          production/?page_size=100

          Instead, backend calculates:

          1. Lifetime production
          2. This month production

          using database-level SUM(quantity).

          This is scalable even when there are
          thousands of production records.
        */

        const response = await api.get(
          "reports/production-summary/?period=dashboard"
        );


        // Lifetime production

        setProduction(
          response.data?.lifetime_production || []
        );


        // This month production

        setMonthlyProduction(
          response.data?.this_month_production || []
        );

      } catch (err) {

        console.error(
          "Production loading error:",
          err
        );

        setProductionError(
          err.response?.data?.detail ||
          "Failed to load production data."
        );

      } finally {

        setProductionLoading(false);

      }

    };

    loadProduction();

  }, []);


  // ==========================================
  // DASHBOARD DATA
  // ==========================================

  const total = data?.total || {};
  const today = data?.today || {};
  const month = data?.this_month || {};


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="empty">
        Loading dashboard...
      </div>

    );

  }


  // ==========================================
  // UI
  // ==========================================

  return (

    <>


      {/* =================================
          PAGE HEADER
      ================================= */}

      <div className="page-head">

        <div>

          <p className="eyebrow">
            OVERVIEW
          </p>

          <h1>
            Dashboard
          </h1>

          <p>
            Here’s what’s happening on your farm today.
          </p>

        </div>


        <button className="date-chip">

          <CalendarDays size={17} />

          {new Date().toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )}

        </button>

      </div>


      {/* =================================
          ERROR
      ================================= */}

      {error && (

        <div className="alert">
          {error}
        </div>

      )}


      {/* =================================
          STAT CARDS
      ================================= */}

      <div className="stats-grid">


        {/* TOTAL INCOME */}

        <StatCard
          title="Total income"
          value={`৳ ${Number(
            total.income || 0
          ).toLocaleString()}`}
          icon={DollarSign}
          tone="green"
          change={12.5}
        />


        {/* TOTAL EXPENSE */}

        <StatCard
          title="Total expense"
          value={`৳ ${Number(
            total.expense || 0
          ).toLocaleString()}`}
          icon={Receipt}
          tone="orange"
          change={4.2}
        />


        {/* PROFIT / LOSS */}

        <StatCard
          title="Profit / Loss"
          value={`৳ ${Number(
            total.profit_loss || 0
          ).toLocaleString()}`}
          icon={WalletCards}
          tone="blue"
          change={18.7}
        />


        {/* PRODUCTION PRODUCTS */}

        <StatCard
          title="Production products"
          value={production.length}
          icon={Factory}
          tone="purple"
        />

      </div>


      {/* =================================
          CHART + QUICK ACTIONS
      ================================= */}

      <div className="dashboard-grid">


        {/* =================================
            CHART
        ================================= */}

        <div className="panel chart-panel">

          <div className="panel-head">

            <div>

              <h3>
                Income & expenses
              </h3>

              <p>
                Monthly financial performance
              </p>

            </div>


            <select
              defaultValue={
                new Date().getFullYear()
              }
            >

              <option value="2026">
                2026
              </option>

              <option value="2025">
                2025
              </option>

            </select>

          </div>


          <div className="chart">

            {chart.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <AreaChart data={chart}>

                  <defs>

                    <linearGradient
                      id="inc"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#22c55e"
                        stopOpacity=".25"
                      />

                      <stop
                        offset="100%"
                        stopColor="#22c55e"
                        stopOpacity="0"
                      />

                    </linearGradient>


                    <linearGradient
                      id="exp"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#f59e0b"
                        stopOpacity=".2"
                      />

                      <stop
                        offset="100%"
                        stopColor="#f59e0b"
                        stopOpacity="0"
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    vertical={false}
                    stroke="#eef2f0"
                  />


                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                  />


                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />


                  <Tooltip />


                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#16a34a"
                    fill="url(#inc)"
                    strokeWidth={2.5}
                  />


                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#f59e0b"
                    fill="url(#exp)"
                    strokeWidth={2.5}
                  />

                </AreaChart>

              </ResponsiveContainer>

            ) : (

              <div className="empty">
                No chart data available.
              </div>

            )}

          </div>

        </div>


        {/* =================================
            QUICK ACTIONS
        ================================= */}

        <div className="panel quick-panel">

          <div className="panel-head">

            <div>

              <h3>
                Quick actions
              </h3>

              <p>
                Record something quickly
              </p>

            </div>

          </div>


          <div className="quick-grid">


            {/* ADD INCOME */}

            <button
              onClick={() =>
                navigate("/income")
              }
            >

              <span className="q green">

                <Plus />

              </span>

              <b>
                Add income
              </b>

              <small>
                Record a sale
              </small>

            </button>


            {/* ADD EXPENSE */}

            <button
              onClick={() =>
                navigate("/expenses")
              }
            >

              <span className="q orange">

                <Plus />

              </span>

              <b>
                Add expense
              </b>

              <small>
                Record a cost
              </small>

            </button>


            {/* ADD PRODUCTION */}

            <button
              onClick={() =>
                navigate("/production")
              }
            >

              <span className="q blue">

                <Plus />

              </span>

              <b>
                Add production
              </b>

              <small>
                Record output
              </small>

            </button>


            {/* ADD PRODUCT */}

            <button
              onClick={() =>
                navigate("/products")
              }
            >

              <span className="q purple">

                <Plus />

              </span>

              <b>
                Add product
              </b>

              <small>
                New farm item
              </small>

            </button>


          </div>

        </div>

      </div>


      {/* =================================
          PRODUCTION OVERVIEW
      ================================= */}

      <div className="dashboard-grid">


        {/* =================================
            LIFETIME PRODUCTION
        ================================= */}

        <div className="panel">

          <div className="panel-head">

            <div>

              <h3>
                Lifetime Production
              </h3>

              <p>
                Total production quantity by product
              </p>

            </div>

          </div>


          {productionError && (

            <div className="alert">
              {productionError}
            </div>

          )}


          {productionLoading ? (

            <div className="empty">
              Loading production...
            </div>

          ) : production.length === 0 ? (

            <div className="empty">
              No production data available.
            </div>

          ) : (

            <div className="today-list">

              {production.map(
                (item) => (

                  <div
                    key={`${item.product_id}-${item.unit}`}
                  >

                    <span>

                      <Factory />

                      {item.product_name}

                    </span>


                    <b>

                      {Number(
                        item.total_quantity || 0
                      ).toLocaleString()}

                      {" "}

                      {item.unit || ""}

                    </b>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* =================================
            THIS MONTH PRODUCTION
        ================================= */}

        <div className="panel">

          <div className="panel-head">

            <div>

              <h3>
                This Month Production
              </h3>

              <p>
                Production quantity for the current month
              </p>

            </div>

          </div>


          {productionLoading ? (

            <div className="empty">
              Loading production...
            </div>

          ) : monthlyProduction.length === 0 ? (

            <div className="empty">
              No production this month.
            </div>

          ) : (

            <div className="today-list">

              {monthlyProduction.map(
                (item) => (

                  <div
                    key={`${item.product_id}-${item.unit}`}
                  >

                    <span>

                      <Factory />

                      {item.product_name}

                    </span>


                    <b>

                      {Number(
                        item.total_quantity || 0
                      ).toLocaleString()}

                      {" "}

                      {item.unit || ""}

                    </b>

                  </div>

                )
              )}

            </div>

          )}

        </div>


      </div>


      {/* =================================
          TODAY + THIS MONTH
      ================================= */}

      <div className="bottom-grid">


        {/* =================================
            TODAY
        ================================= */}

        <div className="panel">

          <div className="panel-head">

            <div>

              <h3>
                Today
              </h3>

              <p>
                Daily financial snapshot
              </p>

            </div>

          </div>


          <div className="today-list">


            {/* TODAY INCOME */}

            <div>

              <span>

                <ArrowUpRight />

                Income

              </span>

              <b>

                ৳{" "}

                {Number(
                  today.income || 0
                ).toLocaleString()}

              </b>

            </div>


            {/* TODAY EXPENSE */}

            <div>

              <span>

                <ArrowDownRight />

                Expense

              </span>

              <b>

                ৳{" "}

                {Number(
                  today.expense || 0
                ).toLocaleString()}

              </b>

            </div>


            {/* TODAY PROFIT / LOSS */}

            <div>

              <span>

                <WalletCards />

                Profit / Loss

              </span>

              <b>

                ৳{" "}

                {Number(
                  today.profit_loss || 0
                ).toLocaleString()}

              </b>

            </div>


          </div>

        </div>


        {/* =================================
            THIS MONTH
        ================================= */}

        <div className="panel">

          <div className="panel-head">

            <div>

              <h3>
                This month
              </h3>

              <p>
                Current month performance
              </p>

            </div>

          </div>


          <div className="month-summary">


            {/* MONTH INCOME */}

            <div>

              <span>
                Income
              </span>

              <strong>

                ৳{" "}

                {Number(
                  month.income || 0
                ).toLocaleString()}

              </strong>

            </div>


            {/* MONTH EXPENSE */}

            <div>

              <span>
                Expense
              </span>

              <strong>

                ৳{" "}

                {Number(
                  month.expense || 0
                ).toLocaleString()}

              </strong>

            </div>


            {/* MONTH PROFIT / LOSS */}

            <div className="highlight">

              <span>
                Profit / Loss
              </span>

              <strong>

                ৳{" "}

                {Number(
                  month.profit_loss || 0
                ).toLocaleString()}

              </strong>

            </div>


          </div>

        </div>


      </div>


    </>

  );

}