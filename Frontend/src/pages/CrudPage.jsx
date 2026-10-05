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
// PAGE CONFIG
// ========================================

const configs = {
  categories: {
    title: "Categories",
    desc: "Organize your farm products into categories.",
  },

  products: {
    title: "Products",
    desc: "Manage all products and farm items.",
  },

  income: {
    title: "Income",
    desc: "Track sales and other farm income.",
  },

  expenses: {
    title: "Expenses",
    desc: "Track and manage farm expenses.",
  },

  production: {
    title: "Production",
    desc: "Record daily farm production.",
  },
};


// ========================================
// COMPONENT
// ========================================

export default function CrudPage({ type }) {

  const c = configs[type];


  // ========================================
  // COMMON STATE
  // ========================================

  const [rows, setRows] = useState([]);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(null);


  // ========================================
  // CATEGORY STATE
  // ========================================

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [categoryName, setCategoryName] =
    useState("");

  const [categoryDescription, setCategoryDescription] =
    useState("");


  // ========================================
  // PRODUCT STATE
  // ========================================

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [productName, setProductName] =
    useState("");

  const [productCategory, setProductCategory] =
    useState("");

  const [productDescription, setProductDescription] =
    useState("");

  const [categories, setCategories] =
    useState([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(false);


  // ========================================
  // ERROR MESSAGE HELPER
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
  // GET PRODUCTS
  // ========================================

  const fetchProducts = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await api.get("products/");


      if (Array.isArray(response.data)) {

        setRows(response.data);

      } else {

        setRows(
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

      setLoading(false);
    }
  };


  // ========================================
  // GET CATEGORIES LIST
  // ========================================

  const fetchCategoryRows = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await api.get("categories/");


      if (Array.isArray(response.data)) {

        setRows(response.data);

      } else {

        setRows(
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

      setLoading(false);
    }
  };


  // ========================================
  // LOAD DATA
  // ========================================

  useEffect(() => {

    setSearch("");
    setError("");
    setMenuOpen(null);


    if (type === "categories") {

      fetchCategoryRows();

    }


    if (type === "products") {

      fetchProducts();

      fetchCategories();

    }

  }, [type]);


  // ========================================
  // OPEN ADD MODAL
  // ========================================

  const openAddModal = () => {

    setError("");

    setMenuOpen(null);


    // Category

    if (type === "categories") {

      setEditingCategory(null);

      setCategoryName("");

      setCategoryDescription("");

    }


    // Product

    if (type === "products") {

      setEditingProduct(null);

      setProductName("");

      setProductCategory("");

      setProductDescription("");

      fetchCategories();
    }


    setOpen(true);
  };


  // ========================================
  // OPEN EDIT CATEGORY
  // ========================================

  const openEditCategory = (category) => {

    setEditingCategory(category);

    setCategoryName(
      category.name || ""
    );

    setCategoryDescription(
      category.description || ""
    );

    setError("");

    setMenuOpen(null);

    setOpen(true);
  };


  // ========================================
  // OPEN EDIT PRODUCT
  // ========================================

  const openEditProduct = (product) => {

    setEditingProduct(product);

    setProductName(
      product.name || ""
    );

    setProductCategory(
      product.category
        ? String(product.category)
        : ""
    );

    setProductDescription(
      product.description || ""
    );

    setError("");

    setMenuOpen(null);

    fetchCategories();

    setOpen(true);
  };


  // ========================================
  // CLOSE MODAL
  // ========================================

  const closeModal = () => {

    if (saving) {
      return;
    }


    setOpen(false);

    setEditingCategory(null);

    setEditingProduct(null);


    setCategoryName("");

    setCategoryDescription("");


    setProductName("");

    setProductCategory("");

    setProductDescription("");


    setError("");
  };


  // ========================================
  // ADD CATEGORY
  // ========================================

  const addCategory = async () => {

    if (!categoryName.trim()) {

      setError(
        "Category name is required."
      );

      return;
    }


    try {

      setSaving(true);

      setError("");


      await api.post(
        "categories/",
        {
          name: categoryName.trim(),

          description:
            categoryDescription.trim(),
        }
      );


      setOpen(false);

      setCategoryName("");

      setCategoryDescription("");


      await fetchCategoryRows();

    } catch (err) {

      console.error(
        "Category create error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to create category."
        )
      );

    } finally {

      setSaving(false);
    }
  };


  // ========================================
  // UPDATE CATEGORY
  // ========================================

  const updateCategory = async () => {

    if (!categoryName.trim()) {

      setError(
        "Category name is required."
      );

      return;
    }


    if (!editingCategory) {
      return;
    }


    try {

      setSaving(true);

      setError("");


      await api.patch(
        `categories/${editingCategory.id}/`,
        {
          name: categoryName.trim(),

          description:
            categoryDescription.trim(),
        }
      );


      setOpen(false);

      setEditingCategory(null);

      setCategoryName("");

      setCategoryDescription("");


      await fetchCategoryRows();

    } catch (err) {

      console.error(
        "Category update error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to update category."
        )
      );

    } finally {

      setSaving(false);
    }
  };


  // ========================================
  // DELETE CATEGORY
  // ========================================

  const deleteCategory = async (category) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.name}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setError("");


      await api.delete(
        `categories/${category.id}/`
      );


      setMenuOpen(null);


      await fetchCategoryRows();

    } catch (err) {

      console.error(
        "Category delete error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to delete category."
        )
      );
    }
  };


  // ========================================
  // ADD PRODUCT
  // ========================================

  const addProduct = async () => {

    if (!productName.trim()) {

      setError(
        "Product name is required."
      );

      return;
    }


    if (!productCategory) {

      setError(
        "Please select a category."
      );

      return;
    }


    try {

      setSaving(true);

      setError("");


      await api.post(
        "products/",
        {
          name: productName.trim(),

          category: Number(
            productCategory
          ),

          description:
            productDescription.trim(),
        }
      );


      setOpen(false);

      setProductName("");

      setProductCategory("");

      setProductDescription("");


      await fetchProducts();

    } catch (err) {

      console.error(
        "Product create error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to create product."
        )
      );

    } finally {

      setSaving(false);
    }
  };


  // ========================================
  // UPDATE PRODUCT
  // ========================================

  const updateProduct = async () => {

    if (!productName.trim()) {

      setError(
        "Product name is required."
      );

      return;
    }


    if (!productCategory) {

      setError(
        "Please select a category."
      );

      return;
    }


    if (!editingProduct) {
      return;
    }


    try {

      setSaving(true);

      setError("");


      await api.patch(
        `products/${editingProduct.id}/`,
        {
          name: productName.trim(),

          category: Number(
            productCategory
          ),

          description:
            productDescription.trim(),
        }
      );


      setOpen(false);

      setEditingProduct(null);

      setProductName("");

      setProductCategory("");

      setProductDescription("");


      await fetchProducts();

    } catch (err) {

      console.error(
        "Product update error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to update product."
        )
      );

    } finally {

      setSaving(false);
    }
  };


  // ========================================
  // DELETE PRODUCT
  // ========================================

  const deleteProduct = async (product) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setError("");


      await api.delete(
        `products/${product.id}/`
      );


      setMenuOpen(null);


      await fetchProducts();

    } catch (err) {

      console.error(
        "Product delete error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to delete product."
        )
      );
    }
  };


  // ========================================
  // GET CATEGORY NAME
  // ========================================

  const getCategoryName = (categoryId) => {

    const category =
      categories.find(
        (item) =>
          Number(item.id) ===
          Number(categoryId)
      );


    return category
      ? category.name
      : "—";
  };


  // ========================================
  // SEARCH
  // ========================================

  const filtered = rows.filter((row) => {

    if (type === "categories") {

      const text = `
        ${row.name || ""}
        ${row.description || ""}
        ${row.created_by || ""}
      `;

      return text
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );
    }


    if (type === "products") {

      const text = `
        ${row.name || ""}
        ${getCategoryName(row.category)}
        ${row.description || ""}
        ${row.created_by || ""}
      `;

      return text
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );
    }


    return true;
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
            {c.title}
          </h1>

          <p>
            {c.desc}
          </p>

        </div>


        <button
          className="primary"
          onClick={openAddModal}
        >

          <Plus size={18} />

          Add{" "}
          {type === "products"
            ? "product"
            : "category"}

        </button>

      </div>


      {/* ================================= */}
      {/* TABLE PANEL */}
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
              placeholder={
                type === "products"
                  ? "Search products..."
                  : "Search categories..."
              }
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
              Loading{" "}
              {type === "products"
                ? "products"
                : "categories"}
              ...
            </div>

          ) : (

            <table>

              <thead>

                <tr>

                  {type === "categories" ? (
                    <>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Created by</th>
                      <th></th>
                    </>
                  ) : (
                    <>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Created by</th>
                      <th></th>
                    </>
                  )}

                </tr>

              </thead>


              <tbody>

                {filtered.map((row) => (

                  <tr key={row.id}>

                    {/* ================= */}
                    {/* CATEGORY ROW */}
                    {/* ================= */}

                    {type === "categories" ? (

                      <>

                        <td>
                          <b>
                            {row.name}
                          </b>
                        </td>


                        <td>
                          {row.description ||
                            "—"}
                        </td>


                        <td>
                          {row.created_by ||
                            "—"}
                        </td>


                        <td className="action-cell">

                          <button
                            className="icon-btn"
                            onClick={() =>
                              setMenuOpen(
                                menuOpen ===
                                  row.id
                                  ? null
                                  : row.id
                              )
                            }
                          >
                            <MoreHorizontal
                              size={18}
                            />
                          </button>


                          {menuOpen ===
                            row.id && (

                            <div className="action-menu">

                              <button
                                onClick={() =>
                                  openEditCategory(
                                    row
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
                                  deleteCategory(
                                    row
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

                      </>

                    ) : (

                      /* ================= */
                      /* PRODUCT ROW */
                      /* ================= */

                      <>

                        <td>
                          <b>
                            {row.name}
                          </b>
                        </td>


                        <td>
                          {getCategoryName(
                            row.category
                          )}
                        </td>


                        <td>
                          {row.description ||
                            "—"}
                        </td>


                        <td>
                          {row.created_by ||
                            "—"}
                        </td>


                        <td className="action-cell">

                          <button
                            className="icon-btn"
                            onClick={() =>
                              setMenuOpen(
                                menuOpen ===
                                  row.id
                                  ? null
                                  : row.id
                              )
                            }
                          >

                            <MoreHorizontal
                              size={18}
                            />

                          </button>


                          {menuOpen ===
                            row.id && (

                            <div className="action-menu">

                              <button
                                onClick={() =>
                                  openEditProduct(
                                    row
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
                                  deleteProduct(
                                    row
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

                      </>

                    )}

                  </tr>

                ))}

              </tbody>

            </table>

          )}


          {/* EMPTY */}

          {!loading &&
            !filtered.length && (

              <div className="empty">

                No{" "}
                {type === "products"
                  ? "products"
                  : "categories"}{" "}
                found.

              </div>

            )}

        </div>

      </div>


      {/* ================================= */}
      {/* CATEGORY MODAL */}
      {/* ================================= */}

      {type === "categories" && (

        <Modal
          open={open}
          onClose={closeModal}
          title={
            editingCategory
              ? "Edit category"
              : "Add category"
          }
        >

          <div className="form-grid">

            <label>

              Category name

              <input
                value={categoryName}
                onChange={(e) =>
                  setCategoryName(
                    e.target.value
                  )
                }
                placeholder="e.g. Dairy"
                disabled={saving}
              />

            </label>


            <label>

              Description

              <textarea
                value={
                  categoryDescription
                }
                onChange={(e) =>
                  setCategoryDescription(
                    e.target.value
                  )
                }
                placeholder="Optional description"
                disabled={saving}
              />

            </label>

          </div>


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
              onClick={
                editingCategory
                  ? updateCategory
                  : addCategory
              }
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : editingCategory
                ? "Update category"
                : "Save category"}

            </button>

          </div>

        </Modal>

      )}


      {/* ================================= */}
      {/* PRODUCT MODAL */}
      {/* ================================= */}

      {type === "products" && (

        <Modal
          open={open}
          onClose={closeModal}
          title={
            editingProduct
              ? "Edit product"
              : "Add product"
          }
        >

          <div className="form-grid">

            {/* PRODUCT NAME */}

            <label>

              Product name

              <input
                value={productName}
                onChange={(e) =>
                  setProductName(
                    e.target.value
                  )
                }
                placeholder="e.g. Cow Milk"
                disabled={saving}
              />

            </label>


            {/* CATEGORY */}

            <label>

              Category

              <select
                value={productCategory}
                onChange={(e) =>
                  setProductCategory(
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
                  (category) => (

                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>

                  )
                )}

              </select>

            </label>


            {/* DESCRIPTION */}

            <label>

              Description

              <textarea
                value={
                  productDescription
                }
                onChange={(e) =>
                  setProductDescription(
                    e.target.value
                  )
                }
                placeholder="Optional description"
                disabled={saving}
              />

            </label>

          </div>


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
              onClick={
                editingProduct
                  ? updateProduct
                  : addProduct
              }
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : editingProduct
                ? "Update product"
                : "Save product"}

            </button>

          </div>

        </Modal>

      )}

    </>
  );
}