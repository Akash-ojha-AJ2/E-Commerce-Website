
import React, { useEffect, useState, useMemo, useContext, } from 'react';
import { FaHeart, FaBolt } from 'react-icons/fa'; 
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Accordion } from 'react-bootstrap';
import { Context } from '../../store/Context';
import { toast } from 'react-toastify';
import './productListPage.css';

 const defaultImage = "https://placehold.co/300x300/007bff/ffffff?text=Product+Image";

const categoryHierarchy = {
  electronics: [
    "laptop", "tablet", "camera", "power_bank", "keyboard", "mouse",
    "projector", "storage_device", "speaker"
  ],
  smartphone: [
    "smartphone"
  ],
  watches: [
    "smartwatch", "watch"
  ],
  headphones: [
    "headphones & earbuds", "headphones", "earbuds", "wireless earphones"
  ],
  appliances: [
    "refrigerator", "washing_machine", "microwave_oven", "air_conditioner", "water_purifier",
    "water_heater", "vacuum_cleaner", "dishwasher", "mixer_grinder", "toaster", "coffee_maker", "induction_cooktop",
    "fan", "cooler", "geyser","television"
  ],
  fashion: [
    "tshirt", "shirt", "jeans", "trousers", "kurta", "saree", "dress", "jacket", "fashion",
    "sunglasses", "shoes", "sandals_floaters", "bag", "wallet"
  ],
   beauty_personal_care: [  
    "facewash", "buty_cream", "powder", "lipstick", "perfume", "sunscreen", "moisturizer", "shampoo", "trimmer_shaver"
  ],
  sports_fitness: [
    "treadmill", "bicycle", "dumbbell", "cricket_bat", "badminton_racket", "football", "gym_essentials"
  ],
   furniture: [  
    "sofa", "bed", "dining_table", "wardrobe", "table", "bookshelf", "office_chair"
  ],
  Books_Stationery: [
    "notebook", "pen", "stationery", "books",
  ],
  Toys_Baby: [
    "toys", "soft_toy", "diapers", "stroller_pram", "baby_care"
  ],
  other: [
    "car_accessories", "bike_accessories", "helmet", "gardening_tool", "power_tool", "musical_instrument", "bettry", "bottel", "blanket", "light", "travel_luggage", "pet_food"
  ]
};

