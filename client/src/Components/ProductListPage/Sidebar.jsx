// Sabse upar yeh import karein
import { Accordion } from 'react-bootstrap';

const Sidebar = ({ isOpen, onClose, availableFilters, selectedFilters, onFilterChange }) => {
    const handleCheckboxChange = (filterKey, value) => {
        const currentValues = selectedFilters[filterKey] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange(filterKey, newValues);
    };

    return (
        <div className={`offcanvas offcanvas-start ${isOpen ? 'show' : ''}`} tabIndex="-1">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title">Filters</h5>
                <button type="button" className="btn-close text-reset" onClick={onClose}></button>
            </div>
            <div className="offcanvas-body">
                {/* Price Range Filter */}
                <div className="mb-4">
                    <h6>Price Range</h6>
                    <label htmlFor="priceRange" className="form-label">Max Price: ₹{selectedFilters.maxPrice !== undefined ? selectedFilters.maxPrice : availableFilters.maxPrice}</label>
                    <input
                        type="range"
                        className="form-range"
                        min={availableFilters.minPrice}
                        max={availableFilters.maxPrice}
                        id="priceRange"
                        value={selectedFilters.maxPrice !== undefined ? selectedFilters.maxPrice : availableFilters.maxPrice}
                        onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
                    />
                </div>

                {/* YEH NAYA REACT-BOOTSTRAP WALA ACCORDION HAI */}
                <Accordion defaultActiveKey="0">
                    {Object.entries(availableFilters.specific).map(([key, options], index) => (
                        <Accordion.Item eventKey={String(index)} key={key}>
                            <Accordion.Header className="text-capitalize">{key}</Accordion.Header>
                            <Accordion.Body>
                                {options.map(option => (
                                    <div className="form-check" key={option}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`${key}-${option}`}
                                            checked={(selectedFilters[key] || []).includes(option)}
                                            onChange={() => handleCheckboxChange(key, option)}
                                        />
                                        <label className="form-check-label" htmlFor={`${key}-${option}`}>
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>

                <button className="btn btn-outline-secondary w-100 mt-4" onClick={() => onFilterChange('clearAll', {})}>
                    Clear All Filters
                </button>
            </div>
        </div>
    );
};