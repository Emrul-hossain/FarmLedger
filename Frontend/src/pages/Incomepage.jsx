import { useEffect, useMemo, useState } from "react";
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
// INCOME PAGE
// ========================================

export default function IncomePage() {

  // ========================================
  // DATA STATE
  // ========================================

  const [incomes, setIncomes] = useState([]);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");


  // ========================================
  // MODAL STATE
  // ========================================

  const [open, setOpen] = useState(false);

  const [editingIncome, setEditingIncome] =
    useState(null);

  const [menuOpen, setMenuOpen] = useState(null);


  // ========================================
  // FORM STATE
  // ========================================

  const [product, setProduct] = useState("");

  const [quantity, setQuantity] = useState("");

  const [unit, setUnit] = useState("");

  const [unitPrice, setUnitPrice] =
    useState("");

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


    if (typeof data.errors === "string") {
      return data.errors;
    }


    if (typeof data.detail === "string") {
      return data.detail;
    }


    if (
      data.errors &&
      typeof data.errors === "object"
    ) {

      return Object.values(data.errors)
        .flat()
        .join(" ");
    }


    return fallback;
  };


  // ========================================
  // GET PRODUCTS
  // ========================================

  const fetchProducts = async () => {

    try {

      setProductsLoading(true);

      const response =
        await api.get("products/");


      if (Array.isArray(response.data)) {

        setProducts(response.data);

      } else {

        setProducts(
          response.data.results || []
        );
      }

    } catch (err) {

      console.error(
        "Product loading error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to load products."
        )
      );

    } finally {

      setProductsLoading(false);
    }
  };


  // ========================================
  // GET INCOMES
  // ========================================

  const fetchIncomes = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await api.get("incomes/");


      if (Array.isArray(response.data)) {

        setIncomes(response.data);

      } else {

        setIncomes(
          response.data.results || []
        );
      }

    } catch (err) {

      console.error(
        "Income loading error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to load incomes."
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

    fetchIncomes();

    fetchProducts();

  }, []);


  // ========================================
  // OPEN ADD MODAL
  // ========================================

  const openAddModal = () => {

    setEditingIncome(null);

    setProduct("");

    setQuantity("");

    setUnit("");

    setUnitPrice("");

    setDate("");

    setNote("");

    setError("");

    setMenuOpen(null);

    setOpen(true);

    fetchProducts();
  };


  // ========================================
  // OPEN EDIT MODAL
  // ========================================

  const openEditModal = (income) => {

    setEditingIncome(income);

    setProduct(
      income.product
        ? String(income.product)
        : ""
    );

    setQuantity(
      income.quantity ?? ""
    );

    setUnit(
      income.unit || ""
    );

    setUnitPrice(
      income.unit_price ?? ""
    );


    // Backend date is DateTimeField.
    // Convert it to datetime-local format.

    if (income.date) {

      const dateValue =
        new Date(income.date);

      if (!Number.isNaN(
        dateValue.getTime()
      )) {

        const localDate =
          new Date(
            dateValue.getTime() -
            dateValue.getTimezoneOffset() *
              60000
          )
            .toISOString()
            .slice(0, 16);

        setDate(localDate);

      } else {

        setDate("");
      }

    } else {

      setDate("");
    }


    setNote(
      income.note || ""
    );

    setError("");

    setMenuOpen(null);

    setOpen(true);

    fetchProducts();
  };


  // ========================================
  // CLOSE MODAL
  // ========================================

  const closeModal = () => {

    if (saving) {
      return;
    }


    setOpen(false);

    setEditingIncome(null);

    setProduct("");

    setQuantity("");

    setUnit("");

    setUnitPrice("");

    setDate("");

    setNote("");

    setError("");
  };


  // ========================================
  // TOTAL PREVIEW
  // ========================================

  const totalPreview = useMemo(() => {

    const qty = Number(quantity);

    const price = Number(unitPrice);


    if (
      !Number.isFinite(qty) ||
      !Number.isFinite(price) ||
      qty <= 0 ||
      price <= 0
    ) {

      return "0.00";
    }


    return (qty * price).toFixed(2);

  }, [quantity, unitPrice]);


  // ========================================
  // ADD INCOME
  // ========================================

  const addIncome = async () => {

    if (!product) {

      setError(
        "Please select a product."
      );

      return;
    }


    if (
      !quantity ||
      Number(quantity) <= 0
    ) {

      setError(
        "Quantity must be greater than 0."
      );

      return;
    }


    if (!unit.trim()) {

      setError(
        "Unit is required."
      );

      return;
    }


    if (
      !unitPrice ||
      Number(unitPrice) <= 0
    ) {

      setError(
        "Unit price must be greater than 0."
      );

      return;
    }


    try {

      setSaving(true);

      setError("");


      const data = {
        product: Number(product),

        quantity: Number(quantity),

        unit: unit.trim(),

        unit_price: Number(unitPrice),

        note: note.trim(),
      };


      // Date only send if user selected it.
      if (date) {

        data.date = new Date(
          date
        ).toISOString();

      }


      await api.post(
        "incomes/",
        data
      );


      setOpen(false);

      resetForm();


      await fetchIncomes();

    } catch (err) {

      console.error(
        "Income create error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to create income."
        )
      );

    } finally {

      setSaving(false);
    }
  };


  // ========================================
  // UPDATE INCOME
  // ========================================

  const updateIncome = async () => {

    if (!editingIncome) {
      return;
    }


    if (!product) {

      setError(
        "Please select a product."
      );

      return;
    }


    if (
      !quantity ||
      Number(quantity) <= 0
    ) {

      setError(
        "Quantity must be greater than 0."
      );

      return;
    }


    if (!unit.trim()) {

      setError(
        "Unit is required."
      );

      return;
    }


    if (
      !unitPrice ||
      Number(unitPrice) <= 0
    ) {

      setError(
        "Unit price must be greater than 0."
      );

      return;
    }


    try {

      setSaving(true);

      setError("");


      const data = {
        product: Number(product),

        quantity: Number(quantity),

        unit: unit.trim(),

        unit_price: Number(unitPrice),

        note: note.trim(),
      };


      if (date) {

        data.date = new Date(
          date
        ).toISOString();

      }


      await api.patch(
        `incomes/${editingIncome.id}/`,
        data
      );


      setOpen(false);

      resetForm();


      await fetchIncomes();

    } catch (err) {

      console.error(
        "Income update error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to update income."
        )
      );

    } finally {

      setSaving(false);
    }
  };


  // ========================================
  // DELETE INCOME
  // ========================================

  const deleteIncome = async (income) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this income record?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setError("");


      await api.delete(
        `incomes/${income.id}/`
      );


      setMenuOpen(null);


      await fetchIncomes();

    } catch (err) {

      console.error(
        "Income delete error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to delete income."
        )
      );
    }
  };


  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {

    setEditingIncome(null);

    setProduct("");

    setQuantity("");

    setUnit("");

    setUnitPrice("");

    setDate("");

    setNote("");

  };


  // ========================================
  // PRODUCT NAME
  // ========================================

  const getProductName = (productId) => {

    const found =
      products.find(
        (item) =>
          Number(item.id) ===
          Number(productId)
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
      new Date(value);


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

  const filteredIncomes =
    incomes.filter((income) => {

      const text = `
        ${getProductName(
          income.product
        )}

        ${income.quantity || ""}

        ${income.unit || ""}

        ${income.unit_price || ""}

        ${income.total_amount || ""}

        ${income.note || ""}

        ${income.date || ""}
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
            Income
          </h1>

          <p>
            Track sales and other farm income.
          </p>

        </div>


        <button
          className="primary"
          onClick={openAddModal}
        >

          <Plus size={18} />

          Add income

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
              placeholder="Search income..."
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


        {/* TABLE WRAPPER */}

        <div className="table-wrap">

          {loading ? (

            <div className="empty">
              Loading incomes...
            </div>

          ) : (

            <table>

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Unit
                  </th>

                  <th>
                    Unit price
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredIncomes.map(
                  (income) => (

                    <tr
                      key={income.id}
                    >

                      <td>
                        <b>
                          {getProductName(
                            income.product
                          )}
                        </b>
                      </td>


                      <td>
                        {income.quantity}
                      </td>


                      <td>
                        {income.unit}
                      </td>


                      <td>
                        ৳{" "}
                        {Number(
                          income.unit_price
                        ).toFixed(2)}
                      </td>


                      <td>
                        <b>
                          ৳{" "}
                          {Number(
                            income.total_amount
                          ).toFixed(2)}
                        </b>
                      </td>


                      <td>
                        {formatDate(
                          income.date
                        )}
                      </td>


                      {/* ACTION */}

                      <td className="action-cell">

                        <button
                          className="icon-btn"
                          onClick={() =>
                            setMenuOpen(
                              menuOpen ===
                                income.id
                                ? null
                                : income.id
                            )
                          }
                        >

                          <MoreHorizontal
                            size={18}
                          />

                        </button>


                        {menuOpen ===
                          income.id && (

                          <div className="action-menu">

                            <button
                              onClick={() =>
                                openEditModal(
                                  income
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
                                deleteIncome(
                                  income
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
            !filteredIncomes.length && (

              <div className="empty">
                No income records found.
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
          editingIncome
            ? "Edit income"
            : "Add income"
        }
      >

        <div className="form-grid">

          {/* PRODUCT */}

          <label>

            Product

            <select
              value={product}
              onChange={(e) =>
                setProduct(
                  e.target.value
                )
              }
              disabled={
                saving ||
                productsLoading
              }
            >

              <option value="">

                {productsLoading
                  ? "Loading products..."
                  : "Select product"}

              </option>


              {products.map(
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


          {/* QUANTITY */}

          <label>

            Quantity

            <input
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              placeholder="e.g. 10"
              disabled={saving}
            />

          </label>


          {/* UNIT */}

          <label>

            Unit

            <input
              type="text"
              value={unit}
              onChange={(e) =>
                setUnit(
                  e.target.value
                )
              }
              placeholder="e.g. Liter, Kg, Piece"
              disabled={saving}
            />

          </label>


          {/* UNIT PRICE */}

          <label>

            Unit price

            <input
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(e) =>
                setUnitPrice(
                  e.target.value
                )
              }
              placeholder="e.g. 80"
              disabled={saving}
            />

          </label>


          {/* TOTAL PREVIEW */}

          <label>

            Total amount

            <input
              type="text"
              value={`৳ ${totalPreview}`}
              readOnly
              disabled
            />

            <small>
              Quantity × Unit price
            </small>

          </label>


          {/* DATE */}

          <label>

            Date

            <input
              type="datetime-local"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              disabled={saving}
            />

            <small>
              Leave empty to use current date/time.
            </small>

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
    console.log("SAVE BUTTON CLICKED");

    if (editingIncome) {
      updateIncome();
    } else {
      addIncome();
    }
  }}
  disabled={saving}
>
  {saving
    ? "Saving..."
    : editingIncome
    ? "Update income"
    : "Save income"}
</button>
        </div>

      </Modal>

    </>
  );
}