const categorySpecificFilters = {
  car_accessories: { "Brand": ["3M", "JBL", "Sony", "Pioneer", "Godrej", "Auto-Ex", "Bosch"], "Product Type": ["Car Cover", "Seat Cover", "Floor Mat", "Steering Wheel Cover", "Car Stereo", "Car Speaker", "Air Freshener", "Mobile Holder", "Vacuum Cleaner", "Tyre Inflator"], "Material": ["Leatherette", "Fabric", "PVC", "Rubber", "Plastic", "Metal"], "Position": ["Front", "Rear", "Interior", "Exterior", "Full Car"], "Power Source (for electronics)": ["12V Car Socket", "USB", "Battery Powered"], "Connectivity (for electronics)": ["Bluetooth", "AUX", "USB", "FM Radio"], "Water Resistant / Waterproof": ["Yes", "No"], "Foldable / Collapsible": ["Yes", "No"], "Warranty": ["1 Year", "6 Months", "No Warranty"], "Country of Origin": ["India", "China", "Taiwan", "Japan"] },
  bike_accessories: { "Brand": ["Vega", "Steelbird", "Royal Enfield", "TVS", "Hero", "Autofy"], "Product Type": ["Helmet", "Riding Gloves", "Bike Cover", "Mobile Holder", "Face Mask", "Riding Jacket", "Saddlebag / Luggage Box", "Leg Guard"], "Material": ["ABS Plastic", "Polycarbonate", "Leather", "Faux Leather", "Nylon", "Metal"], "Size (for apparel/helmets)": ["S", "M", "L", "XL", "Universal"], "Certification (for helmets)": ["ISI", "DOT", "ECE"], "Visor Type (for helmets)": ["Clear", "Smoked", "Mirrored"], "Water Resistant / Waterproof": ["Yes", "No"], "Position": ["Handlebar", "Seat", "Side", "Front", "Rear"], "Warranty": ["6 Months", "1 Year", "No Warranty"], "Country of Origin": ["India", "China", "Taiwan"] },
  helmet: { "Brand": ["Vega", "Steelbird", "Studds", "Royal Enfield", "Axor", "SMK", "LS2"], "Type": ["Full-Face", "Open-Face", "Modular (Flip-up)", "Off-Road", "Half-Face"], "Ideal For": ["Men", "Women", "Unisex"], "Size": ["S", "M", "L", "XL"], "Finish": ["Glossy", "Matte"], "Outer Shell Material": ["ABS Plastic", "Polycarbonate", "Fiberglass", "Carbon Fiber"], "Inner Shell / Padding Material": ["EPS (Expanded Polystyrene)", "Foam"], "Liner Type": ["Removable & Washable Liner", "Fixed Liner"], "Certification": ["ISI", "DOT", "ECE"], "Visor Type": ["Clear Visor", "Smoked Visor", "Mirrored Visor"], "Visor Features": ["Anti-Scratch", "UV Resistant", "Pinlock Ready"], "Ventilation": ["Front & Rear Vents", "Adjustable Vents"], "Locking Mechanism / Strap": ["Quick Release Buckle", "D-Ring"], "Country of Origin": ["India", "China", "Spain"] },
  gardening_tool: { "Brand": ["Falcon", "Kraft Seeds", "Wolf-Garten", "Fiskars", "Sharpex", "TrustBasket"], "Product Type": ["Trowel", "Cultivator", "Pruning Shear / Secateurs", "Gardening Gloves", "Watering Can", "Hose Pipe", "Shovel", "Rake", "Lawn Mower"], "Material": ["Carbon Steel", "Stainless Steel", "Plastic", "Wood", "Aluminium", "Fabric"], "Handle Material": ["Plastic", "Wood", "Metal with Rubber Grip"], "Blade Material (for cutting tools)": ["Carbon Steel", "Stainless Steel"], "Usage / Application": ["Digging", "Weeding", "Pruning", "Watering", "Lawn Care", "Planting"], "Ideal For": ["Home Gardening", "Professional Landscaping", "Indoor Plants", "Outdoor Plants"], "Power Source (for powered tools)": ["Manual", "Electric (Corded)", "Battery Powered", "Petrol"], "Ergonomic Design": ["Yes", "No"], "Corrosion Resistant": ["Yes", "No"], "Warranty": ["6 Months", "1 Year", "No Warranty"], "Country of Origin": ["India", "China", "Germany"] },
  power_tool: { "Brand": ["Bosch", "Makita", "Dewalt", "Black & Decker", "Stanley", "Cheston", "iBELL"], "Product Type": ["Drill Machine", "Angle Grinder", "Jigsaw", "Circular Saw", "Sander", "Heat Gun", "Impact Wrench"], "Power Source": ["Corded", "Cordless (Battery Powered)"], "Usage / Application": ["Woodworking", "Metalworking", "Construction", "Home Improvement / DIY"], "Voltage (for cordless)": ["12V", "18V", "20V", "36V"], "Chuck Size (for drills, in mm)": ["10mm", "13mm"], "Disc Diameter (for grinders, in inches)": ["4 inch", "5 inch", "7 inch"], "Battery Included (for cordless)": ["Yes", "No"], "Number of Batteries (for cordless)": ["1", "2"], "Battery Type (for cordless)": ["Lithium-Ion", "Ni-Cad"], "Case / Box Included": ["Yes", "No"], "Warranty": ["6 Months", "1 Year", "2 Years"], "Country of Origin": ["Germany", "USA", "Japan", "India", "China"] },
  musical_instrument: { "Brand": ["Yamaha", "Fender", "Casio", "Roland", "Kadence", "Juarez", "Gibson", "Ibanez"], "Instrument Type": ["Acoustic Guitar", "Electric Guitar", "Keyboard", "Digital Piano", "Drum Kit", "Violin", "Flute", "Ukulele", "Tabla"], "Ideal For": ["Beginners", "Professionals", "Kids"], "Skill Level": ["Beginner", "Intermediate", "Professional"], "Body Material": ["Wood", "Rosewood", "Mahogany", "Plastic", "Metal"], "Number of Keys (for keyboards)": ["32", "49", "61", "88"], "Number of Strings (for guitars/violins)": ["4", "6", "12"], "Power Source (for electronic instruments)": ["AC Adapter", "Battery Powered"], "Connectivity / Ports (for electronic)": ["USB", "MIDI", "Headphone Jack", "Sustain Pedal Input"], "Warranty": ["1 Year", "2 Years", "No Warranty"], "Country of Origin": ["India", "China", "Japan", "USA", "Indonesia"] },
  pet_food: { "Brand": ["Pedigree", "Royal Canin", "Whiskas", "Drools", "Farmina N&D", "Acana", "Orijen"], "Pet Type": ["Dog", "Cat", "Fish", "Bird"], "Diet Type / Food Type": ["Dry Food", "Wet Food", "Treats"], "Life Stage": ["Puppy", "Kitten", "Adult", "Senior"], "Breed Size": ["Toy", "Small", "Medium", "Large", "Giant", "All Breed Sizes"], "Health Condition / Special Diet": ["Weight Control", "Sensitive Skin", "Joint Support", "Grain-Free"], "Flavor": ["Chicken", "Lamb", "Fish", "Egg", "Vegetable"], "Vegetarian / Non-Vegetarian": ["Vegetarian", "Non-Vegetarian"], "Form": ["Kibble", "Gravy", "Pate", "Sticks"], "Storage Instructions": ["Store in a cool, dry place", "Refrigerate after opening"], "Maximum Shelf Life (Months)": ["12", "18", "24"], "Country of Origin": ["India", "USA", "France", "Canada"] },
  travel_luggage: { "Brand": ["American Tourister", "Samsonite", "Skybags", "VIP", "Safari", "Mokobara"], "Type": ["Hard-sided Luggage", "Soft-sided Luggage", "Duffle Bag", "Travel Backpack", "Trunk"], "Size": ["Cabin (Small)", "Medium", "Large"], "Ideal For": ["Men", "Women", "Unisex"], "Outer Material": ["Polycarbonate", "Polypropylene", "ABS", "Polyester", "Nylon"], "Number of Wheels": ["2", "4", "8"], "Wheel Type": ["Spinner (360-degree rotation)", "Roller (2-wheel)"], "Lock Type": ["TSA Lock", "Combination Lock", "Key Lock"], "Expandable": ["Yes", "No"], "Water Resistant": ["Yes", "No"], "Number of Compartments": ["1", "2", "3+"], "Handle Type": ["Telescopic Handle"], "Warranty": ["3 Years", "5 Years", "10 Years", "Global Warranty"], "Country of Origin": ["India", "China", "USA"] },
  light: { "Brand": ["Philips", "Wipro", "Syska", "Crompton", "Havells", "Mi"], "Product Type": ["LED Bulb", "LED Tube Light", "Smart Bulb", "Ceiling Light", "Wall Light", "Table Lamp", "String/Fairy Light"], "Ideal For / Usage": ["Indoor", "Outdoor", "Home", "Office", "Decorative"], "Light Color": ["Cool Daylight (White)", "Warm White (Yellowish)", "Natural White", "RGB (Multi-color)"], "Base / Cap Type": ["B22 (Standard Pin)", "E27 (Standard Screw)", "E14 (Small Screw)"], "Dimmable": ["Yes", "No"], "Body Material": ["Polycarbonate", "Aluminium", "Glass", "Plastic"], "Shape": ["Round", "Candle", "Spiral", "Linear (Tube)"], "CRI (Color Rendering Index)": [">70", ">80", ">90"], "Power Source": ["AC", "DC", "Battery Powered", "Solar Powered"], "Warranty": ["1 Year", "2 Years", "No Warranty"], "Country of Origin": ["India", "China"] },
  blanket: { "Brand": ["Raymond Home", "Swayam", "Signature", "Bombay Dyeing", "Portico New York"], "Type": ["Blanket", "Comforter", "Dohar", "Quilt"], "Material": ["Fleece", "Mink", "Wool", "Cotton", "Polyester", "Sherpa"], "Size": ["Single Bed", "Double Bed", "King Size", "Throw"], "Pattern": ["Solid", "Floral", "Geometric", "Abstract", "Checked"], "Ideal For": ["Mild Winter", "Heavy Winter", "AC Room", "Travel"], "Warmth Level / GSM": ["Lightweight", "Medium Weight", "Heavy Weight", "All Season"], "Ply": ["Single Ply", "Double Ply"], "Knit/Woven": ["Knitted", "Woven"], "Reversible": ["Yes", "No"], "Sales Package": ["1 Blanket", "Set of 2"], "Care Instructions": ["Machine Wash", "Hand Wash", "Dry Clean Only"], "Country of Origin": ["India", "China"] },
  bottel: { "Brand": ["Milton", "Cello", "Tupperware", "Borosil", "Treo", "Speedex"], "Type": ["Water Bottle", "Thermos / Flask", "Sipper Bottle", "Infuser Bottle"], "Material": ["Stainless Steel", "Plastic", "Copper", "Glass", "Silicone"], "Capacity (ml/L)": ["500 ml", "750 ml", "1 L", "1.5 L", "2 L"], "Ideal For": ["Home", "Office", "School", "Gym", "Travel"], "Insulated / Thermosteel": ["Yes", "No"], "Leak Proof": ["Yes", "No"], "BPA Free": ["Yes", "No"], "Cap Type": ["Screw Cap", "Flip-Top Cap", "Sipper Cap", "Push Button Cap"], "Dishwasher Safe": ["Yes", "No"], "Sales Package": ["1 Bottle", "Set of 2", "Set of 3"], "Country of Origin": ["India", "China"] },
  battery: { "Brand": ["Duracell", "Eveready", "Panasonic", "Exide", "Luminous", "Amaron"], "Battery Type": ["Disposable", "Rechargeable", "Inverter Battery", "Car Battery"], "Size": ["AA", "AAA", "C", "D", "9V"], "Chemical Composition": ["Alkaline", "Lithium-Ion", "Zinc-Carbon", "Lead-Acid", "Ni-MH"], "Voltage (V)": ["1.2V", "1.5V", "9V", "12V"], "Sales Package": ["Pack of 2", "Pack of 4", "Pack of 10", "Single Piece"], "Rechargeable": ["Yes", "No"], "Pre-Charged": ["Yes", "No"], "Electrolyte Level Indicator": ["Yes", "No"], "Warranty": ["1 Year", "2 Years", "48 Months", "No Warranty"], "Country of Origin": ["India", "China", "Japan", "USA"] },
  Toys: { "Brand": ["LEGO", "Hot Wheels", "Barbie", "Funskool", "Hasbro", "Mattel", "Nerf"], "Type": ["Action Figure", "Doll", "Board Game", "Puzzle", "Remote Control Toy", "Building Blocks", "Educational Toy", "Soft Toy"], "Ideal For": ["Boys", "Girls", "Unisex"], "Recommended Age": ["0-2 Years", "3-5 Years", "6-8 Years", "9-12 Years", "12+ Years"], "Material": ["Plastic", "Wood", "Metal", "Plush / Fabric", "Cardboard"], "Assembly Required": ["Yes", "No"], "Battery Required": ["Yes", "No"], "Battery Type": ["AA", "AAA", "Rechargeable"], "Rechargeable": ["Yes", "No"], "Number of Players (for games)": ["1", "2", "3", "4", "4+"], "Country of Origin": ["India", "China", "USA", "Denmark"] },
  soft_toy: { "Brand": ["Hamleys", "Miniso", "Disney", "Ty", "Funskool"], "Type": ["Teddy Bear", "Dog", "Cat", "Rabbit", "Dinosaur", "Unicorn"], "Ideal For": ["Boys", "Girls", "Unisex"], "Recommended Age": ["0-6 Months", "6-12 Months", "1-2 Years", "3+ Years"], "Outer Material": ["Plush", "Velvet", "Felt", "Faux Fur"], "Filling Material": ["Polyester Fiber", "Cotton", "Foam"], "Washable / Care Instructions": ["Machine Washable", "Hand Wash Only", "Surface Clean Only"], "Country of Origin": ["India", "China", "Vietnam"] },
  diapers: { "Brand": ["Pampers", "Huggies", "MamyPoko", "Little's", "Himalaya Baby"], "Type": ["Diaper Pants", "Taped Diapers"], "Size": ["Newborn (NB)", "Small (S)", "Medium (M)", "Large (L)", "Extra Large (XL)", "XXL"], "Absorption Capacity": ["Up to 12 hours"], "Material": ["Cotton", "Non-woven Fabric"], "Fragrance": ["Yes", "No"], "Maximum Shelf Life (Months)": ["36"], "Country of Origin": ["India", "Japan", "USA"] },
  stroller_pram: { "Brand": ["LuvLap", "R for Rabbit", "Chicco", "Graco", "Mee Mee", "Babyhug"], "Type": ["Stroller", "Pram", "Buggy", "Travel System"], "Recommended Age": ["0-6 Months", "0-12 Months", "6 Months to 3 Years", "0-3 Years"], "Safety Harness": ["3-Point", "5-Point"], "Foldable Mechanism": ["One-Hand Fold", "Umbrella Fold", "Compact Fold"], "Number of Reclining Positions": ["1", "2", "3", "Multiple", "Flat Recline"], "Reversible Handle": ["Yes", "No"], "Canopy": ["Full Canopy", "Half Canopy", "Extendable Canopy"], "Storage Basket": ["Yes", "No"], "Wheel Type": ["Swivel Wheels", "Fixed Wheels", "Swivel & Lockable Wheels"], "Wheel Suspension": ["Yes", "No"], "Brake Type": ["Rear Wheel Brakes", "One-Step Link Brake"], "Frame Material": ["Aluminium", "Steel"], "Country of Origin": ["India", "China"] },
  baby_care: { "Brand": ["Johnson's", "Himalaya Baby", "Sebamed", "Mamaearth", "Cetaphil Baby", "Chicco"], "Product Type": ["Baby Lotion", "Baby Oil", "Baby Shampoo", "Baby Soap", "Baby Powder", "Diaper Rash Cream", "Baby Wipes"], "Recommended Age": ["Newborn (0+ months)", "3+ Months", "6+ Months"], "Ideal For": ["Babies", "Kids"], "Skin Type": ["Normal Skin", "Sensitive Skin", "Dry Skin"], "Skin Concern": ["Dryness", "Rash", "Gentle Cleansing"], "Product Form": ["Cream", "Lotion", "Oil", "Liquid", "Powder", "Bar", "Wipe"], "Key Ingredients": ["Aloe Vera", "Vitamin E", "Olive Oil", "Shea Butter", "Almond Oil"], "Paraben-Free": ["Yes", "No"], "Sulfate-Free": ["Yes", "No"], "Hypoallergenic": ["Yes", "No"], "Dermatologically Tested": ["Yes", "No"], "Scent / Fragrance": ["Fragranced", "Fragrance-Free"], "Container Type": ["Bottle", "Tube", "Jar", "Wipes Pack"], "Maximum Shelf Life (Months)": ["24", "36"], "Country of Origin": ["India", "USA", "Germany"] },
  books: { "Genre": ["Fiction", "Non-Fiction", "Sci-Fi", "Fantasy", "Biography", "Self-Help", "Mystery", "Thriller", "Romance", "Business & Economics"], "Language": ["English", "Hindi", "Marathi", "Bengali", "Tamil"], "Binding": ["Paperback", "Hardcover", "Kindle Edition", "Audiobook"], "Country of Origin": ["India", "USA", "UK"] },
  stationery: { "Brand": ["Classmate", "Faber-Castell", "Camlin", "Parker", "Cello", "Pilot", "Navneet"], "Product Type": ["Pen", "Pencil", "Notebook", "Diary", "Stapler", "Glue Stick", "Highlighter", "Art Set"], "Ideal For": ["Students", "Office Use", "Artists", "General Use"], "Material": ["Plastic", "Metal", "Wood", "Paper"], "Color / Ink Color": ["Blue", "Black", "Red", "Green", "Multi-color"], "Pack of": ["1", "5", "10", "50"], "Country of Origin": ["India", "Japan", "Germany", "China"] },
  pen: { "Brand": ["Parker", "Cello", "Reynolds", "Pilot", "Luxor", "Pentel", "Uniball"], "Type": ["Ballpoint Pen", "Gel Pen", "Fountain Pen", "Rollerball Pen", "Fine liner"], "Ink Color": ["Blue", "Black", "Red", "Green"], "Point Size (mm)": ["0.5mm (Fine)", "0.7mm (Medium)", "1.0mm (Bold)"], "Mechanism": ["Retractable (Click)", "Capped"], "Body Material": ["Plastic", "Metal", "Resin"], "Grip Type": ["Rubberized Grip", "Contoured Grip", "Textured Grip", "No Grip"], "Ink Features": ["Waterproof Ink", "Quick-Drying Ink", "Erasable Ink"], "Refillable": ["Yes", "No"], "Sales Package": ["Pack of 1", "Pack of 5", "Pack of 10", "Box of 50"], "Ideal For": ["Writing", "Calligraphy", "Drawing", "Signing"], "Country of Origin": ["India", "Japan", "Germany", "France"] },
  notebook: { "Brand": ["Classmate", "Navneet", "Sundaram", "Camlin", "Muji"], "Size": ["A4", "A5", "B5", "Pocket Size"], "Number of Pages": ["100", "150", "180", "200", "300"], "Paper Quality (GSM)": ["60 GSM", "70 GSM", "80 GSM", "90 GSM"], "Ruling": ["Ruled / Lined", "Unruled / Plain", "Grid / Graph", "Dotted"], "Binding": ["Spiral Bound", "Perfect Bound (Paperback)", "Stapled / Saddle Stitched", "Hard Bound"], "Cover Type": ["Softcover", "Hardcover"], "Cover Material": ["Paperboard", "Cardboard", "Plastic (Polypropylene)"], "Ideal For": ["Students", "Office Use", "Journaling", "Artists"], "Sales Package": ["Single Notebook", "Pack of 3", "Pack of 6"], "Country of Origin": ["India", "Japan", "China"] },
  sofa: { "Brand": ["IKEA", "Godrej Interio", "Nilkamal", "Pepperfry", "Urban Ladder", "Royaloak"], "Type / Style": ["Sectional Sofa", "Sofa Cum Bed", "Recliner", "Loveseat", "Chesterfield Sofa", "L-Shaped Sofa"], "Seating Capacity": ["1 Seater", "2 Seater", "3 Seater", "4 Seater", "5 Seater", "6+ Seater"], "Upholstery Material": ["Fabric", "Leatherette (Faux Leather)", "Genuine Leather", "Velvet"], "Frame Material": ["Solid Wood", "Engineered Wood", "Metal"], "Filling Material": ["Foam", "Fibre", "Springs", "Down Feather"], "Leg Material": ["Solid Wood", "Metal", "Plastic"], "Storage Included": ["Yes", "No"], "Cushions Included": ["Yes", "No"], "Assembly Required": ["Pre-assembled", "DIY (Do It Yourself)", "Carpenter Assembly"], "Room Type": ["Living Room", "Bedroom", "Office"], "Dimensions (W x H x D in cm)": [], "Weight (kg)": [], "Warranty": [], "Care Instructions": ["Wipe with a dry cloth", "Professional cleaning recommended"], "Country of Origin": ["India", "China", "Malaysia", "Vietnam"] },
  bed: { "Brand": ["IKEA", "Godrej Interio", "Nilkamal", "Pepperfry", "Urban Ladder", "Wakefit"], "Bed Size": ["Single", "Double", "Queen", "King"], "Type": ["Standard Bed", "Bunk Bed", "Sofa Cum Bed", "Trundle Bed", "Four-Poster Bed"], "Material": ["Solid Wood", "Engineered Wood", "Metal"], "Storage Type": ["No Storage", "Box Storage", "Hydraulic Storage", "Drawer Storage"], "Headboard Included": ["Yes", "No"], "Headboard Material": ["Wood", "Upholstered", "Metal"], "Finish Type": ["Matte", "Glossy", "Laminate", "Veneer"], "Style": ["Modern", "Contemporary", "Traditional", "Minimalist"], "Room Type": ["Bedroom", "Kids Room", "Guest Room"], "Assembly Required": ["Pre-assembled", "DIY (Do It Yourself)", "Carpenter Assembly"], "Care Instructions": ["Wipe with a dry cloth", "Do not use harsh chemicals"], "Country of Origin": ["India", "China", "Malaysia", "Vietnam"] },
  office_chair: { "Brand": ["IKEA", "Godrej Interio", "Nilkamal", "Pepperfry", "Urban Ladder", "Wakefit"], "Bed Size": ["Single", "Double", "Queen", "King"], "Type": ["Standard Bed", "Bunk Bed", "Sofa Cum Bed", "Trundle Bed", "Four-Poster Bed"], "Material": ["Solid Wood", "Engineered Wood", "Metal"], "Storage Type": ["No Storage", "Box Storage", "Hydraulic Storage", "Drawer Storage"], "Headboard Included": ["Yes", "No"], "Headboard Material": ["Wood", "Upholstered", "Metal"], "Finish Type": ["Matte", "Glossy", "Laminate", "Veneer"], "Style": ["Modern", "Contemporary", "Traditional", "Minimalist"], "Room Type": ["Bedroom", "Kids Room", "Guest Room"], "Assembly Required": ["Pre-assembled", "DIY (Do It Yourself)", "Carpenter Assembly"], "Care Instructions": ["Wipe with a dry cloth", "Do not use harsh chemicals"], "Country of Origin": ["India", "China", "Malaysia", "Vietnam"] },
  dining_table: { "Brand": ["IKEA", "Godrej Interio", "Nilkamal", "Pepperfry", "Urban Ladder", "Royaloak"], "Set Content": ["1 Table with 4 Chairs", "1 Table with 6 Chairs", "1 Table with 8 Chairs", "Table Only", "Chairs Only"], "Seating Capacity": ["2 Seater", "4 Seater", "6 Seater", "8 Seater"], "Shape": ["Rectangle", "Round", "Square"], "Table Top Material": ["Solid Wood", "Engineered Wood", "Glass", "Marble", "Metal"], "Table Frame Material": ["Solid Wood", "Engineered Wood", "Metal"], "Chair Material": ["Solid Wood", "Engineered Wood", "Metal"], "Chair Upholstery Material": ["Fabric", "Leatherette", "No Upholstery"], "Finish Type": ["Matte", "Glossy", "Laminate", "Veneer"], "Style": ["Modern", "Contemporary", "Traditional", "Industrial"], "Assembly Required": ["Pre-assembled", "DIY (Do It Yourself)", "Carpenter Assembly"], "Care Instructions": ["Wipe with a clean, dry cloth", "Avoid direct sunlight"], "Country of Origin": ["India", "China", "Malaysia", "Vietnam"] },
  wardrobe: { "Brand": ["IKEA", "Godrej Interio", "Nilkamal", "Pepperfry", "Urban Ladder", "Wakefit"], "Number of Doors": ["1 Door", "2 Door", "3 Door", "4 Door", "5 Door"], "Door Type": ["Hinged", "Sliding"], "Material": ["Engineered Wood", "Solid Wood", "Metal", "Plastic"], "Finish Type": ["Matte", "Glossy", "Laminate", "Veneer"], "Mirror Included": ["Yes", "No"], "Locker Included": ["Yes", "No"], "Number of Drawers": ["1", "2", "3", "4", "None"], "Style": ["Modern", "Contemporary", "Traditional"], "Room Type": ["Bedroom", "Kids Room"], "Assembly Required": ["Pre-assembled", "DIY (Do It Yourself)", "Carpenter Assembly"], "Care Instructions": ["Wipe with a clean, dry cloth"], "Country of Origin": ["India", "China", "Malaysia"] },
  bookshelf: { "Brand": ["IKEA", "Godrej Interio", "Nilkamal", "Pepperfry", "Urban Ladder", "Wakefit"], "Type / Design": ["Standard", "Ladder", "Corner", "Wall-Mounted", "Cube"], "Material": ["Engineered Wood", "Solid Wood", "Metal", "Plastic"], "Number of Shelves": ["2", "3", "4", "5", "6+"], "Adjustable Shelves": ["Yes", "No"], "Back Panel": ["Open Back", "Closed Back"], "Doors Included": ["Yes", "No"], "Drawers Included": ["Yes", "No"], "Finish Type": ["Matte", "Glossy", "Laminate", "Veneer"], "Style": ["Modern", "Contemporary", "Traditional", "Industrial", "Minimalist"], "Room Type": ["Living Room", "Study Room", "Office", "Bedroom"], "Assembly Required": ["Pre-assembled", "DIY (Do It Yourself)", "Carpenter Assembly"], "Care Instructions": ["Wipe with a clean, dry cloth"], "Country of Origin": ["India", "China", "Malaysia"] },
  treadmill: { "Brand": ["PowerMax Fitness", "Welcare", "Fitkit", "Durafit", "Cockatoo", "NordicTrack"], "Type": ["Motorized", "Manual"], "Motor Power (HP)": ["1.5 HP", "2.0 HP", "2.5 HP", "3.0 HP", "4.0 HP"], "Incline Type": ["Manual Incline", "Auto Incline", "No Incline"], "Foldable": ["Yes", "No"], "Display Features": ["Time, Speed, Distance, Calories, Heart Rate"], "Heart Rate Sensor": ["Yes", "No"], "Cushioning / Shock Absorption": ["Yes", "No"], "Speakers": ["Yes", "No"], "Transportation Wheels": ["Yes", "No"], },
  bicycle: { "Brand": ["Hero", "Hercules", "Btwin (Decathlon)", "Firefox", "Trek", "Giant", "Atlas"], "Ideal For": ["Men", "Women", "Boys", "Girls", "Unisex"], "Type": ["Mountain Bike (MTB)", "Road Bike", "Hybrid Bike", "City Bike / Commuter", "Fat Bike", "Electric Bike"], "Gear System": ["Single Speed", "Multi-Speed (Geared)"], "Number of Gears": ["1", "7", "18", "21", "24"], "Frame Material": ["Steel", "Alloy", "Carbon Fiber"], "Brake Type": ["Disc Brakes (Mechanical)", "Disc Brakes (Hydraulic)", "V-Brakes / Caliper Brakes"], "Suspension": ["No Suspension / Rigid", "Front Suspension", "Full Suspension"], "Tire Size (inches)": ["26 inch", "27.5 inch", "29 inch", "700c"], "Wheel Type": ["Spoked Wheels", "Alloy Wheels"], "Handlebar Type": ["Flat", "Riser", "Drop"], "Assembly Required": ["Self-Assembly (85% Assembled)", "Pre-Assembled"], },
  dumbbell: { "Brand": ["Protoner", "Kore", "Cockatoo", "Aurion", "Adrenex", "Durafit"], "Type": ["Fixed Weight Dumbbell", "Adjustable Dumbbell", "Kettlebell"], "Sales Package": ["Set of 2", "Single Piece"], "Shape": ["Hexagonal (Hex)", "Round"], "Material": ["Rubber Coated", "Cast Iron", "Vinyl Coated", "Chrome Plated", "PVC"], "Ideal For": ["Men", "Women", "Unisex"], "Usage/Application": ["Home Gym", "Professional Gym", "Strength Training", "Weightlifting"], "Grip Type": ["Contoured", "Knurled", "Rubberized"], "Handle Material": ["Steel", "Chrome", "Rubber"], "Lock Type (for Adjustable)": ["Spin Lock", "Twist Lock"], "Warranty": ["6 Months", "1 Year", "No Warranty"], "Country of Origin": ["India", "China"] },
  cricket_bat: { "Brand": ["SG", "SS (Sareen Sports)", "Kookaburra", "GM (Gunn & Moore)", "Gray-Nicolls", "Spartan"], "Willow Type": ["English Willow", "Kashmir Willow"], "Bat Size": ["Full Size (SH)", "Harrow", "6", "5", "4"], "Ideal For": ["Leather Ball", "Tennis Ball", "Training"], "Player Type": ["Beginner", "Intermediate", "Advanced", "Professional"], "Sweet Spot": ["Low", "Mid", "High"], "Handle Type": ["Short Handle", "Long Handle"], "Cover Included": ["Yes", "No"], "Country of Origin": ["India", "England"] },
  badminton_racket: { "Brand": ["Yonex", "Li-Ning", "Victor", "Apacs", "Carlton"], "Player Type": ["Beginner", "Intermediate", "Advanced"], "Playing Style": ["Attacking", "Defensive", "All-Round"], "Weight (g)": ["75-79g (5U)", "80-84g (4U)", "85-89g (3U)"], "Balance Point": ["Head-Heavy", "Head-Light", "Even-Balance"], "Flex": ["Flexible", "Medium Flex", "Stiff", "Extra Stiff"], "Shaft Material": ["Graphite", "Carbon Fiber", "Aluminium"], "Frame Material": ["Graphite", "Carbon Fiber", "Aluminium"], "Grip Size": ["G3", "G4", "G5"], "Strung": ["Yes", "No"], "Cover Included": ["Full Cover", "Head Cover", "No Cover"], "Country of Origin": ["Japan", "China", "Taiwan"] },
  football: { "Brand": ["Nivia", "Cosco", "Adidas", "Nike", "Puma", "Vector X"], "Size": ["1", "2", "3", "4", "5"], "Outer Material": ["PU (Polyurethane)", "PVC (Polyvinyl Chloride)", "TPU (Thermoplastic Polyurethane)"], "Suitable For": ["Grass", "Astroturf", "Hard Ground", "Indoor"], "Ideal For": ["Match", "Training", "Recreational Play"], "Stitching Type": ["Hand Stitched", "Machine Stitched", "Thermally Bonded"], "Bladder Type": ["Latex Bladder", "Butyl Bladder"], "Number of Panels": ["32", "18", "12"], "Water Resistance": ["Yes", "No"], "Official Approvals": ["FIFA Approved", "None"], "Country of Origin": ["India", "Pakistan", "China"] },
  gym_essentials: { "Brand": ["Kore", "Boldfit", "Strauss", "Nivia", "Adidas", "Nike"], "Product Type": ["Gym Gloves", "Resistance Band", "Skipping Rope", "Ab Roller", "Yoga Mat", "Push-up Bar", "Shaker Bottle"], "Ideal For": ["Men", "Women", "Unisex"], "Material": ["Rubber", "Latex", "Nylon", "Neoprene", "PVC", "Foam", "Leather"], "Usage / Application": ["Strength Training", "Cardio", "Yoga & Pilates", "Crossfit", "Stretching"], "Size": ["S", "M", "L", "XL", "Adjustable", "Standard"], "Washable / Care Instructions": ["Yes", "No", "Hand Wash Only"], "Warranty": ["3 Months", "6 Months", "No Warranty"], "Country of Origin": ["India", "China"] },
  facewash: { "Brand": ["Himalaya", "Cetaphil", "Clean & Clear", "Neutrogena", "Mamaearth", "WOW Skin Science", "Pond's"], "Ideal For": ["Men", "Women", "Unisex"], "Skin Type": ["Oily", "Dry", "Normal", "Combination", "Sensitive", "Acne-Prone", "All Skin Types"], "Skin Concern": ["Acne / Pimples", "Dullness", "Tan Removal", "Oil Control", "Dryness", "Dark Spots"], "Applied For": ["Cleansing", "Brightening", "Exfoliating", "Hydrating"], "Product Form": ["Gel", "Foam", "Cream", "Scrub", "Lotion"], "Key Ingredients": ["Salicylic Acid", "Neem", "Tea Tree Oil", "Aloe Vera", "Vitamin C", "Hyaluronic Acid", "Glycerine"], "Scent / Fragrance": ["Fragranced", "Fragrance-Free"], "Paraben-Free": ["Yes", "No"], "Sulfate-Free": ["Yes", "No"], "Organic": ["Yes", "No"], "Volume (ml)": ["50", "100", "150", "200"], "Container Type": ["Tube", "Bottle with Pump", "Bottle with Flip-top"], "Maximum Shelf Life (Months)": ["24", "36"], "Country of Origin": ["India", "USA", "France", "South Korea"] },
  buty_cream: { "Brand": ["Nivea", "Pond's", "Olay", "Lakme", "L'Oréal", "Mamaearth", "Plum"], "Ideal For": ["Men", "Women", "Unisex"], "Skin Type": ["Oily", "Dry", "Normal", "Combination", "Sensitive", "All Skin Types"], "Skin Concern": ["Anti-Ageing", "Moisturizing & Nourishment", "Fairness / Brightening", "Acne / Pimples", "Dark Spots Removal", "Sun Protection"], "Product Form": ["Cream", "Lotion", "Gel", "Serum"], "Ideal Usage Time": ["Day", "Night", "Day & Night"], "Application Area": ["Face", "Body", "Face & Neck"], "SPF (Sun Protection Factor)": ["No SPF", "SPF 15", "SPF 25", "SPF 30", "SPF 50"], "Key Ingredients": ["Hyaluronic Acid", "Retinol", "Vitamin C", "Niacinamide", "Glycerine", "Shea Butter", "Salicylic Acid"], "Paraben-Free": ["Yes", "No"], "Organic": ["Yes", "No"], "Scent / Fragrance": ["Fragranced", "Fragrance-Free"], "Container Type": ["Jar", "Tube", "Bottle with Pump"], "Maximum Shelf Life (Months)": ["24", "36"], "Country of Origin": ["India", "USA", "France", "South Korea"] },
  powder: { "Brand": ["Pond's", "Nycil", "Dermicool", "Lakme", "Maybelline", "Johnson's Baby"], "Type": ["Talcum Powder", "Compact Powder", "Loose Powder", "Baby Powder", "Prickly Heat Powder"], "Ideal For": ["Men", "Women", "Babies", "Unisex"], "Skin Type": ["Oily", "Dry", "Normal", "Combination", "Sensitive", "All Skin Types"], "Skin Concern": ["Oil Control", "Sweat Control", "Soothing", "Sun Protection", "Rash Prevention"], "Product Form": ["Loose Powder", "Pressed Powder"], "Finish": ["Matte", "Natural", "Radiant"], "SPF (Sun Protection Factor)": ["No SPF", "SPF 15", "SPF 25", "SPF 30"], "Key Ingredients": ["Talc", "Menthol", "Sandalwood", "Zinc Oxide"], "Application Area": ["Face", "Body"], "Container Type": ["Bottle", "Compact Case with Mirror", "Jar"], "Maximum Shelf Life (Months)": ["24", "36"], "Country of Origin": ["India", "USA", "Thailand"] },
  shampoo: { "Brand": ["Head & Shoulders", "Dove", "Pantene", "L'Oréal Paris", "Sunsilk", "Tresemmé", "Mamaearth", "WOW Skin Science"], "Ideal For": ["Men", "Women", "Unisex"], "Hair Type": ["All Hair Types", "Normal", "Dry", "Oily", "Damaged Hair", "Color Treated Hair"], "Hair Concern": ["Dandruff", "Hair Fall", "Damage Repair", "Frizz Control", "Color Protection", "Dryness", "Split Ends"], "Applied For": ["Anti-dandruff", "Anti-hair Fall", "Straightening & Smoothening", "Nourishment & Moisturization", "Damage Repair"], "Product Form": ["Liquid", "Gel", "Cream"], "Key Ingredients": ["Keratin", "Argan Oil", "Onion Oil", "Tea Tree Oil", "Aloe Vera", "Biotin", "Caffeine"], "Sulfate-Free": ["Yes", "No"], "Paraben-Free": ["Yes", "No"], "Silicone-Free": ["Yes", "No"], "Organic": ["Yes", "No"], "Quantity (ml)": ["100", "180", "340", "500", "1000"], "Container Type": ["Bottle", "Bottle with Pump", "Sachet"], "Maximum Shelf Life (Months)": ["24", "36"], "Country of Origin": ["India", "USA", "France", "Thailand"] },
  lipstick: { "Brand": ["Maybelline", "L'Oréal Paris", "MAC", "Lakme", "Sugar Cosmetics", "Huda Beauty", "Nykaa Cosmetics"], "Ideal For": ["Women", "Girls"], "Color Family": ["Red", "Pink", "Nude", "Brown", "Maroon", "Purple", "Orange"], "Finish": ["Matte", "Creamy Matte", "Glossy", "Satin", "Sheer", "Metallic"], "Product Form": ["Liquid", "Bullet / Stick", "Crayon", "Lip Cream"], "Coverage": ["Full", "Medium", "Sheer"], "Benefits / Features": ["Long-lasting", "Waterproof", "Smudge-proof", "Hydrating", "Moisturizing"], "Skin Tone Suitability": ["Fair", "Medium", "Dusky", "All Skin Tones"], "Paraben-Free": ["Yes", "No"], "Organic": ["Yes", "No"], "Container Type": ["Tube", "Wand with Applicator", "Crayon Stick"], "Maximum Shelf Life (Months)": ["24", "36"], "Country of Origin": ["India", "USA", "France", "Germany", "South Korea"] },
  perfume: { "Brand": ["Dior", "Chanel", "Calvin Klein", "Giorgio Armani", "Davidoff", "Paco Rabanne", "Titan Skinn", "Fogg"], "Ideal For": ["Men", "Women", "Unisex"], "Type": ["Eau de Parfum (EDP)", "Eau de Toilette (EDT)", "Eau de Cologne (EDC)", "Parfum", "Deodorant", "Body Mist"], "Quantity (ml)": ["30", "50", "100", "150", "200"], "Fragrance Family": ["Fresh", "Floral", "Spicy", "Woody", "Oriental", "Fruity"], "Container Type": ["Glass Bottle - Spray", "Roll-on", "Can"], "Limited Edition": ["Yes", "No"], "Country of Origin": ["France", "Italy", "USA", "India", "UAE"], "Maximum Shelf Life (Months)": ["36", "48", "60"] },
  trimmer_shaver: { "Brand": ["Philips", "Mi", "Havells", "Syska", "Braun", "Wahl", "Nova"], "Type": ["Trimmer", "Shaver", "Body Groomer", "Multi-grooming Kit"], "Ideal For": ["Men", "Women"], "Power Source": ["Rechargeable Battery", "Corded", "Corded & Cordless"], "Blade Material": ["Stainless Steel", "Titanium Coated", "Ceramic"], "Quick Charge": ["Yes", "No"], "Washable": ["Fully Washable", "Washable Head", "Not Washable"], "Charging Indicator": ["Yes", "No", "LED Indicator"], "Body Material": ["Plastic", "Metal"], "Warranty": ["1 Year", "2 Years", "3 Years"], "Country of Origin": ["China", "Indonesia", "Germany", "India"] },
  sunscreen: { "Brand": ["Neutrogena", "La Roche-Posay", "Biotique", "Lotus Herbals", "Mamaearth", "The Derma Co", "Minimalist"], "Ideal For": ["Men", "Women", "Unisex"], "Sunscreen Type": ["Physical (Mineral)", "Chemical", "Hybrid"], "SPF (Sun Protection Factor)": ["SPF 15", "SPF 25", "SPF 30", "SPF 50", "SPF 50+"], "PA Rating": ["PA+", "PA++", "PA+++", "PA++++"], "Broad Spectrum Protection": ["Yes", "No"], "Skin Type": ["Oily", "Dry", "Normal", "Combination", "Sensitive", "Acne-Prone", "All Skin Types"], "Product Form": ["Lotion", "Cream", "Gel", "Spray", "Stick"], "Application Area": ["Face", "Body", "Face & Body"], "Finish": ["Matte", "Dewy", "Natural"], "Key Ingredients": ["Zinc Oxide", "Titanium Dioxide", "Avobenzone", "Oxybenzone", "Niacinamide", "Hyaluronic Acid"], "Water Resistance": ["Water Resistant", "Very Water Resistant", "Not Water Resistant"], "Paraben-Free": ["Yes", "No"], "Fragrance-Free": ["Yes", "No"], "Country of Origin": ["India", "USA", "France", "South Korea"] },
  moisturizer: { "Brand": ["Cetaphil", "Nivea", "Pond's", "Minimalist", "The Derma Co", "Plum", "Simple", "Neutrogena"], "Ideal For": ["Men", "Women", "Unisex"], "Skin Type": ["Oily", "Dry", "Normal", "Combination", "Sensitive", "Acne-Prone", "All Skin Types"], "Skin Concern": ["Dryness", "Dullness", "Oiliness", "Acne / Pimples", "Anti-Ageing", "Redness"], "Product Form": ["Cream", "Lotion", "Gel"], "Application Area": ["Face", "Body", "Face & Body"], "Ideal Usage Time": ["Day", "Night", "Day & Night"], "SPF (Sun Protection Factor)": ["No SPF", "SPF 15", "SPF 25", "SPF 30"], "Key Ingredients": ["Hyaluronic Acid", "Ceramides", "Glycerine", "Niacinamide", "Shea Butter", "Vitamin E"], "Paraben-Free": ["Yes", "No"], "Silicone-Free": ["Yes", "No"], "Fragrance-Free": ["Yes", "No"], "Container Type": ["Jar", "Tube", "Bottle with Pump"], "Maximum Shelf Life (Months)": ["24", "36"], "Country of Origin": ["India", "USA", "France", "South Korea"] },
  bag: { "For / Gender": ["Men", "Women", "Unisex"], "Brand": ["American Tourister", "Skybags", "Wildcraft", "Puma", "Lavie", "Caprese"], "Type": ["Backpack", "Laptop Backpack", "Handbag", "Sling Bag", "Tote Bag", "Duffle Bag", "Messenger Bag"], "Material": ["Polyester", "Nylon", "Genuine Leather", "Faux Leather / PU", "Canvas"], "Number of Compartments": ["1", "2", "3", "4+"], "Closure Type": ["Zip", "Buckle", "Drawstring", "Magnetic Snap"], "Laptop Sleeve": ["Yes", "No"], "Laptop Size Compatibility (inches)": ["Up to 14 inch", "Up to 15.6 inch", "Up to 17 inch"], "Water Resistant": ["Yes", "No"], "Strap Type": ["Adjustable Strap", "Detachable Strap", "Padded Strap"], "Occasion": ["Casual", "Formal", "Travel", "College", "School"], "Warranty": ["6 Months", "1 Year", "2 Years", "No Warranty"], "Country of Origin": ["India", "China", "Vietnam"] },
  wallet: { "For / Gender": ["Men", "Women", "Unisex"], "Brand": ["Titan", "Tommy Hilfiger", "WildHorn", "Urban Forest", "Levi's", "Hidesign"], "Type": ["Bi-Fold Wallet", "Tri-Fold Wallet", "Card Holder", "Long Wallet / Clutch", "Money Clip"], "Material": ["Genuine Leather", "Faux Leather / PU", "Nylon", "Canvas"], "Number of Main Compartments": ["1", "2", "3"], "Number of Card Slots": ["1-3", "4-6", "7-9", "10+"], "Coin Pocket": ["Yes", "No"], "ID Card Holder": ["Yes", "No"], "RFID Protection": ["Yes", "No"], "Closure Type": ["No Closure", "Button", "Zip"], "Pattern": ["Solid", "Textured", "Printed"], "Occasion": ["Casual", "Formal"], "Warranty": ["3 Months", "6 Months", "1 Year", "No Warranty"], "Country of Origin": ["India", "China"] },
  jeans: { "For / Gender": ["Men", "Women"], "Brand": ["Levi's", "Wrangler", "Pepe Jeans", "Lee", "Mufti", "Flying Machine", "Spykar"], "Size (Waist in Inches)": ["28", "30", "32", "34", "36", "38", "40"], "Fit": ["Skinny Fit", "Slim Fit", "Regular Fit", "Relaxed Fit", "Tapered Fit", "Bootcut"], "Waist Rise": ["Low-Rise", "Mid-Rise", "High-Rise"], "Fabric": ["Denim", "Stretch Denim", "Cotton Blend"], "Stretch": ["Stretchable", "Non-Stretchable"], "Shade / Wash": ["Light Fade", "Medium Fade", "Dark Wash", "Clean Look", "Stonewashed"], "Distress": ["None", "Lightly Distressed", "Heavily Distressed"], "Closure Type": ["Button and Zip"], "Fly Type": ["Zip Fly", "Button Fly"], "Number of Pockets": ["5"], "Occasion": ["Casual", "Daily Wear"], "Care Instructions": ["Machine Wash", "Hand Wash", "Wash Inside Out"], "Country of Origin": ["India", "Bangladesh", "Vietnam"] },
  kurta: { "For / Gender": ["Men", "Women"], "Brand": ["Manyavar", "FabIndia", "Biba", "W for Woman", "Peter England", "Libas"], "Size": ["S", "M", "L", "XL", "XXL", "3XL"], "Fabric": ["Cotton", "Silk", "Linen", "Rayon", "Cotton Silk", "Brocade", "Jacquard"], "Style / Set Type": ["Kurta Only", "Kurta with Pajama", "Kurta with Churidar", "Kurta with Dhoti Pants", "Pathani Suit"], "Sleeve Style": ["Full Sleeve", "3/4 Sleeve", "Half Sleeve", "Roll-up Sleeve"], "Length": ["Knee-Length", "Long", "Short", "Calf-Length"], "Neck Style": ["Mandarin Collar", "Round Neck", "V-Neck", "Henley Neck", "Bandhgala"], "Pattern": ["Solid", "Printed", "Embroidered", "Self-Design", "Woven Design", "Chikankari"], "Hemline": ["Straight", "Asymmetric", "High-Low", "A-Line"], "Slit Details": ["Side Slits", "Front Slit", "Multiple Slits"], "Number of Pockets": ["One", "Two", "None"], "Occasion": ["Ethnic", "Casual", "Festive", "Wedding"], "Care Instructions": ["Hand Wash", "Dry Clean Only", "Machine Wash (Gentle)"], "Country of Origin": ["India"] },
  saree: { "Brand": ["Sabyasachi", "Manish Malhotra", "Kalamandir", "Nalli", "Satya Paul"], "Type / Style": ["Banarasi", "Kanjeevaram", "Bandhani", "Leheriya", "Chanderi", "Paithani", "Ready to Wear Saree"], "Fabric": ["Silk", "Cotton", "Georgette", "Chiffon", "Satin", "Crepe", "Net", "Velvet", "Banarasi Silk", "Kanjeevaram Silk", "Linen"], "Work / Embellishment": ["Zari", "Sequins", "Beads", "Stone Work", "Gota Patti", "Thread Work"], "Pattern / Print": ["Embroidered", "Printed", "Woven Design", "Solid", "Floral", "Embellished"], "Border Type": ["Zari Border", "Contrasting Border", "No Border", "Temple Border"], "Saree Length (m)": ["5.5 Meters", "6 Meters", "6.3 Meters"], "Blouse Included": ["Yes", "No"], "Blouse Piece Length (m)": ["0.8 Meters", "1 Meter"], "Blouse Stitch Type": ["Unstitched", "Stitched"], "Blouse Work": ["Embroidered", "Solid", "Printed", "Matching"], "Transparency": ["Opaque", "Sheer", "Semi-Sheer"], "Occasion": ["Wedding", "Party", "Formal", "Casual", "Festive", "Bridal"], "Care Instructions": ["Dry Clean Only", "Hand Wash"], "Country of Origin": ["India"] },
  dress: { "For / Gender": ["Women", "Girls"], "Size": ["XS", "S", "M", "L", "XL", "XXL"], "Fabric": ["Cotton", "Polyester", "Rayon", "Viscose", "Georgette", "Crepe", "Linen", "Denim"], "Shape / Style": ["A-Line", "Sheath", "Shift", "Bodycon", "Fit and Flare", "Maxi", "Shirt Dress", "Wrap Dress"], "Length": ["Mini", "Short", "Knee-Length", "Midi", "Maxi", "Ankle-Length"], "Sleeve Style": ["Sleeveless", "Short Sleeve", "Half Sleeve", "3/4 Sleeve", "Full Sleeve", "Puff Sleeve", "Spaghetti Strap"], "Neck Style": ["Round Neck", "V-Neck", "Square Neck", "Halter Neck", "Off-Shoulder", "Boat Neck"], "Pattern": ["Solid", "Printed", "Floral", "Polka Dot", "Striped", "Checked", "Embroidered"], "Occasion": ["Casual", "Party", "Formal", "Beach Wear", "Workwear"], "Closure Type": ["Pull-On", "Zip", "Button"], "Lining": ["Has Lining", "No Lining"], "Transparency": ["Opaque", "Semi-Sheer"], "Knit or Woven": ["Knit", "Woven"], "Care Instructions": ["Machine Wash", "Hand Wash", "Dry Clean Only"], "Country of Origin": ["India", "China", "Vietnam"] },
  shoes: { "For / Gender": ["Men", "Women", "Boys", "Girls", "Unisex"], "Brand": ["Nike", "Adidas", "Puma", "Reebok", "Woodland", "Bata", "Clarks", "Skechers", "Red Tape"], "Type": ["Sneakers", "Running Shoes", "Formal Shoes", "Boots", "Sandals", "Loafers", "Sports Shoes"], "Size (UK/India)": ["6", "7", "8", "9", "10", "11", "12"], "Outer Material": ["Genuine Leather", "Synthetic Leather", "Canvas", "Mesh", "Suede", "Textile"], "Sole Material": ["Rubber", "EVA (Ethylene Vinyl Acetate)", "PU (Polyurethane)", "TPR (Thermoplastic Rubber)"], "Closure Type": ["Lace-Up", "Slip-On", "Velcro", "Zipper", "Buckle"], "Occasion": ["Casual", "Formal", "Sports", "Party", "Ethnic"], "Toe Shape": ["Round Toe", "Pointed Toe", "Square Toe"], "Heel Type": ["Flat", "Block Heel", "Stiletto", "Wedge Heel"], "Ankle Height": ["Regular", "Mid-Top", "High-Top"], "Insole Material": ["Memory Foam", "Cushioned", "Padded"], "Warranty": ["3 Months", "6 Months", "No Warranty"], "Care Instructions": ["Wipe with a clean, dry cloth", "Use Shoe Polish", "Do not wash"], "Country of Origin": ["India", "China", "Vietnam"] },
  sandals_floaters: { "For / Gender": ["Men", "Women", "Boys", "Girls", "Unisex"], "Brand": ["Crocs", "Bata", "Paragon", "Sparx", "Hush Puppies", "Woodland", "Puma"], "Type": ["Sandals", "Floaters", "Flip-Flops", "Sliders", "Clogs"], "Size (UK/India)": ["6", "7", "8", "9", "10", "11", "12"], "Upper Material": ["Synthetic", "Genuine Leather", "Textile", "Rubber", "Mesh"], "Sole Material": ["Rubber", "EVA (Ethylene Vinyl Acetate)", "PU (Polyurethane)", "TPR (Thermoplastic Rubber)"], "Closure Type": ["Velcro", "Slip-On", "Buckle"], "Occasion": ["Casual", "Ethnic", "Daily Wear", "Beach Wear"], "Heel Type": ["Flat", "Platform", "Wedge"], "Insole Material": ["Padded", "Cushioned", "Textured"], "Arch Type": ["Flat", "Medium", "High"], "Water Resistant": ["Yes", "No"], "Warranty": ["3 Months", "6 Months", "No Warranty"], "Care Instructions": ["Wipe with a clean, dry cloth", "Washable"], "Country of Origin": ["India", "China", "Vietnam"] },
  jacket: { "For / Gender": ["Men", "Women", "Unisex"], "Brand": ["Puma", "Adidas", "Nike", "U.S. Polo Assn.", "Levi's", "Roadster", "Woodland"], "Type / Style": ["Bomber Jacket", "Denim Jacket", "Leather Jacket", "Puffer Jacket", "Windcheater", "Hooded Jacket", "Blazer"], "Size": ["S", "M", "L", "XL", "XXL"], "Fabric": ["Polyester", "Denim", "Genuine Leather", "Faux Leather", "Cotton", "Nylon", "Fleece"], "Fit": ["Regular Fit", "Slim Fit"], "Sleeve Style": ["Full Sleeve", "Sleeveless"], "Neck Style": ["Hooded", "High Neck", "Mock Collar", "Notch Lapel", "Spread Collar"], "Closure Type": ["Zip", "Button"], "Lining Material": ["Polyester", "Fleece", "Satin", "No Lining"], "Number of Pockets": ["2", "3", "4", "None"], "Water Resistant": ["Yes", "No"], "Occasion": ["Casual", "Party", "Formal", "Sports", "Winter Wear"], "Care Instructions": ["Machine Wash", "Dry Clean Only", "Hand Wash"], "Country of Origin": ["India", "China", "Vietnam", "Bangladesh"] },
  sunglasses: { "For / Gender": ["Men", "Women", "Unisex"], "Brand": ["Ray-Ban", "Oakley", "Fastrack", "Lenskart", "Vogue", "Prada", "Gucci"], "Frame Shape": ["Aviator", "Wayfarer", "Round", "Square", "Rectangle", "Cat-Eye", "Oval", "Clubmaster"], "Frame Style": ["Full Rim", "Half Rim", "Rimless"], "Frame Material": ["Metal", "Plastic", "Acetate", "Polycarbonate", "Titanium"], "Frame Color": [], "Frame Size": ["Small", "Medium", "Large"], "Lens Color": [], "Lens Material": ["Polycarbonate", "Glass", "Plastic", "CR-39"], "Lens Technology": ["Polarized", "Mirrored", "Gradient", "Photochromic (Transitions)", "Standard"], "UV Protection Level": ["100% UV Protection", "UV400"], "Temple Material": ["Metal", "Plastic", "Acetate"], "Nose Pad Type": ["Adjustable Nose Pads", "Fixed Nose Pads"], "Ideal For": ["Driving", "Biking", "Beach", "General Use"], "Case Type": ["Hard Case", "Soft Case / Pouch"], "Warranty": ["6 Months", "1 Year", "2 Years"], "Country of Origin": ["Italy", "USA", "China", "India"] },
  tshirt: { "For / Gender": ["Men", "Women", "Boys", "Girls", "Unisex"], "Brand": ["Nike", "Adidas", "Puma", "Levi's", "Roadster", "H&M", "Bewakoof.com", "The Souled Store"], "Size": ["XS", "S", "M", "L", "XL", "XXL"], "Fit": ["Regular Fit", "Slim Fit", "Oversized Fit", "Muscle Fit"], "Fabric": ["100% Cotton", "Polyester", "Cotton Blend", "Linen Blend", "Pima Cotton", "Jersey"], "Fabric GSM": ["160 GSM", "180 GSM", "200 GSM"], "Sleeve Style": ["Half Sleeve", "Full Sleeve", "Sleeveless", "Raglan Sleeve"], "Neck Style": ["Round Neck", "V-Neck", "Polo Neck", "Henley Neck"], "Pattern": ["Solid", "Printed", "Striped", "Colorblock"], "Print or Pattern Type": ["Graphic Print", "Typographic", "Abstract", "Character"], "Occasion": ["Casual", "Sportswear", "Daily Wear", "Loungewear"], "Season": ["Summer", "All Season"], "Pack of": ["1", "2", "3", "5"], "Care Instructions": ["Machine Wash", "Hand Wash", "Do Not Bleach", "Tumble Dry Low"], "Country of Origin": ["India", "China", "Bangladesh", "Vietnam"] },
  shirt: { "For / Gender": ["Men", "Women", "Boys"], "Brand": ["Van Heusen", "Allen Solly", "Peter England", "Louis Philippe", "Arrow", "Raymond"], "Size": ["S", "M", "L", "XL", "XXL", "38", "39", "40", "42", "44"], "Fit": ["Regular Fit", "Slim Fit", "Tailored Fit", "Relaxed Fit"], "Fabric": ["100% Cotton", "Linen", "Cotton Blend", "Denim", "Flannel", "Rayon", "Viscose"], "Sleeve Style": ["Full Sleeve", "Half Sleeve", "Roll-up Sleeve"], "Collar Style": ["Spread Collar", "Button-Down Collar", "Mandarin Collar", "Cutaway Collar"], "Cuff Style": ["Single Cuff", "Double Cuff / French Cuff"], "Pattern": ["Solid", "Checked", "Striped", "Printed", "Dobby"], "Placket": ["Full Button Placket", "Half Button Placket"], "Hemline": ["Curved Hemline", "Straight Hemline"], "Number of Pockets": ["One", "Two", "None"], "Occasion": ["Formal", "Casual", "Party", "Business Casual"], "Pack of": ["1", "2"], "Care Instructions": ["Machine Wash", "Hand Wash", "Dry Clean Recommended"], "Country of Origin": ["India", "Bangladesh", "Vietnam"] },
  fashion: { "For / Gender": ["Men", "Women", "Boys", "Girls", "Unisex"], "Product Type": ["T-Shirt", "Shirt", "Jeans", "Trousers", "Kurta", "Saree", "Dress", "Jacket"], "Brand": [], "Size": ["XS", "S", "M", "L", "XL", "XXL", "Free Size"], "Fabric": ["Cotton", "Polyester", "Silk", "Denim", "Wool", "Linen", "Rayon", "Blended"], "Fit": ["Regular Fit", "Slim Fit", "Skinny Fit", "Relaxed Fit", "Oversized Fit"], "Pattern": ["Solid", "Printed", "Striped", "Checked", "Embroidered", "Floral"], "Sleeve Style": ["Full Sleeve", "Half Sleeve", "Sleeveless", "3/4 Sleeve", "Roll-up Sleeve"], "Neck Style": ["Round Neck", "V-Neck", "Polo Neck", "Henley Neck", "Hooded", "Collar"], "Closure Type": ["Button", "Zipper", "Drawstring", "Pull-On"], "Occasion": ["Casual", "Formal", "Party", "Ethnic", "Sportswear", "Festive"], "Season": ["Summer", "Winter", "All Season"], "Pack of": ["1", "2", "3", "5"], "Care Instructions": ["Machine Wash", "Hand Wash", "Dry Clean Only"], "Country of Origin": ["India", "China", "Bangladesh", "Vietnam"] },
  geyser: { "Brand": ["Bajaj", "AO Smith", "Havells", "Crompton", "Racold", "V-Guard"], "Type": ["Storage Water Heater", "Instant Water Heater", "Gas Water Heater"], "Capacity (Liters)": ["3", "6", "10", "15", "25"], "Installation Type": ["Vertical", "Horizontal"], "Wattage (Watts)": [], "Energy Rating": ["2 Star", "3 Star", "4 Star", "5 Star", "No Rating"], "Rated Pressure (Bar)": ["6.5 Bar", "8 Bar"], "Heating Element": ["Copper", "Incoloy 800", "Glass Coated Incoloy"], "Tank Material": ["Stainless Steel", "Mild Steel with Glass Lining", "Vitreous Enamel Coated"], "Anode Rod": ["Magnesium Anode Rod"], "Body Material": ["ABS Plastic", "Metal"], "Temperature Control": ["Adjustable Knob", "Fixed"], "Safety Features": [], "Dimensions (cm)": [], "Warranty": [] },
  cooler: { "Brand": ["Symphony", "Bajaj", "Crompton", "Havells", "Kenstar", "Orient Electric"], "Type": ["Personal Air Cooler", "Desert Air Cooler", "Tower Air Cooler", "Window Air Cooler"], "Water Tank Capacity (Liters)": [], "Air Flow (CFM)": [], "Cooling Medium": ["Honeycomb Pads", "Aspen Wood Wool Pads"], "Ice Chamber": ["Yes", "No"], "Inverter Compatible": ["Yes", "No"], "Speed Control": ["3 Speed", "4 Speed", "Variable Speed"], "Remote Control": ["Yes", "No"], "Auto Louver Movement": ["Yes", "No"], "Water Level Indicator": ["Yes", "No"], "Power Consumption (Watts)": [], "Body Material": ["ABS Plastic", "Polypropylene"], "Castor Wheels": ["Yes", "No"], "Dimensions (cm)": [], "Warranty": ["1 Year", "2 Years"] },
  fan: { "Brand": ["Usha", "Orient", "Havells", "Crompton", "Bajaj", "Atomberg"], "Type": ["Ceiling Fan", "Table Fan", "Pedestal Fan", "Wall-Mounted Fan", "Exhaust Fan", "Tower Fan"], "Motor Type": ["BLDC Motor", "Induction Motor"], "Sweep Size (mm)": ["900", "1200", "1400"], "Number of Blades": ["3", "4", "5"], "Speed Settings": ["3", "4", "5"], "Power Consumption (W)": [], "Remote Control": ["Yes", "No"], "Body Material": ["Aluminium", "Plastic", "Steel"], "Warranty": ["1 Year", "2 Years", "3 Years"], "Noise Level (dB)": [] },
  induction_cooktop: { "Brand": ["Philips", "Prestige", "Bajaj", "Havells", "Usha"], "Control Type": ["Push Button", "Touch Panel", "Knob Control"], "Wattage": ["1600W", "1800W", "2000W", "2100W"], "Preset Menus": [], "Body Material": ["Ceramic Glass", "ABS Plastic"], "Warranty": ["1 Year", "2 Years"] },
  coffee_maker: { "Brand": ["Philips", "Prestige", "Morphy Richards", "De'Longhi", "Cafe Coffee Day"], "Type": ["Drip", "Espresso"], "Capacity (Cups)": [], "Brewing Time": [], "Filter Type": ["Permanent Filter", "Paper Filter"], "Body Material": ["Plastic", "Stainless Steel", "Glass Carafe"], "Warranty": ["1 Year", "2 Years"] },
  toaster: { "Brand": ["Philips", "Bajaj", "Prestige", "Morphy Richards", "Kent"], "Slices": ["2", "4"], "Functions": ["Toasting", "Reheating", "Defrosting"], "Power Consumption (W)": [], "Variable Browning Control": ["Yes", "No"], "Body Material": ["Plastic", "Stainless Steel"], "Warranty": ["1 Year", "2 Years"] },
  mixer_grinder: { "Brand": ["Preethi", "Bajaj", "Philips", "Sujata"], "Wattage": ["500W", "750W", "1000W"], "Jars": ["2", "3", "4"], "Speed Settings": [], "Blade Material": ["Stainless Steel"], "Body Material": ["ABS Plastic"], "Warranty": ["2 Years"] },
  vacuum_cleaner: { "Brand": ["Philips", "Eureka Forbes", "Dyson"], "Type": ["Canister", "Handheld", "Robotic"], "Cord Length (m)": [], "Noise Level (dB)": [], "Warranty": ["1 Year"] },
  water_purifier: { "Brand": ["Kent", "Aquaguard", "Pureit"], "Purification Technology": ["RO", "UV", "UF", "RO+UV"], "Installation Type": ["Wall Mounted", "Table Top"], "Warranty": ["1 Year"] },

  microwave_oven: { "Brand": ["LG", "Samsung", "IFB", "Bajaj"], "Capacity (Liters)": ["20", "25", "30"], "Type": ["Solo", "Grill", "Convection"], "Control Type": ["Tact Dial", "Touch Panel"], "Warranty": ["1 Year"] },
  air_conditioner: { "Brand": ["LG", "Voltas", "Daikin", "Hitachi", "Blue Star"], "Capacity (Tons)": ["1", "1.5", "2"], "Type": ["Split AC", "Window AC"], "Energy Rating": ["3 Star", "4 Star", "5 Star"], "Inverter": ["Yes", "No"], "Color": ["White"], "Warranty": ["1 Year on Product, 10 Years on Compressor"] },
  washing_machine: { "Brand": ["LG", "Samsung", "IFB", "Bosch", "Whirlpool"], "Type": ["Top Load", "Front Load"], "Capacity (Kg)": ["6", "7", "8", "9"], "Function": ["Semi-Automatic", "Fully-Automatic"], "Energy Rating": ["4 Star", "5 Star"] },
  refrigerator: { "Brand": ["LG", "Samsung", "Whirlpool", "Haier", "Godrej"], "Type": ["Single Door", "Double Door", "Side-by-Side"], "Energy Rating": ["2 Star", "3 Star", "4 Star", "5 Star"], "Defrost Type": ["Direct Cool", "Frost Free"], "Compressor Type": ["Inverter", "Standard"], "Warranty": ["1 Year on Product, 10 Years on Compressor"] },
  storage_device: { "Brand": ["SanDisk", "Samsung", "Seagate", "WD", "Crucial"], "Type": ["SSD", "HDD", "Pen Drive", "Memory Card"], "Interface": ["SATA", "NVMe", "USB 3.0", "USB-C"], "Form Factor": ["2.5-inch", "M.2"], "Warranty": ["3 Years", "5 Years"] },
  projector: { "Brand": ["Epson", "BenQ", "ViewSonic", "Optoma"], "Resolution": ["SVGA", "XGA", "Full HD", "4K"], "Projection Technology": ["LCD", "DLP"], "Connectivity": ["HDMI", "VGA", "USB"], "Warranty": ["2 Years"] },
  mouse: { "Brand": ["Logitech", "HP", "Dell", "Razer", "Corsair"], "Type": ["Optical", "Laser"], "Connectivity": ["Wired", "Wireless"], "Warranty": ["1 Year", "3 Years"] },
  keyboard: { "Brand": ["Logitech", "HP", "Dell", "TVS", "Razer", "Corsair"], "Type": ["Membrane", "Mechanical"], "Connectivity": ["Wired", "Wireless"], "Backlit": ["Yes", "No", "RGB"], "Switch Type": ["Blue", "Red", "Brown"], "Layout": ["US", "UK"] },
  power_bank: { "Brand": ["Mi", "Realme", "Anker", "Ambrane"], "Capacity (mAh)": ["10000", "20000"], "Ports": ["USB-A", "USB-C", "Micro USB"], "Warranty": ["6 Months", "1 Year"] },
  speaker: { "Brand": ["JBL", "Bose", "Sony", "Boat", "Marshall", "Ultimate Ears"], "Type": ["Portable", "Bookshelf", "Soundbar", "Smart Speaker"], "Connectivity": ["Bluetooth", "Wi-Fi", "AUX"], "Water Resistant": ["Yes", "No", "IPX7"] },
  smartphone: { "Brand": ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo"], "RAM": ["4GB", "6GB", "8GB", "12GB", "16GB"], "Storage": ["64GB", "128GB", "256GB", "512GB", "1TB"], },
  laptop: { "Brand": ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "MSI"], "Processor": ["Intel Core i5", "Intel Core i7", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M1", "Apple M2"], "RAM": ["8GB", "16GB", "32GB", "64GB"], },
  smartwatch: { "Brand": ["Apple", "Samsung", "Fitbit", "Garmin", "Amazfit", "Noise", "Boat"], "Display Size": ["1.4-inch", "1.6-inch", "1.8-inch"], "Battery Life": ["Up to 2 days", "Up to 5 days", "Up to 10 days", "Up to 14 days"], "Compatibility": ["Android & iOS", "Android Only", "iOS Only"], "Strap Material": ["Silicone", "Leather", "Stainless Steel"], "Water Resistant": ["Yes", "No"], "Warranty": ["1 Year"] },
  watch: { "For / Gender": ["Men", "Women", "Unisex"], "Brand": ["Titan", "Casio", "Fossil", "Fastrack", "Timex", "Seiko", "Citizen", "Daniel Wellington"], "Display Type": ["Analog", "Digital", "Analog-Digital"], "Movement": ["Quartz", "Automatic", "Solar"], "Dial Shape": ["Round", "Square", "Rectangle", "Tonneau"], "Strap Material": ["Leather", "Stainless Steel", "Silicone", "Nylon", "Ceramic"], "Case Material": ["Stainless Steel", "Brass", "Titanium", "Plastic"], "Glass Material": ["Mineral Glass", "Sapphire Crystal", "Acrylic Glass"], "Water Resistance (meters)": ["30", "50", "100", "200", "Not Water Resistant"], "Clasp Type": ["Buckle", "Push-Button Clasp", "Deployment Clasp"], "Features": ["Date Display", "Chronograph", "Alarm", "Backlight", "Tachymeter"], "Country of Origin": ["Japan", "Switzerland", "India", "China"] },

  headphones_earbuds: { "Brand": ["Sony", "Apple", "Bose", "Sennheiser", "JBL", "Anker", "Samsung", "Audio-Technica"], "Product Type": ["Headphones", "Earbuds", "Neckband"], "Connectivity": ["Wired", "Wireless"], "Noise Cancellation": ["Active (ANC)", "Passive", "None"], "Microphone": ["Yes", "No"], "Use Case": ["Everyday", "Fitness & Sports", "Gaming", "Professional/Studio", "Travel"], "Compatibility": ["Android", "iOS", "Windows", "macOS", "Universal"], "Voice Assistant": ["Google Assistant", "Siri", "Alexa", "None"], "Color": ["Black", "White", "Blue", "Silver", "Red", "Grey"], "Features": ["Water Resistant", "Foldable Design", "Fast Charging", "Hi-Res Audio"] },
  headphones: { "Brand": ["Sony", "Bose", "Sennheiser", "Apple", "JBL", "Boat", "Audio-Technica"], "Type": ["In-Ear", "On-Ear", "Over-Ear"], "Connectivity": ["Bluetooth", "Wired", "True Wireless"], "Noise Cancellation": ["Active", "Passive", "None"], "Warranty": ["1 Year"] },

  earbuds: { "Brand": ["Apple", "Samsung", "Sony", "Jabra", "Anker (Soundcore)", "Sennheiser", "Bose", "Nothing", "JBL", "Boat"], "Type": ["True Wireless (TWS)", "Neckband"], "Noise Control": ["Active Noise Cancellation (ANC)", "Environmental Noise Cancellation (ENC)", "Passive Isolation"], "Bluetooth Version": ["5.0", "5.1", "5.2", "5.3"], "Playtime (per charge)": ["Up to 4 hours", "4-6 hours", "6-8 hours", "8+ hours"], "Total Playtime (with case)": ["Up to 15 hours", "15-24 hours", "24-36 hours", "36+ hours"], "Charging Case": ["Wired (USB-C)", "Wireless (Qi) Charging"], "Water Resistance": ["IPX4 (Sweatproof)", "IPX5", "IPX7 (Waterproof)", "Not Rated"], "Special Features": ["Fast Charging", "App Support", "Transparency Mode", "Multi-device Pairing", "Gaming Mode (Low Latency)"], "Driver Type": ["Dynamic", "Balanced Armature", "Dual Driver"], "Color": ["Black", "White", "Blue", "Green", "Pink", "Transparent"] },

  wireless_earphones: { "Brand": ["Sony", "JBL", "Apple (Beats)", "Anker (Soundcore)", "Bose", "Sennheiser", "OnePlus", "Realme"], "Form Factor": ["True Wireless", "Neckband"], "Bluetooth Version": ["5.0", "5.2", "5.3", "5.4"], "Noise Control": ["Active Noise Cancellation", "Adaptive ANC", "Transparency Mode", "None"], "Playtime (hours)": ["Under 8", "8-12", "12-20", "20+"], "Codec Support": ["SBC", "AAC", "aptX", "LDAC", "LHDC"], "Water Resistance": ["Sweatproof (IPX4)", "Waterproof (IPX7)", "None"], "Special Features": ["Multi-point Connection", "Fast Charging", "Voice Assistant", "App Customization"], "Microphone Technology": ["Single Mic", "Dual Mic with ENC", "Multi-Mic with ANC"], "Charging Port": ["USB-C", "Micro USB"], "Color": ["Black", "White", "Blue", "Red", "Yellow"] }
}





// Product Card Component with Reviews and Buttons
const ProductCard = ({ product, layout = 'grid' }) => {
  const { isLoggedIn, user,refreshCartCount, backend } = useContext(Context);
  const navigate = useNavigate(); // useNavigate को function की तरह call करें

  const handleAddToCart = async (product) => {
    if (isLoggedIn) {
      try {
        const res = await fetch(`${backend}/api/v1/userproduct/products/add-card`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: product._id }),
        });
        if (res.ok) {
          refreshCartCount();
        } else {
          const data = await res.json();
          toast.error(data.message || 'Failed to add product');
        }
      } catch (err) {
        console.error('Error adding to cart', err);
        toast.error('An error occurred. Please try again.');
      }
    } else {
      try {
        const currentCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        if (!currentCart.some(item => item._id === product._id)) {
          const updatedCart = [...currentCart, product];
          localStorage.setItem('cartItems', JSON.stringify(updatedCart));
          
        } else {
          toast.info('Product is already in the cart.');
        }
      } catch (error) {
        console.error("Error updating localStorage cart:", error);
        toast.error('Could not add product to cart.');
      }
    }
  };

  const handleBuyNow = async (id) => {
    navigate(`/product/${id}`);
  };


  const cardContent = (
    <div className="card product-card-enhanced h-100">
      {/* Image Container now has the Wishlist button */}
      <div className="product-image-container">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images[0]?.url || 'https://via.placeholder.com/300x300'}
            className="product-image"
            alt={product.name}
          />
        </Link>
        {/* Heart button - wishlist के लिए अलग function use करें */}
        <button className="wishlist-btn" onClick={()=>{handleAddToCart(product)}}>
          <FaHeart />
        </button>
      </div>

      {/* Card Body with Product Details */}
      <div className="card-body p-3 text-start d-flex flex-column">
        {product.isSponsored && <span className="sponsored-tag">Sponsored</span>}
        <div className="product-info">
          <h6 className="product-title">{product.name}</h6>
          <p className="product-subtitle">{product.specifications[0].value || 'General Product Type'}</p>
        </div>
        <div className="rating-badge my-1">
          {parseFloat(product.avgRating || '3.9').toFixed(1)} ★ ({product.reviews?.length?.toLocaleString('en-IN') || '1,234'})
        </div>
        <div className="price-container">
          <span className="current-price">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <>
              <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              <span className="discount-percentage">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
              </span>
            </>
          )}
        </div>
        
        {/* Actions container now only has the Buy Now button */}
        <div className="product-actions mt-auto pt-2">
          <button className="btn btn-buy-now" onClick={() => handleBuyNow(product._id)}>
            <FaBolt /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );

  if (layout === 'featured' || layout === 'grid') {
    return (
      <div className="col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3 mb-4 d-flex">
        {cardContent}
      </div>
    );
  }

  return null;
};

