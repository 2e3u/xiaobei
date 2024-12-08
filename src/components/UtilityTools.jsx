import '../styles/UtilitySearch.css';

function UtilityTools() {
  return (
    <div className="utility-container">
      <div className="utility-search-container">
        <input
          type="text"
          className="utility-search-input"
          placeholder="搜索实用工具..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="utility-filter-button">
          筛选
        </button>
      </div>
    </div>
  );
}

export default UtilityTools; 