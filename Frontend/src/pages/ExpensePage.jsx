import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import Modal from "../components/Modal";
import { api } from "../services/api";


// ========================================
// EXPENSE PAGE
// ========================================

export default function ExpensePage() {

  // ========================================
  // DATA STATE
  // ========================================

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");


  // ========================================
  // MODAL STATE
  // ========================================

  const [open, setOpen] = useState(false);

  const [editingExpense, setEditingExpense] =
    useState(null);

  const [menuOpen, setMenuOpen] = useState(null);


  // ========================================
  // FORM STATE
  // ========================================

  const [category, setCategory] = useState("");

  const [expenseType, setExpenseType] =
    useState("");

  const [amount, setAmount] = useState("");

  const [date, setDate] = useState("");

  const [note, setNote] = useState("");


  // ========================================
  // ERROR HELPER
  // ========================================

  const getErrorMessage = (err, fallback) => {

    const data = err.response?.data;

    if (!data) {
      return fallback;
    }

    if (typeof data === "string") {
      return data;
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (typeof data.errors === "string") {
      return data.errors;
    }

    if (
      data.errors &&
      typeof data.errors === "object"
    ) {
      return Object.values(data.errors)
        .flat()
        .join(" ");
    }

    // Django REST Framework validation errors
    if (typeof data === "object") {

      return Object.entries(data)
        .map(([field, messages]) => {

          const message = Array.isArray(messages)
            ? messages.join(" ")
            : String(messages);

          return `${field}: ${message}`;

        })
        .join(" ");
    }

    return fallback;
  };


  // ========================================
  // GET CATEGORIES
  // ========================================

  const fetchCategories = async () => {

    try {

      setCategoriesLoading(true);

      const response =
        await api.get("categories/");


      if (Array.isArray(response.data)) {

        setCategories(response.data);

      } else {

        setCategories(
          response.data.results || []
        );
      }

    } catch (err) {

      console.error(
        "Category loading error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to load categories."
        )
      );

    } finally {

      setCategoriesLoading(false);
    }
  };


  // ========================================
  // GET EXPENSES
  // ========================================

  const fetchExpenses = async () => {

    try {

      setLoading(true);

      setError("");

      const response =
        await api.get("expenses/");


      if (Array.isArray(response.data)) {

        setExpenses(response.data);

      } else {

        setExpenses(
          response.data.results || []
        );
      }

    } catch (err) {

      console.error(
        "Expense loading error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to load expenses."
        )
      );

    } finally {

      setLoading(false);
    }
  };


  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {

    fetchExpenses();

    fetchCategories();

  }, []);


  // ========================================
  // OPEN ADD MODAL
  // ========================================

  const openAddModal = () => {

    setEditingExpense(null);

    setCategory("");

    setExpenseType("");

    setAmount("");

    setDate("");

    setNote("");

    setError("");

    setMenuOpen(null);

    setOpen(true);

    fetchCategories();
  };


  // ========================================
  // OPEN EDIT MODAL
  // ========================================

  const openEditModal = (expense) => {

    setEditingExpense(expense);

    setCategory(
      expense.category
        ? String(expense.category)
        : ""
    );

    setExpenseType(
      expense.expense_type || ""
    );

    setAmount(
      expense.amount ?? ""
    );

    /*
      Expense.date is DateField.
      So backend gives:
      YYYY-MM-DD

      We use date input.
    */

    setDate(
      expense.date || ""
    );

    setNote(
      expense.note || ""
    );

    setError("");

    setMenuOpen(null);

    setOpen(true);

    fetchCategories();
  };


  // ========================================
  // CLOSE MODAL
  // ========================================

  const closeModal = () => {

    if (saving) {
      return;
    }

    setOpen(false);

    setEditingExpense(null);

    setCategory("");

    setExpenseType("");

    setAmount("");

    setDate("");

    setNote("");

    setError("");
  };


  // ========================================
  // ADD EXPENSE
  // ========================================

  const addExpense = async () => {

    console.log(
      "addExpense() called"
    );


    // CATEGORY VALIDATION

    if (!category) {

      setError(
        "Please select a category."
      );

      return;
    }


    // EXPENSE TYPE VALIDATION

    if (!expenseType.trim()) {

      setError(
        "Expense type cannot be empty."
      );

      return;
    }


    // AMOUNT VALIDATION

    if (
      !amount ||
      Number(amount) <= 0
    ) {

      setError(
        "Amount must be greater than 0."
      );

      return;
    }


    // DATE VALIDATION

    if (!date) {

      setError(
        "Please select a date."
      );

      return;
    }


    try {

      setSaving(true);

      setError("");


      const data = {

        category: Number(category),

        expense_type:
          expenseType.trim(),

        amount:
          Number(amount),

        date: date,

        note:
          note.trim(),
      };


      console.log(
        "Expense POST data:",
        data
      );


      await api.post(
        "expenses/",
        data
      );


      setOpen(false);

      resetForm();

      await fetchExpenses();

    } catch (err) {

      console.error(
        "Expense create error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        getErrorMessage(
          err,
          "Failed to create expense."
        )
      );

    } finally {

      setSaving(false);
    }
  };


  // ========================================
  // UPDATE EXPENSE
  // ========================================

  const updateExpense = async () => {

    if (!editingExpense) {
      return;
    }


    // CATEGORY VALIDATION

    if (!category) {

      setError(
        "Please select a category."
      );

      return;
    }


    // EXPENSE TYPE VALIDATION

    if (!expenseType.trim()) {

      setError(
        "Expense type cannot be empty."
      );

      return;
    }


    // AMOUNT VALIDATION

    if (
      !amount ||
      Number(amount) <= 0
    ) {

      setError(
        "Amount must be greater than 0."
      );

      return;
    }


    // DATE VALIDATION

    if (!date) {

      setError(
        "Please select a date."
      );

      return;
    }


    try {

      setSaving(true);

      setError("");


      const data = {

        category: Number(category),

        expense_type:
          expenseType.trim(),

        amount:
          Number(amount),

        date: date,

        note:
          note.trim(),
      };


      console.log(
        "Expense UPDATE data:",
        data
      );


      await api.patch(
        `expenses/${editingExpense.id}/`,
        data
      );


      setOpen(false);

      resetForm();

      await fetchExpenses();

    } catch (err) {

      console.error(
        "Expense update error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        getErrorMessage(
          err,
          "Failed to update expense."
        )
      );

    } finally {

      setSaving(false);
    }
  };


  // ========================================
  // DELETE EXPENSE
  // ========================================

  const deleteExpense = async (expense) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this expense record?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setError("");


      await api.delete(
        `expenses/${expense.id}/`
      );


      setMenuOpen(null);

      await fetchExpenses();

    } catch (err) {

      console.error(
        "Expense delete error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        getErrorMessage(
          err,
          "Failed to delete expense."
        )
      );
    }
  };


  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {

    setEditingExpense(null);

    setCategory("");

    setExpenseType("");

    setAmount("");

    setDate("");

    setNote("");

  };


  // ========================================
  // CATEGORY NAME
  // ========================================

  const getCategoryName = (categoryId) => {

    const found =
      categories.find(
        (item) =>
          Number(item.id) ===
          Number(categoryId)
      );


    return found
      ? found.name
      : "—";
  };


  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (value) => {

    if (!value) {
      return "—";
    }


    const parsed =
      new Date(`${value}T00:00:00`);


    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {

      return "—";
    }


    return parsed.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ========================================
  // SEARCH
  // ========================================

  const filteredExpenses =
    expenses.filter((expense) => {

      const text = `
        ${getCategoryName(
          expense.category
        )}

        ${expense.expense_type || ""}

        ${expense.amount || ""}

        ${expense.date || ""}

        ${expense.note || ""}
      `;


      return text
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );
    });


  // ========================================
  // UI
  // ========================================

  return (
    <>
      {/* ================================= */}
      {/* PAGE HEADER */}
      {/* ================================= */}

      <div className="page-head">

        <div>

          <p className="eyebrow">
            FARM DATA
          </p>

          <h1>
            Expense
          </h1>

          <p>
            Track farm expenses and costs.
          </p>

        </div>


        <button
          className="primary"
          onClick={openAddModal}
        >

          <Plus size={18} />

          Add expense

        </button>

      </div>


      {/* ================================= */}
      {/* TABLE */}
      {/* ================================= */}

      <div className="panel table-panel">

        {/* TOOLBAR */}

        <div className="toolbar">

          <div className="search">

            <Search size={17} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search expense..."
            />

          </div>


          <button className="filter-btn">
            All records
          </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="alert">
            {error}
          </div>

        )}


        {/* TABLE */}

        <div className="table-wrap">

          {loading ? (

            <div className="empty">
              Loading expenses...
            </div>

          ) : (

            <table>

              <thead>

                <tr>

                  <th>
                    Category
                  </th>

                  <th>
                    Expense type
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Note
                  </th>

                  <th>
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredExpenses.map(
                  (expense) => (

                    <tr
                      key={expense.id}
                    >

                      <td>
                        <b>
                          {getCategoryName(
                            expense.category
                          )}
                        </b>
                      </td>


                      <td>
                        {expense.expense_type}
                      </td>


                      <td>
                        <b>
                          ৳{" "}
                          {Number(
                            expense.amount
                          ).toFixed(2)}
                        </b>
                      </td>


                      <td>
                        {formatDate(
                          expense.date
                        )}
                      </td>


                      <td>
                        {expense.note || "—"}
                      </td>


                      {/* ACTION */}

                      <td className="action-cell">

                        <button
                          className="icon-btn"
                          onClick={() =>
                            setMenuOpen(
                              menuOpen ===
                                expense.id
                                ? null
                                : expense.id
                            )
                          }
                        >

                          <MoreHorizontal
                            size={18}
                          />

                        </button>


                        {menuOpen ===
                          expense.id && (

                          <div className="action-menu">

                            <button
                              onClick={() =>
                                openEditModal(
                                  expense
                                )
                              }
                            >

                              <Pencil
                                size={15}
                              />

                              Edit

                            </button>


                            <button
                              className="danger"
                              onClick={() =>
                                deleteExpense(
                                  expense
                                )
                              }
                            >

                              <Trash2
                                size={15}
                              />

                              Delete

                            </button>

                          </div>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}


          {/* EMPTY */}

          {!loading &&
            !filteredExpenses.length && (

              <div className="empty">
                No expense records found.
              </div>

            )}

        </div>

      </div>


      {/* ================================= */}
      {/* ADD / EDIT MODAL */}
      {/* ================================= */}

      <Modal
        open={open}
        onClose={closeModal}
        title={
          editingExpense
            ? "Edit expense"
            : "Add expense"
        }
      >

        <div className="form-grid">

          {/* CATEGORY */}

          <label>

            Category

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              disabled={
                saving ||
                categoriesLoading
              }
            >

              <option value="">

                {categoriesLoading
                  ? "Loading categories..."
                  : "Select category"}

              </option>


              {categories.map(
                (item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >

                    {item.name}

                  </option>

                )
              )}

            </select>

          </label>


          {/* EXPENSE TYPE */}

          <label>

            Expense type

            <input
              type="text"
              value={expenseType}
              onChange={(e) =>
                setExpenseType(
                  e.target.value
                )
              }
              placeholder="e.g. Fertilizer, Feed, Transport"
              disabled={saving}
            />

          </label>


          {/* AMOUNT */}

          <label>

            Amount

            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              placeholder="e.g. 5000"
              disabled={saving}
            />

          </label>


          {/* DATE */}

          <label>

            Date

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              disabled={saving}
            />

          </label>


          {/* NOTE */}

          <label>

            Note

            <textarea
              value={note}
              onChange={(e) =>
                setNote(
                  e.target.value
                )
              }
              placeholder="Optional note"
              disabled={saving}
            />

          </label>

        </div>


        {/* MODAL ACTIONS */}

        <div className="modal-actions">

          <button
            className="secondary"
            onClick={closeModal}
            disabled={saving}
          >
            Cancel
          </button>


          <button
            className="primary"
            onClick={() => {

              console.log(
                "EXPENSE SAVE BUTTON CLICKED"
              );

              if (editingExpense) {

                updateExpense();

              } else {

                addExpense();

              }

            }}
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : editingExpense
              ? "Update expense"
              : "Save expense"}

          </button>

        </div>

      </Modal>

    </>
  );
}