// Product List Component - Shows products in list layout
const ProductList = ({ products }) => {
  return (
    <div className="row products-list">
      {products.map(product => (
        <ProductCard key={product._id} product={product} layout="compact" />
      ))}
    </div>
  );
};

// Product Grid Component - Shows products in grid layout
const ProductGrid = ({ products }) => {
  return (
    <div className="row products-grid">
      {products.map(product => (
        <ProductCard key={product._id} product={product} layout="grid" />
      ))}
    </div>
  );
};

// Featured Products Component - Shows products in featured layout
const FeaturedProducts = ({ products }) => {
  return (
    <div className="row products-featured">
      {products.map(product => (
        <ProductCard key={product._id} product={product} layout="featured" />
      ))}
    </div>
  );
};


const CategoryNavbar = ({ categories, selectedCategory, onCategoryChange }) => {
  if (!categories || categories.length === 0) {
    return null;
  }
  return (
    <div className="category-navbar-container" style={{position: 'relative', zIndex: 100}}>
      <div className="category-navbar">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, onClose, availableFilters, selectedFilters, onFilterChange }) => {
  const handleCheckboxChange = (filterKey, value) => {
    const currentValues = selectedFilters[filterKey] || [];
    const newValues = currentValues.includes(value) ? currentValues.filter(v => v !== value) : [...currentValues, value];
    onFilterChange(filterKey, newValues);
  };

  return (
    <div className={`offcanvas offcanvas-start ${isOpen ? 'show' : ''} professional-sidebar`} tabIndex="-1" style={{zIndex: 1060}}>
      <div className="offcanvas-header">
        <div className="filter-header">
          <h5 className="offcanvas-title">🔍 Filters</h5>
          <span className="filter-count">
            {Object.keys(selectedFilters).filter(key => key !== 'maxPrice' && selectedFilters[key]?.length > 0).length} active
          </span>
        </div>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      <div className="offcanvas-body">
        {/* Price Filter Section */}
        <div className="filter-section">
          <h6 className="filter-section-title">💰 Price Range</h6>
          <div className="price-range-container">
            <label className="price-label">
              Up to: <span className="price-value">₹{selectedFilters.maxPrice !== undefined ? selectedFilters.maxPrice.toLocaleString('en-IN') : availableFilters.maxPrice.toLocaleString('en-IN')}</span>
            </label>
            <input 
              type="range" 
              className="form-range price-slider" 
              min={availableFilters.minPrice} 
              max={availableFilters.maxPrice} 
              value={selectedFilters.maxPrice !== undefined ? selectedFilters.maxPrice : availableFilters.maxPrice} 
              onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))} 
            />
            <div className="price-limits">
              <span>₹{availableFilters.minPrice.toLocaleString('en-IN')}</span>
              <span>₹{availableFilters.maxPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Other Filters */}
