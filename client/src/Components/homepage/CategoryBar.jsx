// src/components/HomePage/CategoryBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryBar.css'; // CSS file import karna na bhulein

const categories = [
    // ... (आपका categories array)
     { img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7uRdUV89FTZq3lj1_k_qFfkwcudxnR81_Tg&s', label: 'Toys & Baby', bgColor: '#d1faff', path: 'Toys_Baby' },
     { img: 'https://thumbs.dreamstime.com/b/sport-fitness-logo-creative-fit-fresh-healthy-athlete-vector-86031941.jpg', label: 'Sports', bgColor: '#f6e3ff', path: 'Sports_Fitness' },
    { img: 'https://img.freepik.com/free-vector/stationery-store-logo-template_23-2149852417.jpg', label: 'Stationery', bgColor: '#e7f5e3', path: 'Books_Stationery' },
    { img: 'https://rukminim2.flixcart.com/flap/96/96/image/22fddf3c7da4c4f4.png?q=100', label: 'Smartphone', bgColor: '#e3f2ff', path: 'smartphone' },
    { img: 'https://rukminim2.flixcart.com/fk-p-flap/96/96/image/0d75b34f7d8fbcb3.png?q=100', label: 'Fashion', bgColor: '#ffe3f3', path: 'fashion' },
    { img: 'https://rukminim2.flixcart.com/flap/96/96/image/69c6589653afdb9a.png?q=100', label: 'Electronics', bgColor: '#e3f2ff', path: 'electronics' },
    { img: 'https://rukminim2.flixcart.com/flap/96/96/image/ab7e2b022a4587dd.jpg?q=100', label: 'Furniture', bgColor: '#f6e3ff', path: 'Furniture' },
    { img: 'https://rukminim2.flixcart.com/flap/96/96/image/0139228b2f7eb413.jpg?q=100', label: 'Appliances', bgColor: '#e3f2ff', path: 'appliances' },
    { img: 'https://img.icons8.com/fluency/96/headphones.png', label: 'Headphones', bgColor: '#d1faff', path: 'headphones' },
    { img: 'https://rukminim2.flixcart.com/flap/96/96/image/dff3f7adcf3a90c6.png?q=100', label: 'Beauty Care', bgColor: '#ffe3e3', path: 'Beauty_Personal_Care' },
    { img: 'https://www.citypng.com/public/uploads/preview/hd-blue-apple-smart-watch-series-6-png-704081694622170ogfulucxw5.png', label: 'Watches', bgColor: '#f0f0f0', path: 'watches' },
     { img: 'https://cdn-icons-png.flaticon.com/512/2038/2038767.png', label: 'Other', bgColor: '#d1faff', path: 'other' },
];

function CategoryBar() {
    return (
        // Humne 'category-bar' class lagayi hai
        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm category-bar">
            {categories.map((item, i) => (
                <Link to={`/category/${item.path}`} key={i} className="text-decoration-none text-dark category-item">
                    <div className="text-center">
                        <div className="category-icon-wrapper" style={{ backgroundColor: item.bgColor }}>
                            <img src={item.img} alt={item.label} />
                        </div>
                        <div className="fw-semibold mt-2 small">{item.label}</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default CategoryBar;