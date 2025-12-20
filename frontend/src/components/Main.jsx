const Home = () => {
  return (
    <>
      <div className="hero border-1 pb-3">
        <div className="card bg-dark text-white border-0 mx-3">
          <div style={{ height: "360px", overflow: "hidden" }}>
            <img
              className="card-img img-fluid w-100 h-100"
              src="/assets/main.jpg"
              alt="Store hero"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>

          <div className="card-img-overlay d-flex align-items-center">
            <div className="container">
              <h5 className="card-title fs-1 fw-light">New Season, New Picks</h5>
              <p className="card-text fs-5 d-none d-sm-block">
                Browse the latest products and deals in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