<div className="filter-section">
    <h6 className="filter-section-title">Refine By</h6>
    {Object.keys(availableFilters.specific).length > 0 ? (
        <Accordion defaultActiveKey={['0']} alwaysOpen>
            {Object.entries(availableFilters.specific).map(([key, options], index) => (
                Array.isArray(options) && options.length > 0 &&
                <Accordion.Item eventKey={String(index)} key={key}>
                    <Accordion.Header className="text-capitalize">
                        {key}
                        {selectedFilters[key]?.length > 0 && (
                            <span className="filter-badge">{selectedFilters[key].length}</span>
                        )}
                    </Accordion.Header>
                    <Accordion.Body>
                        {options.map(option => (
                            <div className="form-check mb-2" key={option}>
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
    ) : (
        <div className="no-filters-message">
            <p>No specific filters available for this category.</p>
        </div>
    )}

        </div>

        <button className="btn clear-filters-btn" onClick={() => { onFilterChange('clearAll', {}); }}>
          🗑️ Clear All Filters
        </button>
      </div>
    </div>
  );
};

// Loading Spinner Component
const FullPageSpinner = () => (
  <div className="full-page-spinner">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="loading-text">Loading amazing products...</p>
  </div>
);

// Main ProductListPage Component
function ProductListPage() {
  const { categoryPath: typePath } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); 
  const PRODUCTS_PER_PAGE = 18;
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const {backend} = useContext(Context);
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${backend}/api/v1/userproduct/productsName/${typePath}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Add mock reviews data for demonstration
        const productsWithReviews = (data.products || []).map(product => ({
          ...product,
          avgRating: product.avgRating || (Math.random() * 2 + 3), // Random rating between 3-5
          reviews: product.reviews || Array(Math.floor(Math.random() * 50)).fill({}) // Random review count
        }));
        
        setProducts(productsWithReviews);
        setCurrentPage(1);
        setSelectedFilters({});
        setSelectedCategory('');
      } catch (err) { 
        setError(err.message); 
      }
      finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [typePath]);

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'clearAll') {
      setSelectedFilters({});
      return;
    }
    setSelectedFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(prevCategory => (prevCategory === category ? '' : category));
    setSelectedFilters({});
    setCurrentPage(1);
  };

