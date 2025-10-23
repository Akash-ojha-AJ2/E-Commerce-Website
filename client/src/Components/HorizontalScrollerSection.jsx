const HorizontalScrollerSection = ({ title, products }) => (
  <div className="mb-4">
    <h4 className="fw-bold mb-3">{title}</h4>
    <div className="d-flex overflow-auto gap-3">
      {products.map((p, i) => (
        <div key={i} className="card" style={{ minWidth: '200px' }}>
          <img src={p.img} className="card-img-top" alt={p.name} />
          <div className="card-body">
            <h6>{p.name}</h6>
            <p className="text-danger">{p.price}</p>
            <Link to={`/product/${p._id}`} className="btn btn-sm btn-outline-primary">Details</Link>
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default HorizontalScrollerSection;
