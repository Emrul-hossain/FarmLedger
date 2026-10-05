import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  RefreshCw,
} from "lucide-react";

import { api } from "../services/api";


export default function ReportPage() {

  // =========================
  // States
  // =========================

  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [monthlyReport, setMonthlyReport] = useState([]);
  const [productReport, setProductReport] = useState([]);
  const [categoryReport, setCategoryReport] = useState([]);
  const [productionReport, setProductionReport] = useState([]);

  const [dateRangeReport, setDateRangeReport] = useState(null);

  const [productionSummary, setProductionSummary] =
    useState([]);

  const [productionPeriod, setProductionPeriod] =
    useState("monthly");

  const [loading, setLoading] = useState(false);
  const [dateRangeLoading, setDateRangeLoading] =
    useState(false);

  const [error, setError] = useState("");


  // =========================
  // Error helper
  // =========================

  const getErrorMessage = (err) => {

    const data = err?.response?.data;

    if (!data) {
      return err?.message || "Something went wrong.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (typeof data === "object") {

      if (data.error) {
        return data.error;
      }

      return Object.entries(data)
        .map(([key, value]) => {

          const message = Array.isArray(value)
            ? value.join(", ")
            : String(value);

          return `${key}: ${message}`;

        })
        .join(" | ");
    }

    return "Something went wrong.";
  };


  // =========================
  // Load Reports
  // =========================

  const loadReports = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        monthlyRes,
        productRes,
        categoryRes,
        productionRes,
        productionSummaryRes,
      ] = await Promise.all([

        api.get("reports/monthly/", {
          params: {
            year: year,
          },
        }),

        api.get(
          "reports/product-production-sales/",
          {
            params: {
              year: year,
            },
          }
        ),

        api.get(
          "reports/category-profitability/"
        ),

        api.get(
          "reports/production/",
          {
            params: {
              year: year,
            },
          }
        ),

        api.get(
          "reports/production-summary/",
          {
            params: {
              period: productionPeriod,
            },
          }
        ),

      ]);


      // Monthly
      setMonthlyReport(
        monthlyRes.data?.monthly_report || []
      );


      // Product
      setProductReport(
        productRes.data?.product_production_sales || []
      );


      // Category
      setCategoryReport(
        categoryRes.data?.category_profitability || []
      );


      // Production
      setProductionReport(
        productionRes.data?.production_report || []
      );


      // Production summary
      setProductionSummary(
        productionSummaryRes.data?.production_summary || []
      );

    } catch (err) {

      console.error(
        "Report fetch error:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // Date Range Report
  // =========================

  const loadDateRangeReport = async () => {

    if (!startDate || !endDate) {

      setError(
        "Please select both start date and end date."
      );

      return;
    }

    try {

      setDateRangeLoading(true);
      setError("");

      const res = await api.get(
        "reports/date-range/",
        {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }
      );

      setDateRangeReport(res.data);

    } catch (err) {

      console.error(
        "Date range report error:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {

      setDateRangeLoading(false);

    }
  };


  // =========================
  // Initial load
  // =========================

  useEffect(() => {

    loadReports();

  }, [year, productionPeriod]);


  // =========================
  // Format money
  // =========================

  const money = (value) => {

    const number = Number(value || 0);

    return number.toLocaleString(
      "en-BD",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };


  // =========================
  // Month name
  // =========================

  const getMonthName = (month) => {

    return new Date(
      2000,
      Number(month) - 1,
      1
    ).toLocaleString(
      "en-US",
      {
        month: "short",
      }
    );
  };


  // =========================
  // Export Excel
  // =========================

  const downloadExcel = async (
    type
  ) => {

    try {

      setError("");

      const endpoint =
        type === "income"
          ? "reports/income/export/"
          : "reports/expense/export/";


      const response = await api.get(
        endpoint,
        {
          responseType: "blob",
        }
      );


      const blob = new Blob(
        [response.data],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );


      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        type === "income"
          ? "income_report.xlsx"
          : "expense_report.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {

      console.error(
        "Excel download error:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    }
  };


  // =========================
  // Date range values
  // =========================

  const rangeIncome =
    Number(
      dateRangeReport?.income || 0
    );

  const rangeExpense =
    Number(
      dateRangeReport?.expense || 0
    );

  const rangeProfit =
    Number(
      dateRangeReport?.profit_loss || 0
    );


  return (

    <div className="page">

      {/* ================================= */}
      {/* Header */}
      {/* ================================= */}

      <div className="page-head">

        <div>

          <div className="eyebrow">
            Reports
          </div>

          <h1>Farm Reports</h1>

          <p>
            Analyze income, expenses, production
            and profitability.
          </p>

        </div>


        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >

          <select
            value={year}
            onChange={(e) =>
              setYear(e.target.value)
            }
          >

            {Array.from(
              { length: 7 },
              (_, index) =>
                new Date().getFullYear() -
                index
            ).map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>


          <button
            className="secondary"
            onClick={loadReports}
            disabled={loading}
          >

            <RefreshCw
              size={17}
            />

            {loading
              ? "Loading..."
              : "Refresh"}

          </button>

        </div>

      </div>


      {/* ================================= */}
      {/* Error */}
      {/* ================================= */}

      {error && (

        <div className="alert">

          {error}

        </div>

      )}


      {/* ================================= */}
      {/* Date Range */}
      {/* ================================= */}

      <div className="panel">

        <div className="panel-head">

          <div>

            <h2>
              Date Range Report
            </h2>

            <p>
              Check financial performance
              between two dates.
            </p>

          </div>

        </div>


        <div
          className="form-grid"
          style={{
            marginTop: "20px",
          }}
        >

          <div className="field">

            <label>
              Start date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
            />

          </div>


          <div className="field">

            <label>
              End date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
            />

          </div>


          <div
            style={{
              display: "flex",
              alignItems: "end",
            }}
          >

            <button
              className="primary"
              onClick={
                loadDateRangeReport
              }
              disabled={
                dateRangeLoading
              }
            >

              <BarChart3
                size={17}
              />

              {dateRangeLoading
                ? "Loading..."
                : "Generate report"}

            </button>

          </div>

        </div>


        {dateRangeReport && (

          <div
            className="stats-grid"
            style={{
              marginTop: "24px",
            }}
          >

            <div className="panel">

              <div className="eyebrow">
                Income
              </div>

              <h2>
                {money(rangeIncome)}
              </h2>

            </div>


            <div className="panel">

              <div className="eyebrow">
                Expense
              </div>

              <h2>
                {money(rangeExpense)}
              </h2>

            </div>


            <div className="panel">

              <div className="eyebrow">
                Profit / Loss
              </div>

              <h2>
                {money(rangeProfit)}
              </h2>

            </div>

          </div>

        )}

      </div>


      {/* ================================= */}
      {/* Monthly Financial Report */}
      {/* ================================= */}

      <div className="panel table-panel">

        <div className="toolbar">

          <div>

            <h2>
              Monthly Financial Report
            </h2>

            <p>
              Income, expense and profit/loss
              for {year}.
            </p>

          </div>

        </div>


        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Month
                </th>

                <th>
                  Income
                </th>

                <th>
                  Expense
                </th>

                <th>
                  Profit / Loss
                </th>

              </tr>

            </thead>


            <tbody>

              {monthlyReport.map(
                (item) => (

                  <tr
                    key={item.month}
                  >

                    <td>
                      {getMonthName(
                        item.month
                      )}
                    </td>

                    <td>
                      {money(
                        item.income
                      )}
                    </td>

                    <td>
                      {money(
                        item.expense
                      )}
                    </td>

                    <td>
                      {money(
                        item.profit_loss
                      )}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================= */}
      {/* Product Production & Sales */}
      {/* ================================= */}

      <div className="panel table-panel">

        <div className="toolbar">

          <div>

            <h2>
              Product Production & Sales
            </h2>

            <p>
              Production, sales and remaining
              stock for {year}.
            </p>

          </div>

        </div>


        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  Category
                </th>

                <th>
                  Production
                </th>

                <th>
                  Sales
                </th>

                <th>
                  Remaining
                </th>

                <th>
                  Income
                </th>

              </tr>

            </thead>


            <tbody>

              {productReport.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="empty"
                  >
                    No product activity
                    found.
                  </td>

                </tr>

              ) : (

                productReport.map(
                  (item) => (

                    <tr
                      key={
                        item.product_id
                      }
                    >

                      <td>
                        {item.product_name}
                      </td>

                      <td>
                        {item.category_name}
                      </td>

                      <td>
                        {
                          item.total_production
                        }

                        {" "}

                        {
                          item.production_unit
                        }
                      </td>

                      <td>
                        {
                          item.total_sales
                        }

                        {" "}

                        {
                          item.sales_unit
                        }
                      </td>

                      <td>
                        {
                          item.remaining
                        }

                        {" "}

                        {
                          item.production_unit
                        }
                      </td>

                      <td>
                        {money(
                          item.total_income
                        )}
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================= */}
      {/* Category Profitability */}
      {/* ================================= */}

      <div className="panel table-panel">

        <div className="toolbar">

          <div>

            <h2>
              Category Profitability
            </h2>

            <p>
              Financial performance by category.
            </p>

          </div>

        </div>


        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Category
                </th>

                <th>
                  Income
                </th>

                <th>
                  Expense
                </th>

                <th>
                  Profit / Loss
                </th>

              </tr>

            </thead>


            <tbody>

              {categoryReport.map(
                (item) => (

                  <tr
                    key={
                      item.category_id
                    }
                  >

                    <td>
                      {item.category_name}
                    </td>

                    <td>
                      {money(
                        item.income
                      )}
                    </td>

                    <td>
                      {money(
                        item.expense
                      )}
                    </td>

                    <td>
                      {money(
                        item.profit_loss
                      )}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================= */}
      {/* Production Report */}
      {/* ================================= */}

      <div className="panel table-panel">

        <div className="toolbar">

          <div>

            <h2>
              Production Report
            </h2>

            <p>
              Production summary for {year}.
            </p>

          </div>

        </div>


        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  Unit
                </th>

                <th>
                  Total Production
                </th>

              </tr>

            </thead>


            <tbody>

              {productionReport.map(
                (item) => (

                  <tr
                    key={
                      `${item.product_id}-${item.unit}`
                    }
                  >

                    <td>
                      {item.product_name}
                    </td>

                    <td>
                      {item.unit}
                    </td>

                    <td>
                      {item.total_quantity}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================= */}
      {/* Production Summary */}
      {/* ================================= */}

      <div className="panel table-panel">

        <div className="toolbar">

          <div>

            <h2>
              Production Summary
            </h2>

            <p>
              View production by period.
            </p>

          </div>


          <select
            value={productionPeriod}
            onChange={(e) =>
              setProductionPeriod(
                e.target.value
              )
            }
          >

            <option value="monthly">
              Monthly
            </option>

            <option value="daily">
              Daily
            </option>

          </select>

        </div>


        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Period
                </th>

                <th>
                  Product
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Unit
                </th>

              </tr>

            </thead>


            <tbody>

              {productionSummary.map(
                (item, index) => (

                  <tr
                    key={index}
                  >

                    <td>

                      {productionPeriod ===
                      "daily"
                        ? item.date
                        : item.month}

                    </td>

                    <td>
                      {item.product_name}
                    </td>

                    <td>
                      {item.total_quantity}
                    </td>

                    <td>
                      {item.unit}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================= */}
      {/* Excel Export */}
      {/* ================================= */}

      <div className="panel">

        <div className="toolbar">

          <div>

            <h2>
              Export Reports
            </h2>

            <p>
              Download your financial data
              as Excel files.
            </p>

          </div>


          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <button
              className="secondary"
              onClick={() =>
                downloadExcel("income")
              }
            >

              <Download
                size={17}
              />

              Income Excel

            </button>


            <button
              className="secondary"
              onClick={() =>
                downloadExcel("expense")
              }
            >

              <Download
                size={17}
              />

              Expense Excel

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}