// FIXED: availableFilters calculation
const availableFilters = useMemo(() => {
    // Get the specific filters for the current category
    let specific = {};
    
    // Use selectedCategory if available, otherwise use typePath
    const filterKey = selectedCategory || typePath?.toLowerCase();
    
    if (filterKey) {
        // Direct match
        if (categorySpecificFilters[filterKey]) {
            specific = categorySpecificFilters[filterKey];
        } else {
            // Try to find matching key with different formats
            const normalizedKey = filterKey.replace(/[&_]/g, ' ').trim().toLowerCase();
            const matchingKey = Object.keys(categorySpecificFilters).find(key => 
                key.toLowerCase().replace(/[&_]/g, ' ').trim() === normalizedKey
            );
            
            if (matchingKey) {
                specific = categorySpecificFilters[matchingKey];
            }
        }
    }
    
    // Calculate price range
    let minPrice = 0, maxPrice = 100000;
    if (products.length > 0) {
        const prices = products.map(p => p.price).filter(price => price > 0);
        if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
        }
    }
    
    return {
        minPrice: Math.floor(minPrice),
        maxPrice: Math.ceil(maxPrice),
        specific: specific
    };
}, [products, selectedCategory, typePath]);

// FIXED: filteredProducts calculation
const filteredProducts = useMemo(() => {
    const categoryFiltered = selectedCategory ? 
        products.filter(p => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()) : 
        products;
    
    return categoryFiltered.filter(product => {
        // Price filter
        if (selectedFilters.maxPrice && product.price > selectedFilters.maxPrice) return false;
        
        // Specific filters
        for (const [filterKey, selectedValues] of Object.entries(selectedFilters)) {
            if (filterKey === 'maxPrice' || filterKey === 'clearAll') continue;
            
            if (selectedValues && selectedValues.length > 0) {
                // Check if product has the filter property
                const productValue = product[filterKey] || 
                                   product.specifications?.[filterKey] ||
                                   (Array.isArray(product.specifications) ? 
                                    product.specifications.find(spec => spec.key === filterKey)?.value : null);
                
                if (!productValue || !selectedValues.includes(productValue)) {
                    return false;
                }
            }
        }
        
        return true;
    });
}, [products, selectedFilters, selectedCategory]);



  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const availableCategories = categoryHierarchy[typePath?.toLowerCase()] || [];
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  // Split products into different display groups
  const firstSixProducts = currentProducts.slice(0, 6);
  const secondSixProducts = currentProducts.slice(6, 12);
  const remainingProducts = currentProducts.slice(12);

  if (error) return (
    <div className="error-container">
      <div className="error-content">
        <h4>🚨 Oops! Something went wrong</h4>
        <p className="error-message">{error}</p>
        <Link to="/" className="btn btn-primary">Go Back Home</Link>
      </div>
    </div>
  );

  return (
   <div className="page-content-wrapper" style={{minHeight: '100vh', position: 'relative'}}>
      {loading && <FullPageSpinner />}
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        availableFilters={availableFilters}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
      />

      {/* Main Navigation */}
      <nav className="main-navbar" style={{ top: 0}}>
        <div className="container">
          <button className="btn filter-toggle-btn" onClick={toggleSidebar}>
            <span className="filter-icon">☰</span>
            Filters
            {Object.keys(selectedFilters).filter(key => key !== 'maxPrice' && selectedFilters[key]?.length > 0).length > 0 && (
              <span className="active-filters-count">
                {Object.keys(selectedFilters).filter(key => key !== 'maxPrice' && selectedFilters[key]?.length > 0).length}
              </span>
            )}
          </button>
          
          <div className="navbar-brand-section">
            <h1 className="page-title text-capitalize">
              {typePath?.replace(/-/g, ' & ') || 'Products'}
            </h1>
            <span className="product-count">{filteredProducts.length} products</span>
          </div>

          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button 
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ⏹️
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              📋
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'featured' ? 'active' : ''}`}
              onClick={() => setViewMode('featured')}
              title="Featured View"
            >
              ⭐
            </button>
          </div>
          
          <Link to="/" className="btn home-btn">
            🏠 Home
          </Link>
        </div>
      </nav>

     <div className="container main-content" style={{minHeight: 'calc(100vh - 200px)', position: 'relative', zIndex: 1}}>
        {/* Category Navigation */}
        <CategoryNavbar
          categories={availableCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        {/* Results Header */}
        <div className="results-header">
          <h4 className="results-title">
            {selectedCategory ? 
              `Showing ${selectedCategory.replace(/_/g, ' ')} (${filteredProducts.length} found)` :
              `All Products (${filteredProducts.length} found)`
            }
          </h4>
          <div className="sort-options">
            <select className="form-select sort-select">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
              <option>Best Rating</option>
            </select>
          </div>
        </div>

        {/* Products Display - Different layouts for different sections */}
        {currentProducts.length > 0 ? (
          <>
            {/* First 6 Products - Featured Layout */}
            {firstSixProducts.length > 0 && (
              <div className="products-section">
                <h5 className="section-title">🔥 Top Picks</h5>
                <FeaturedProducts products={firstSixProducts} />
              </div>
            )}

            {/* Next 6 Products - Grid Layout */}
            {secondSixProducts.length > 0 && (
              <div className="products-section">
                <h5 className="section-title">💎 Popular Choices</h5>
                <ProductGrid products={secondSixProducts} />
              </div>
            )}

            {/* Remaining Products - Based on selected view mode */}
            {remainingProducts.length > 0 && (
              <div className="products-section">
                <h5 className="section-title">📦 More Products</h5>
                {viewMode === 'grid' && <ProductGrid products={remainingProducts} />}
                {viewMode === 'list' && <ProductList products={remainingProducts} />}
                {viewMode === 'featured' && <FeaturedProducts products={remainingProducts} />}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button 
                  className="btn pagination-btn" 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <div className="page-info">
                  Page <span className="current-page">{currentPage}</span> of {totalPages}
                </div>
                
                <button 
                  className="btn pagination-btn" 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="no-products-container">
              <div className="no-products-content">
                <h5>😔 No products found</h5>
                <p>Try adjusting your filters or browse different categories</p>
                <button 
                  className="btn clear-filters-main" 
                  onClick={() => { setSelectedFilters({}); setSelectedCategory(''); }}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default ProductListPage;