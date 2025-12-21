import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Products = ({ showSearch = true }) => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(data);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const dispatch = useDispatch();
  const LOW_STOCK_THRESHOLD = 5;

  const addProduct = (product) => {
    const stock = Number(product?.stock ?? 0);
    if (stock <= 0) {
      toast.error("Out of stock");
      return;
    }

    dispatch(addCart(product));
  };

  const matchesQuery = (product) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const haystack = `${product?.title ?? ""} ${product?.description ?? ""} ${
      product?.category ?? ""
    }`.toLowerCase();

    return haystack.includes(q);
  };

  useEffect(() => {
    let isMounted = true;

    const getProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        const json = await response.json();

        if (isMounted) {
          setData(json);
          setFilter(json);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const Loading = () => {
    return (
      <>
        <div className="col-12 py-5 text-center">
          <Skeleton height={40} width={560} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
      </>
    );
  };

  const filterProduct = (cat) => {
    const updatedList = data.filter((item) => item.category === cat);
    setFilter(updatedList);
  };

  const getVisibleProducts = () => {
    // filter by search first
    const base = filter.filter(matchesQuery);

    // copy before sort (sort mutates arrays)
    const list = [...base];

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name-asc":
        list.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
        break;
      case "name-desc":
        list.sort((a, b) => (b.title ?? "").localeCompare(a.title ?? ""));
        break;
      default:
        break;
    }

    return list;
  };

  const ShowProducts = () => {
    const visible = getVisibleProducts();

    return (
      <>
        <div className="buttons text-center py-5">
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => setFilter(data)}>
            All
          </button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("men's clothing")}>
            Men's Clothing
          </button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("women's clothing")}>
            Women's Clothing
          </button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("jewelery")}>
            Jewelery
          </button>
          <button className="btn btn-outline-dark btn-sm m-2" onClick={() => filterProduct("electronics")}>
            Electronics
          </button>
        </div>

        {showSearch && (
          <div className="col-12 mb-3">
            <input
              className="form-control"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, keyword..."
            />
          </div>
        )}

        <div className="col-12 col-md-12 mb-3">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {visible.length === 0 ? (
          <div className="col-12 text-center py-4">
            <p className="text-muted m-0">No products match your search.</p>
          </div>
        ) : (
          visible.map((product) => {
            return (
              <div id={product.id} key={product.id} className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
                <div className="card text-center h-100" key={product.id}>
                  <img
                    className="card-img-top p-3"
                    src={product.image}
                    alt="Card"
                    height={300}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {product.title.length > 50 ? `${product.title.substring(0, 50)}...` : product.title}
                    </h5>
                    <p className="card-text">
                      {product.description.substring(0, 90)}...
                    </p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item lead">$ {product.price}</li>
                    <li className="list-group-item">
                      {(() => {
                        const stock = Number(product?.stock ?? 0);
                        const isOut = stock <= 0;
                        const isLow = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
                        return (
                          <>
                            Quantity remaining: {stock}
                            {isLow && (<span className="badge bg-warning text-dark ms-2">Almost gone...</span>)}
                            {isOut && (<span className="badge bg-danger ms-2">Out of stock</span>)}
                          </>
                        );
                      })()}
                    </li>
                  </ul>
                  <div className="card-body">
                    <Link to={"/product/" + product.id} className="btn btn-dark m-1">
                      View Details
                    </Link>
                    <button
                      className="btn btn-dark m-1"
                      disabled={Number(product?.stock ?? 0) <= 0}
                      onClick={() => {
                        addProduct(product);
                        if (Number(product?.stock ?? 0) > 0) toast.success("Added to cart");
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </>
    );
  };

  return (
    <>
      <div className="container my-3 py-3">
        <div className="row">
          <div className="col-12">
            <h2 className="display-5 text-center">Latest Products</h2>
            <hr />
          </div>
        </div>
        <div className="row justify-content-center">
          {loading ? Loading() : ShowProducts()}
        </div>
      </div>
    </>
  );
};

export default Products;
