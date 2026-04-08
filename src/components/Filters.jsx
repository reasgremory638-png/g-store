import './Filters.css'

export default function Filters({ search, setSearch, category, setCategory, categories, onReset }) {
  return (
    <section className="filters-section" id="products">
      <div className="filters-card">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        <div className="category-filters">
          <button
            className={`cat-btn ${category === '' ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            الكل
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {(search || category) && (
          <button className="reset-btn" onClick={onReset}>
            <i className="fa-solid fa-rotate-right" />
            إعادة ضبط
          </button>
        )}
      </div>
    </section>
  )
}
