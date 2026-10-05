import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreVertical,
  X,
} from "lucide-react";

import Modal from "../components/Modal";
import { api } from "../services/api";


export default function ProductionPage() {
  const [productions, setProductions] = useState([]);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  // Form fields
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");


  // -----------------------------
  // Error formatter
  // -----------------------------
  const getErrorMessage = (err) => {
    const data = err?.response?.data;

    if (!data) {
      return err?.message || "Something went wrong.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (typeof data === "object") {
      return Object.entries(data)
        .map(([field, messages]) => {
          const text = Array.isArray(messages)
            ? messages.join(", ")
            : String(messages);

          return `${field}: ${text}`;
        })
        .join(" | ");
    }

    return "Something went wrong.";
  };


  // -----------------------------
  // Fetch products
  // -----------------------------
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);

      const res = await api.get("products/");

      setProducts(res.data);
    } catch (err) {
      console.error("Product fetch error:", err);
      setError(getErrorMessage(err));
    } finally {
      setProductsLoading(false);
    }
  };


  // -----------------------------
  // Fetch productions
  // -----------------------------
  const fetchProductions = async () => {
    try {
      setLoading(true);

      const res = await api.get("production/");

      setProductions(res.data);
    } catch (err) {
      console.error("Production fetch error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
    fetchProductions();
  }, []);


  // -----------------------------
  // Product name
  // -----------------------------
  const getProductName = (productId) => {
    const found = products.find(
      (item) => Number(item.id) === Number(productId)
    );

    return found ? found.name : `Product #${productId}`;
  };


  // -----------------------------
  // Filter productions
  // -----------------------------
  const filteredProductions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return productions;
    }

    return productions.filter((production) => {
      const productName = getProductName(production.product);

      return (
        productName.toLowerCase().includes(term) ||
        String(production.quantity).toLowerCase().includes(term) ||
        String(production.unit || "").toLowerCase().includes(term) ||
        String(production.date || "").toLowerCase().includes(term) ||
        String(production.note || "").toLowerCase().includes(term)
      );
    });
  }, [productions, products, search]);


  // -----------------------------
  // Reset form
  // -----------------------------
  const resetForm = () => {
    setProduct("");
    setQuantity("");
    setUnit("");
    setDate("");
    setNote("");

    setEditingProduction(null);
    setError("");
  };


  // -----------------------------
  // Open add modal
  // -----------------------------
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };


  // -----------------------------
  // Open edit modal
  // -----------------------------
  const openEditModal = (production) => {
    setEditingProduction(production);

    setProduct(String(production.product));
    setQuantity(production.quantity ?? "");
    setUnit(production.unit ?? "");
    setDate(production.date ?? "");
    setNote(production.note ?? "");

    setError("");
    setOpenMenu(null);
    setShowModal(true);
  };


  // -----------------------------
  // Close modal
  // -----------------------------
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };


  // -----------------------------
  // Add production
  // -----------------------------
  const addProduction = async () => {
    setError("");

    if (!product) {
      setError("Please select a product.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError("Production quantity must be greater than 0.");
      return;
    }

    if (!unit.trim()) {
      setError("Unit cannot be empty.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        product: Number(product),
        quantity: Number(quantity),
        unit: unit.trim(),
        date: date,
        note: note.trim(),
      };

      console.log("Production POST payload:", payload);

      await api.post("production/", payload);

      await fetchProductions();

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Production create error:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };


  // -----------------------------
  // Update production
  // -----------------------------
  const updateProduction = async () => {
    if (!editingProduction) return;

    setError("");

    if (!product) {
      setError("Please select a product.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError("Production quantity must be greater than 0.");
      return;
    }

    if (!unit.trim()) {
      setError("Unit cannot be empty.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        product: Number(product),
        quantity: Number(quantity),
        unit: unit.trim(),
        date: date,
        note: note.trim(),
      };

      console.log("Production PATCH payload:", payload);

      await api.patch(
        `production/${editingProduction.id}/`,
        payload
      );

      await fetchProductions();

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Production update error:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };


  // -----------------------------
  // Delete production
  // -----------------------------
  const deleteProduction = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this production?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`production/${id}/`);

      setProductions((prev) =>
        prev.filter((production) => production.id !== id)
      );

      setOpenMenu(null);
    } catch (err) {
      console.error("Production delete error:", err);
      setError(getErrorMessage(err));
    }
  };


  return (
    <div className="page">

      {/* Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">Production</div>

          <h1>Production</h1>

          <p>
            Track your production records.
          </p>
        </div>

        <button
          className="primary"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add production
        </button>
      </div>


      {/* Error */}
      {error && (
        <div className="alert">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="icon-btn"
          >
            <X size={17} />
          </button>
        </div>
      )}


      {/* Table panel */}
      <div className="panel table-panel">

        <div className="toolbar">

          <div className="search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search production..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>


        {/* Table */}
        <div className="table-wrap">

          {loading ? (
            <div className="empty">
              Loading productions...
            </div>
          ) : filteredProductions.length === 0 ? (
            <div className="empty">
              {search
                ? "No production records found."
                : "No production records yet."}
            </div>
          ) : (
            <table>

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {filteredProductions.map((production) => (

                  <tr key={production.id}>

                    <td>
                      {getProductName(production.product)}
                    </td>

                    <td>
                      {production.quantity}
                    </td>

                    <td>
                      {production.unit}
                    </td>

                    <td>
                      {production.date}
                    </td>

                    <td>
                      {production.note || "—"}
                    </td>

                    <td className="action-cell">

                      <button
                        className="icon-btn"
                        onClick={() =>
                          setOpenMenu(
                            openMenu === production.id
                              ? null
                              : production.id
                          )
                        }
                      >
                        <MoreVertical size={18} />
                      </button>


                      {openMenu === production.id && (
                        <div className="action-menu">

                          <button
                            onClick={() =>
                              openEditModal(production)
                            }
                          >
                            <Pencil size={16} />
                            Edit
                          </button>

                          <button
                            className="danger"
                            onClick={() =>
                              deleteProduction(production.id)
                            }
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>

                        </div>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          )}

        </div>

      </div>


      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={
          editingProduction
            ? "Edit production"
            : "Add production"
        }
      >

        <div className="form-grid">

          {/* Product */}
          <div className="field">

            <label>Product</label>

            <select
              value={product}
              onChange={(e) =>
                setProduct(e.target.value)
              }
              disabled={productsLoading || saving}
            >
              <option value="">
                {productsLoading
                  ? "Loading products..."
                  : "Select product"}
              </option>

              {products.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}

            </select>

          </div>


          {/* Quantity */}
          <div className="field">

            <label>Quantity</label>

            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              disabled={saving}
            />

          </div>


          {/* Unit */}
          <div className="field">

            <label>Unit</label>

            <input
              type="text"
              maxLength={30}
              placeholder="kg, pcs, liter..."
              value={unit}
              onChange={(e) =>
                setUnit(e.target.value)
              }
              disabled={saving}
            />

          </div>


          {/* Date */}
          <div className="field">

            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              disabled={saving}
            />

          </div>


          {/* Note */}
          <div className="field full">

            <label>Note</label>

            <textarea
              rows="4"
              placeholder="Optional note..."
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              disabled={saving}
            />

          </div>

        </div>


        {/* Modal actions */}
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
              console.log("SAVE PRODUCTION BUTTON CLICKED");

              if (editingProduction) {
                updateProduction();
              } else {
                addProduction();
              }
            }}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingProduction
              ? "Update production"
              : "Save production"}
          </button>

        </div>

      </Modal>

    </div>
  );
}