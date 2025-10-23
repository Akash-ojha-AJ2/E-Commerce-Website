import React, { useState,useContext } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingOverlay from '../spinner/LoadingOverlay';
import { Spinner } from 'react-bootstrap';
import SellerLayout from "./SellerLayout";
import { Context } from "../../store/Context";

const categorySpecs = {
  // Electronics
  smartphone: {
    "Brand": ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo"],
    "Model": [],
    "RAM": ["4GB", "6GB", "8GB", "12GB", "16GB"],
    "Storage": ["64GB", "128GB", "256GB", "512GB", "1TB"],
    "Battery (mAh)": [],
    "Camera (MP)": [],
    "Display Type": ["AMOLED", "OLED", "LCD", "Super Retina XDR"],
    "Processor": ["Snapdragon", "MediaTek", "A16 Bionic", "Tensor"],
    "OS": ["Android", "iOS"],
    "Warranty": ["1 Year", "2 Years"]
  },
  laptop: {
    "Brand": ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "MSI"],
    "Processor": ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Apple M1", "Apple M2"],
    "RAM": ["8GB", "16GB", "32GB", "64GB"],
    "Storage": ["256GB SSD", "512GB SSD", "1TB SSD", "1TB HDD", "2TB SSD"],
    "Graphics": ["Intel Iris Xe", "NVIDIA GeForce RTX 3050", "NVIDIA GeForce RTX 4060", "AMD Radeon"],
    "Display Size": ["13-inch", "14-inch", "15.6-inch", "16-inch", "17-inch"],
    "OS": ["Windows 11", "macOS", "Linux", "ChromeOS"],
    "Weight": [],
    "Warranty": ["1 Year", "2 Years", "3 Years"]
  },
  tablet: {
      "Brand": ["Apple", "Samsung", "Lenovo", "Realme", "Xiaomi"],
      "Model": [],
      "RAM": ["4GB", "6GB", "8GB"],
      "Storage": ["64GB", "128GB", "256GB"],
      "Display Size": ["8-inch", "10-inch", "11-inch", "12.9-inch"],
      "Battery (mAh)": [],
      "Processor": [],
      "Connectivity": ["Wi-Fi Only", "Wi-Fi + Cellular"],
      "OS": ["Android", "iPadOS"],
      "Warranty": ["1 Year"]
  },
  smartwatch: {
    "Brand": ["Apple", "Samsung", "Fitbit", "Garmin", "Amazfit", "Noise", "Boat"],
    "Model": [],
    "Display Size": ["1.4-inch", "1.6-inch", "1.8-inch"],
    "Battery Life": ["Up to 2 days", "Up to 5 days", "Up to 10 days", "Up to 14 days"],
    "Compatibility": ["Android & iOS", "Android Only", "iOS Only"],
    "Features": [],
    "Strap Material": ["Silicone", "Leather", "Stainless Steel"],
    "Water Resistant": ["Yes", "No"],
    "Warranty": ["1 Year"]
  },
  camera: {
    "Brand": ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic"],
    "Model": [],
    "Type": ["DSLR", "Mirrorless", "Point and Shoot", "Action Camera"],
    "Resolution (MP)": [],
    "Sensor Type": ["APS-C", "Full-Frame", "Micro Four Thirds"],
    "Lens": [],
    "Screen Size": ["3-inch", "3.2-inch"],
    "Video Resolution": ["1080p", "4K", "8K"],
    "Connectivity": ["Wi-Fi", "Bluetooth", "NFC"],
    "Warranty": ["1 Year", "2 Years"]
  },
  headphones: {
    "Brand": ["Sony", "Bose", "Sennheiser", "Apple", "JBL", "Boat", "Audio-Technica"],
    "Model": [],
    "Type": ["In-Ear", "On-Ear", "Over-Ear"],
    "Connectivity": ["Bluetooth", "Wired", "True Wireless"],
    "Battery Life": [],
    "Driver Size": [],
    "Noise Cancellation": ["Active", "Passive", "None"],
    "Color": [],
    "Warranty": ["1 Year"]
  },
      earbuds: {
        "Brand": ["Apple", "Samsung", "Sony", "Jabra", "Anker (Soundcore)", "Sennheiser", "Bose", "Nothing", "JBL", "Boat"],
        "Type": ["True Wireless (TWS)", "Neckband"],
        "Noise Control": ["Active Noise Cancellation (ANC)", "Environmental Noise Cancellation (ENC)", "Passive Isolation"],
        "Bluetooth Version": ["5.0", "5.1", "5.2", "5.3"],
        "Playtime (per charge)": ["Up to 4 hours", "4-6 hours", "6-8 hours", "8+ hours"],
        "Total Playtime (with case)": ["Up to 15 hours", "15-24 hours", "24-36 hours", "36+ hours"],
        "Charging Case": ["Wired (USB-C)", "Wireless (Qi) Charging"],
        "Water Resistance": ["IPX4 (Sweatproof)", "IPX5", "IPX7 (Waterproof)", "Not Rated"],
        "Special Features": ["Fast Charging", "App Support", "Transparency Mode", "Multi-device Pairing", "Gaming Mode (Low Latency)"],
        "Driver Type": ["Dynamic", "Balanced Armature", "Dual Driver"],
        "Color": ["Black", "White", "Blue", "Green", "Pink", "Transparent"],
        "Warranty": ["1 Year", "18 Months"]
    },
        wireless_earphones: {
        "Brand": ["Sony", "JBL", "Apple (Beats)", "Anker (Soundcore)", "Bose", "Sennheiser", "OnePlus", "Realme"],
        "Form Factor": ["True Wireless", "Neckband"],
        "Bluetooth Version": ["5.0", "5.2", "5.3", "5.4"],
        "Noise Control": ["Active Noise Cancellation", "Adaptive ANC", "Transparency Mode", "None"],
        "Playtime (hours)": ["Under 8", "8-12", "12-20", "20+"],
        "Codec Support": ["SBC", "AAC", "aptX", "LDAC", "LHDC"],
        "Water Resistance": ["Sweatproof (IPX4)", "Waterproof (IPX7)", "None"],
        "Special Features": ["Multi-point Connection", "Fast Charging", "Voice Assistant", "App Customization"],
        "Microphone Technology": ["Single Mic", "Dual Mic with ENC", "Multi-Mic with ANC"],
        "Charging Port": ["USB-C", "Micro USB"],
        "Color": ["Black", "White", "Blue", "Red", "Yellow"],
        "Warranty": ["1 Year", "2 Years"]
    },

  speaker: {
    "Brand": ["JBL", "Bose", "Sony", "Boat", "Marshall", "Ultimate Ears"],
    "Model": [],
    "Type": ["Portable", "Bookshelf", "Soundbar", "Smart Speaker"],
    "Power Output (W)": [],
    "Connectivity": ["Bluetooth", "Wi-Fi", "AUX"],
    "Battery Life": [],
    "Water Resistant": ["Yes", "No", "IPX7"],
    "Color": [],
    "Warranty": ["1 Year"]
  },
  television: {
    "Brand": ["Sony", "Samsung", "LG", "OnePlus", "Xiaomi", "TCL", "Vu"],
    "Model": [],
    "Screen Size": ["32-inch", "43-inch", "50-inch", "55-inch", "65-inch"],
    "Resolution": ["HD Ready (1366x768)", "Full HD (1920x1080)", "4K UHD (3840x2160)"],
    "Display Type": ["LED", "QLED", "OLED"],
    "Smart TV": ["Yes", "No"],
    "Ports": [],
    "Sound Output (W)": [],
    "Refresh Rate": ["60Hz", "120Hz"],
    "Warranty": ["1 Year", "2 Years"]
  },
  printer: {
    "Brand": ["HP", "Canon", "Epson", "Brother"],
    "Model": [],
    "Type": ["Inkjet", "Laser"],
    "Function": ["Print Only", "Print, Scan, Copy"],
    "Output": ["Monochrome", "Color"],
    "Connectivity": ["USB", "Wi-Fi", "Ethernet"],
    "Speed (ppm)": [],
    "Paper Size": ["A4", "A3", "Legal"],
    "Warranty": ["1 Year"]
  },
  monitor: {
    "Brand": ["LG", "Samsung", "Dell", "BenQ", "Acer", "HP"],
    "Model": [],
    "Screen Size": ["22-inch", "24-inch", "27-inch", "32-inch"],
    "Resolution": ["Full HD (1920x1080)", "QHD (2560x1440)", "4K UHD (3840x2160)"],
    "Panel Type": ["IPS", "VA", "TN"],
    "Refresh Rate": ["60Hz", "75Hz", "144Hz", "240Hz"],
    "Response Time": ["1ms", "4ms", "5ms"],
    "Ports": ["HDMI", "DisplayPort", "VGA"],
    "Aspect Ratio": ["16:9", "21:9"],
    "Warranty": ["3 Years"]
  },
  power_bank: {
    "Brand": ["Mi", "Realme", "Anker", "Ambrane"],
    "Model": [],
    "Capacity (mAh)": ["10000", "20000"],
    "Ports": ["USB-A", "USB-C", "Micro USB"],
    "Output Power (W)": [],
    "Charging Time": [],
    "Weight": [],
    "Color": [],
    "Warranty": ["6 Months", "1 Year"]
  },
  keyboard: {
    "Brand": ["Logitech", "HP", "Dell", "TVS", "Razer", "Corsair"],
    "Model": [],
    "Type": ["Membrane", "Mechanical"],
    "Connectivity": ["Wired", "Wireless"],
    "Backlit": ["Yes", "No", "RGB"],
    "Switch Type": ["Blue", "Red", "Brown"],
    "Layout": ["US", "UK"],
    "Color": [],
    "Warranty": ["1 Year", "3 Years"]
  },
  mouse: {
    "Brand": ["Logitech", "HP", "Dell", "Razer", "Corsair"],
    "Model": [],
    "Type": ["Optical", "Laser"],
    "Connectivity": ["Wired", "Wireless"],
    "DPI": [],
    "Buttons": [],
    "Sensor": [],
    "Color": [],
    "Warranty": ["1 Year", "3 Years"]
  },
  projector: {
    "Brand": ["Epson", "BenQ", "ViewSonic", "Optoma"],
    "Model": [],
    "Resolution": ["SVGA", "XGA", "Full HD", "4K"],
    "Brightness (Lumens)": [],
    "Projection Technology": ["LCD", "DLP"],
    "Lamp Life (hours)": [],
    "Connectivity": ["HDMI", "VGA", "USB"],
    "Contrast Ratio": [],
    "Warranty": ["2 Years"]
  },
  storage_device: {
    "Brand": ["SanDisk", "Samsung", "Seagate", "WD", "Crucial"],
    "Model": [],
    "Type": ["SSD", "HDD", "Pen Drive", "Memory Card"],
    "Capacity": [],
    "Interface": ["SATA", "NVMe", "USB 3.0", "USB-C"],
    "Read Speed": [],
    "Write Speed": [],
    "Form Factor": ["2.5-inch", "M.2"],
    "Warranty": ["3 Years", "5 Years"]
  },
  // Home & Kitchen Appliances
  refrigerator: {
    "Brand": ["LG", "Samsung", "Whirlpool", "Haier", "Godrej"],
    "Model": [],
    "Capacity (Liters)": [],
    "Type": ["Single Door", "Double Door", "Side-by-Side"],
    "Energy Rating": ["2 Star", "3 Star", "4 Star", "5 Star"],
    "Defrost Type": ["Direct Cool", "Frost Free"],
    "Color": [],
    "Compressor Type": ["Inverter", "Standard"],
    "Warranty": ["1 Year on Product, 10 Years on Compressor"]
  },
  washing_machine: {
    "Brand": ["LG", "Samsung", "IFB", "Bosch", "Whirlpool"],
    "Type": ["Top Load", "Front Load"],
    "Capacity (Kg)": ["6", "7", "8", "9"],
    "Function": ["Semi-Automatic", "Fully-Automatic"],
    "Energy Rating": ["4 Star", "5 Star"],
    "Wash Programs": [],
    "Spin Speed (RPM)": [],
    "Color": [],
    "Warranty": ["2 Years on Product, 10 Years on Motor"],
    "Noise Level": []
  },
  air_conditioner: {
    "Brand": ["LG", "Voltas", "Daikin", "Hitachi", "Blue Star"],
    "Model": [],
    "Capacity (Tons)": ["1", "1.5", "2"],
    "Type": ["Split AC", "Window AC"],
    "Energy Rating": ["3 Star", "4 Star", "5 Star"],
    "Inverter": ["Yes", "No"],
    "Cooling Capacity": [],
    "Color": ["White"],
    "Warranty": ["1 Year on Product, 10 Years on Compressor"]
  },
  microwave_oven: {
    "Brand": ["LG", "Samsung", "IFB", "Bajaj"],
    "Model": [],
    "Capacity (Liters)": ["20", "25", "30"],
    "Type": ["Solo", "Grill", "Convection"],
    "Power Consumption (W)": [],
    "Control Type": ["Tact Dial", "Touch Panel"],
    "Features": [],
    "Color": [],
    "Warranty": ["1 Year"]
  },
  water_purifier: {
    "Brand": ["Kent", "Aquaguard", "Pureit"],
    "Model": [],
    "Purification Technology": ["RO", "UV", "UF", "RO+UV"],
    "Storage Capacity (Liters)": [],
    "Stages": [],
    "Installation Type": ["Wall Mounted", "Table Top"],
    "Color": [],
    "Warranty": ["1 Year"]
  },
  vacuum_cleaner: {
    "Brand": ["Philips", "Eureka Forbes", "Dyson"],
    "Model": [],
    "Type": ["Canister", "Handheld", "Robotic"],
    "Suction Power": [],
    "Dust Capacity (Liters)": [],
    "Cord Length (m)": [],
    "Noise Level (dB)": [],
    "Color": [],
    "Warranty": ["1 Year"]
  },
  mixer_grinder: {
    "Brand": ["Preethi", "Bajaj", "Philips", "Sujata"],
    "Model": [],
    "Wattage": ["500W", "750W", "1000W"],
    "Jars": ["2", "3", "4"],
    "Speed Settings": [],
    "Blade Material": ["Stainless Steel"],
    "Body Material": ["ABS Plastic"],
    "Color": [],
    "Warranty": ["2 Years"]
  },
  toaster: {
    "Brand": [
      "Philips",
      "Bajaj",
      "Prestige",
      "Morphy Richards",
      "Kent"
    ],
    "Model": [],
    "Slices": [
      "2",
      "4"
    ],
    "Functions": [
      "Toasting",
      "Reheating",
      "Defrosting"
    ],
    "Power Consumption (W)": [],
    "Variable Browning Control": [
      "Yes",
      "No"
    ],
    "Body Material": [
      "Plastic",
      "Stainless Steel"
    ],
    "Color": [],
    "Warranty": [
      "1 Year",
      "2 Years"
    ]
  },
  coffee_maker: {
    "Brand": [
      "Philips",
      "Prestige",
      "Morphy Richards",
      "De'Longhi",
      "Cafe Coffee Day"
    ],
    "Model": [],
    "Type": [
      "Drip",
      "Espresso"
    ],
    "Capacity (Cups)": [],
    "Brewing Time": [],
    "Filter Type": [
      "Permanent Filter",
      "Paper Filter"
    ],
    "Body Material": [
      "Plastic",
      "Stainless Steel",
      "Glass Carafe"
    ],
    "Color": [],
    "Warranty": [
      "1 Year",
      "2 Years"
    ]
  },
  induction_cooktop: {
    "Brand": [
      "Philips",
      "Prestige",
      "Bajaj",
      "Havells",
      "Usha"
    ],
    "Model": [],
    "Control Type": [
      "Push Button",
      "Touch Panel",
      "Knob Control"
    ],
    "Wattage": [
      "1600W",
      "1800W",
      "2000W",
      "2100W"
    ],
    "Preset Menus": [],
    "Body Material": [
      "Ceramic Glass",
      "ABS Plastic"
    ],
    "Color": [],
    "Warranty": [
      "1 Year",
      "2 Years"
    ]
  },
  Fan: {
    "Brand": [
      "Usha",
      "Orient",
      "Havells",
      "Crompton",
      "Bajaj",
      "Atomberg"
    ],
    "Type": [
      "Ceiling Fan",
      "Table Fan",
      "Pedestal Fan",
      "Wall-Mounted Fan",
      "Exhaust Fan",
      "Tower Fan"
    ],
    "Motor Type": [
      "BLDC Motor",
      "Induction Motor"
    ],
    "Sweep Size (mm)": [
      "900",
      "1200",
      "1400"
    ],
    "Number of Blades": [
      "3",
      "4",
      "5"
    ],
    "Speed Settings": [
      "3",
      "4",
      "5"
    ],
    "Power Consumption (W)": [],
    "Remote Control": [
      "Yes",
      "No"
    ],
    "Body Material": [
      "Aluminium",
      "Plastic",
      "Steel"
    ],
    "Color": [],
    "Warranty": [
      "1 Year",
      "2 Years",
      "3 Years"
    ],
    "Noise Level (dB)": []
  },
  cooler: {
    "Brand": [
      "Symphony",
      "Bajaj",
      "Crompton",
      "Havells",
      "Kenstar",
      "Orient Electric"
    ],
    "Model": [],
    "Type": [
      "Personal Air Cooler",
      "Desert Air Cooler",
      "Tower Air Cooler",
      "Window Air Cooler"
    ],
    "Water Tank Capacity (Liters)": [],
    "Air Flow (CFM)": [],
    "Cooling Medium": [
      "Honeycomb Pads",
      "Aspen Wood Wool Pads"
    ],
    "Ice Chamber": [
      "Yes",
      "No"
    ],
    "Inverter Compatible": [
      "Yes",
      "No"
    ],
    "Speed Control": [
      "3 Speed",
      "4 Speed",
      "Variable Speed"
    ],
    "Remote Control": [
      "Yes",
      "No"
    ],
    "Auto Louver Movement": [
      "Yes",
      "No"
    ],
    "Water Level Indicator": [
      "Yes",
      "No"
    ],
    "Power Consumption (Watts)": [],
    "Body Material": [
      "ABS Plastic",
      "Polypropylene"
    ],
    "Castor Wheels": [
      "Yes",
      "No"
    ],
    "Dimensions (cm)": [],
    "Warranty": [
      "1 Year",
      "2 Years"
    ]
  },
  geyser: {
    "Brand": [
      "Bajaj",
      "AO Smith",
      "Havells",
      "Crompton",
      "Racold",
      "V-Guard"
    ],
    "Model": [],
    "Type": [
      "Storage Water Heater",
      "Instant Water Heater",
      "Gas Water Heater"
    ],
    "Capacity (Liters)": [
      "3",
      "6",
      "10",
      "15",
      "25"
    ],
    "Installation Type": [
      "Vertical",
      "Horizontal"
    ],
    "Wattage (Watts)": [],
    "Energy Rating": [
      "2 Star",
      "3 Star",
      "4 Star",
      "5 Star",
      "No Rating"
    ],
    "Rated Pressure (Bar)": [
      "6.5 Bar",
      "8 Bar"
    ],
    "Heating Element": [
      "Copper",
      "Incoloy 800",
      "Glass Coated Incoloy"
    ],
    "Tank Material": [
      "Stainless Steel",
      "Mild Steel with Glass Lining",
      "Vitreous Enamel Coated"
    ],
    "Anode Rod": [
      "Magnesium Anode Rod"
    ],
    "Body Material": [
      "ABS Plastic",
      "Metal"
    ],
    "Temperature Control": [
      "Adjustable Knob",
      "Fixed"
    ],
    "Safety Features": [],
    "Dimensions (cm)": [],
    "Warranty": []
  },
  // Fashion
  fashion: {
    "For / Gender": [
      "Men",
      "Women",
      "Boys",
      "Girls",
      "Unisex"
    ],
    "Product Type": [
      "T-Shirt",
      "Shirt",
      "Jeans",
      "Trousers",
      "Kurta",
      "Saree",
      "Dress",
      "Jacket"
    ],
    "Brand": [],
    "Size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "Free Size"
    ],
    "Color": [],
    "Fabric": [
      "Cotton",
      "Polyester",
      "Silk",
      "Denim",
      "Wool",
      "Linen",
      "Rayon",
      "Blended"
    ],
    "Fit": [
      "Regular Fit",
      "Slim Fit",
      "Skinny Fit",
      "Relaxed Fit",
      "Oversized Fit"
    ],
    "Pattern": [
      "Solid",
      "Printed",
      "Striped",
      "Checked",
      "Embroidered",
      "Floral"
    ],
    "Sleeve Style": [
      "Full Sleeve",
      "Half Sleeve",
      "Sleeveless",
      "3/4 Sleeve",
      "Roll-up Sleeve"
    ],
    "Neck Style": [
      "Round Neck",
      "V-Neck",
      "Polo Neck",
      "Henley Neck",
      "Hooded",
      "Collar"
    ],
    "Closure Type": [
      "Button",
      "Zipper",
      "Drawstring",
      "Pull-On"
    ],
    "Occasion": [
      "Casual",
      "Formal",
      "Party",
      "Ethnic",
      "Sportswear",
      "Festive"
    ],
    "Season": [
      "Summer",
      "Winter",
      "All Season"
    ],
    "Pack of": [
      "1",
      "2",
      "3",
      "5"
    ],
    "Care Instructions": [
      "Machine Wash",
      "Hand Wash",
      "Dry Clean Only"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Bangladesh",
      "Vietnam"
    ]
  },
  tshirt: {
    "For / Gender": [
      "Men",
      "Women",
      "Boys",
      "Girls",
      "Unisex"
    ],
    "Brand": [
      "Nike",
      "Adidas",
      "Puma",
      "Levi's",
      "Roadster",
      "H&M",
      "Bewakoof.com",
      "The Souled Store"
    ],
    "Size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "Color": [],
    "Fit": [
      "Regular Fit",
      "Slim Fit",
      "Oversized Fit",
      "Muscle Fit"
    ],
    "Fabric": [
      "100% Cotton",
      "Polyester",
      "Cotton Blend",
      "Linen Blend",
      "Pima Cotton",
      "Jersey"
    ],
    "Fabric GSM": [
      "160 GSM",
      "180 GSM",
      "200 GSM"
    ],
    "Sleeve Style": [
      "Half Sleeve",
      "Full Sleeve",
      "Sleeveless",
      "Raglan Sleeve"
    ],
    "Neck Style": [
      "Round Neck",
      "V-Neck",
      "Polo Neck",
      "Henley Neck"
    ],
    "Pattern": [
      "Solid",
      "Printed",
      "Striped",
      "Colorblock"
    ],
    "Print or Pattern Type": [
      "Graphic Print",
      "Typographic",
      "Abstract",
      "Character"
    ],
    "Occasion": [
      "Casual",
      "Sportswear",
      "Daily Wear",
      "Loungewear"
    ],
    "Season": [
      "Summer",
      "All Season"
    ],
    "Pack of": [
      "1",
      "2",
      "3",
      "5"
    ],
    "Care Instructions": [
      "Machine Wash",
      "Hand Wash",
      "Do Not Bleach",
      "Tumble Dry Low"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Bangladesh",
      "Vietnam"
    ]
  },
  shirt: {
    "For / Gender": [
      "Men",
      "Women",
      "Boys"
    ],
    "Brand": [
      "Van Heusen",
      "Allen Solly",
      "Peter England",
      "Louis Philippe",
      "Arrow",
      "Raymond"
    ],
    "Size": [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "38",
      "39",
      "40",
      "42",
      "44"
    ],
    "Color": [],
    "Fit": [
      "Regular Fit",
      "Slim Fit",
      "Tailored Fit",
      "Relaxed Fit"
    ],
    "Fabric": [
      "100% Cotton",
      "Linen",
      "Cotton Blend",
      "Denim",
      "Flannel",
      "Rayon",
      "Viscose"
    ],
    "Sleeve Style": [
      "Full Sleeve",
      "Half Sleeve",
      "Roll-up Sleeve"
    ],
    "Collar Style": [
      "Spread Collar",
      "Button-Down Collar",
      "Mandarin Collar",
      "Cutaway Collar"
    ],
    "Cuff Style": [
      "Single Cuff",
      "Double Cuff / French Cuff"
    ],
    "Pattern": [
      "Solid",
      "Checked",
      "Striped",
      "Printed",
      "Dobby"
    ],
    "Placket": [
      "Full Button Placket",
      "Half Button Placket"
    ],
    "Hemline": [
      "Curved Hemline",
      "Straight Hemline"
    ],
    "Number of Pockets": [
      "One",
      "Two",
      "None"
    ],
    "Occasion": [
      "Formal",
      "Casual",
      "Party",
      "Business Casual"
    ],
    "Pack of": [
      "1",
      "2"
    ],
    "Care Instructions": [
      "Machine Wash",
      "Hand Wash",
      "Dry Clean Recommended"
    ],
    "Country of Origin": [
      "India",
      "Bangladesh",
      "Vietnam"
    ]
  },
  jeans: {
    "For / Gender": [
      "Men",
      "Women"
    ],
    "Brand": [
      "Levi's",
      "Wrangler",
      "Pepe Jeans",
      "Lee",
      "Mufti",
      "Flying Machine",
      "Spykar"
    ],
    "Size (Waist in Inches)": [
      "28",
      "30",
      "32",
      "34",
      "36",
      "38",
      "40"
    ],
    "Color": [],
    "Fit": [
      "Skinny Fit",
      "Slim Fit",
      "Regular Fit",
      "Relaxed Fit",
      "Tapered Fit",
      "Bootcut"
    ],
    "Waist Rise": [
      "Low-Rise",
      "Mid-Rise",
      "High-Rise"
    ],
    "Fabric": [
      "Denim",
      "Stretch Denim",
      "Cotton Blend"
    ],
    "Stretch": [
      "Stretchable",
      "Non-Stretchable"
    ],
    "Shade / Wash": [
      "Light Fade",
      "Medium Fade",
      "Dark Wash",
      "Clean Look",
      "Stonewashed"
    ],
    "Distress": [
      "None",
      "Lightly Distressed",
      "Heavily Distressed"
    ],
    "Closure Type": [
      "Button and Zip"
    ],
    "Fly Type": [
      "Zip Fly",
      "Button Fly"
    ],
    "Number of Pockets": [
      "5"
    ],
    "Occasion": [
      "Casual",
      "Daily Wear"
    ],
    "Care Instructions": [
      "Machine Wash",
      "Hand Wash",
      "Wash Inside Out"
    ],
    "Country of Origin": [
      "India",
      "Bangladesh",
      "Vietnam"
    ]
  },
  kurta: {
    "For / Gender": [
      "Men",
      "Women"
    ],
    "Brand": [
      "Manyavar",
      "FabIndia",
      "Biba",
      "W for Woman",
      "Peter England",
      "Libas"
    ],
    "Size": [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL"
    ],
    "Color": [],
    "Fabric": [
      "Cotton",
      "Silk",
      "Linen",
      "Rayon",
      "Cotton Silk",
      "Brocade",
      "Jacquard"
    ],
    "Style / Set Type": [
      "Kurta Only",
      "Kurta with Pajama",
      "Kurta with Churidar",
      "Kurta with Dhoti Pants",
      "Pathani Suit"
    ],
    "Sleeve Style": [
      "Full Sleeve",
      "3/4 Sleeve",
      "Half Sleeve",
      "Roll-up Sleeve"
    ],
    "Length": [
      "Knee-Length",
      "Long",
      "Short",
      "Calf-Length"
    ],
    "Neck Style": [
      "Mandarin Collar",
      "Round Neck",
      "V-Neck",
      "Henley Neck",
      "Bandhgala"
    ],
    "Pattern": [
      "Solid",
      "Printed",
      "Embroidered",
      "Self-Design",
      "Woven Design",
      "Chikankari"
    ],
    "Hemline": [
      "Straight",
      "Asymmetric",
      "High-Low",
      "A-Line"
    ],
    "Slit Details": [
      "Side Slits",
      "Front Slit",
      "Multiple Slits"
    ],
    "Number of Pockets": [
      "One",
      "Two",
      "None"
    ],
    "Occasion": [
      "Ethnic",
      "Casual",
      "Festive",
      "Wedding"
    ],
    "Care Instructions": [
      "Hand Wash",
      "Dry Clean Only",
      "Machine Wash (Gentle)"
    ],
    "Country of Origin": [
      "India"
    ]
  },
  saree: {
    "Brand": [
      "Sabyasachi",
      "Manish Malhotra",
      "Kalamandir",
      "Nalli",
      "Satya Paul"
    ],
    "Type / Style": [
      "Banarasi",
      "Kanjeevaram",
      "Bandhani",
      "Leheriya",
      "Chanderi",
      "Paithani",
      "Ready to Wear Saree"
    ],
    "Fabric": [
      "Silk",
      "Cotton",
      "Georgette",
      "Chiffon",
      "Satin",
      "Crepe",
      "Net",
      "Velvet",
      "Banarasi Silk",
      "Kanjeevaram Silk",
      "Linen"
    ],
    "Color": [],
    "Work / Embellishment": [
      "Zari",
      "Sequins",
      "Beads",
      "Stone Work",
      "Gota Patti",
      "Thread Work"
    ],
    "Pattern / Print": [
      "Embroidered",
      "Printed",
      "Woven Design",
      "Solid",
      "Floral",
      "Embellished"
    ],
    "Border Type": [
      "Zari Border",
      "Contrasting Border",
      "No Border",
      "Temple Border"
    ],
    "Saree Length (m)": [
      "5.5 Meters",
      "6 Meters",
      "6.3 Meters"
    ],
    "Blouse Included": [
      "Yes",
      "No"
    ],
    "Blouse Fabric": [],
    "Blouse Piece Length (m)": [
      "0.8 Meters",
      "1 Meter"
    ],
    "Blouse Stitch Type": [
      "Unstitched",
      "Stitched"
    ],
    "Blouse Work": [
      "Embroidered",
      "Solid",
      "Printed",
      "Matching"
    ],
    "Transparency": [
      "Opaque",
      "Sheer",
      "Semi-Sheer"
    ],
    "Occasion": [
      "Wedding",
      "Party",
      "Formal",
      "Casual",
      "Festive",
      "Bridal"
    ],
    "Care Instructions": [
      "Dry Clean Only",
      "Hand Wash"
    ],
    "Country of Origin": [
      "India"
    ]
  },
  dress: {
    "For / Gender": [
      "Women",
      "Girls"
    ],
    "Brand": [],
    "Size": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "Color": [],
    "Fabric": [
      "Cotton",
      "Polyester",
      "Rayon",
      "Viscose",
      "Georgette",
      "Crepe",
      "Linen",
      "Denim"
    ],
    "Shape / Style": [
      "A-Line",
      "Sheath",
      "Shift",
      "Bodycon",
      "Fit and Flare",
      "Maxi",
      "Shirt Dress",
      "Wrap Dress"
    ],
    "Length": [
      "Mini",
      "Short",
      "Knee-Length",
      "Midi",
      "Maxi",
      "Ankle-Length"
    ],
    "Sleeve Style": [
      "Sleeveless",
      "Short Sleeve",
      "Half Sleeve",
      "3/4 Sleeve",
      "Full Sleeve",
      "Puff Sleeve",
      "Spaghetti Strap"
    ],
    "Neck Style": [
      "Round Neck",
      "V-Neck",
      "Square Neck",
      "Halter Neck",
      "Off-Shoulder",
      "Boat Neck"
    ],
    "Pattern": [
      "Solid",
      "Printed",
      "Floral",
      "Polka Dot",
      "Striped",
      "Checked",
      "Embroidered"
    ],
    "Occasion": [
      "Casual",
      "Party",
      "Formal",
      "Beach Wear",
      "Workwear"
    ],
    "Closure Type": [
      "Pull-On",
      "Zip",
      "Button"
    ],
    "Lining": [
      "Has Lining",
      "No Lining"
    ],
    "Transparency": [
      "Opaque",
      "Semi-Sheer"
    ],
    "Knit or Woven": [
      "Knit",
      "Woven"
    ],
    "Care Instructions": [
      "Machine Wash",
      "Hand Wash",
      "Dry Clean Only"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Vietnam"
    ]
  },
  shoes: {
    "For / Gender": [
      "Men",
      "Women",
      "Boys",
      "Girls",
      "Unisex"
    ],
    "Brand": [
      "Nike",
      "Adidas",
      "Puma",
      "Reebok",
      "Woodland",
      "Bata",
      "Clarks",
      "Skechers",
      "Red Tape"
    ],
    "Type": [
      "Sneakers",
      "Running Shoes",
      "Formal Shoes",
      "Boots",
      "Sandals",
      "Loafers",
      "Sports Shoes"
    ],
    "Size (UK/India)": [
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12"
    ],
    "Color": [],
    "Outer Material": [
      "Genuine Leather",
      "Synthetic Leather",
      "Canvas",
      "Mesh",
      "Suede",
      "Textile"
    ],
    "Sole Material": [
      "Rubber",
      "EVA (Ethylene Vinyl Acetate)",
      "PU (Polyurethane)",
      "TPR (Thermoplastic Rubber)"
    ],
    "Closure Type": [
      "Lace-Up",
      "Slip-On",
      "Velcro",
      "Zipper",
      "Buckle"
    ],
    "Occasion": [
      "Casual",
      "Formal",
      "Sports",
      "Party",
      "Ethnic"
    ],
    "Toe Shape": [
      "Round Toe",
      "Pointed Toe",
      "Square Toe"
    ],
    "Heel Type": [
      "Flat",
      "Block Heel",
      "Stiletto",
      "Wedge Heel"
    ],
    "Ankle Height": [
      "Regular",
      "Mid-Top",
      "High-Top"
    ],
    "Insole Material": [
      "Memory Foam",
      "Cushioned",
      "Padded"
    ],
    "Warranty": [
      "3 Months",
      "6 Months",
      "No Warranty"
    ],
    "Care Instructions": [
      "Wipe with a clean, dry cloth",
      "Use Shoe Polish",
      "Do not wash"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Vietnam"
    ]
  },
  sandals_floaters: {
    "For / Gender": [
      "Men",
      "Women",
      "Boys",
      "Girls",
      "Unisex"
    ],
    "Brand": [
      "Crocs",
      "Bata",
      "Paragon",
      "Sparx",
      "Hush Puppies",
      "Woodland",
      "Puma"
    ],
    "Type": [
      "Sandals",
      "Floaters",
      "Flip-Flops",
      "Sliders",
      "Clogs"
    ],
    "Size (UK/India)": [
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12"
    ],
    "Color": [],
    "Upper Material": [
      "Synthetic",
      "Genuine Leather",
      "Textile",
      "Rubber",
      "Mesh"
    ],
    "Sole Material": [
      "Rubber",
      "EVA (Ethylene Vinyl Acetate)",
      "PU (Polyurethane)",
      "TPR (Thermoplastic Rubber)"
    ],
    "Closure Type": [
      "Velcro",
      "Slip-On",
      "Buckle"
    ],
    "Occasion": [
      "Casual",
      "Ethnic",
      "Daily Wear",
      "Beach Wear"
    ],
    "Heel Type": [
      "Flat",
      "Platform",
      "Wedge"
    ],
    "Insole Material": [
      "Padded",
      "Cushioned",
      "Textured"
    ],
    "Arch Type": [
      "Flat",
      "Medium",
      "High"
    ],
    "Water Resistant": [
      "Yes",
      "No"
    ],
    "Warranty": [
      "3 Months",
      "6 Months",
      "No Warranty"
    ],
    "Care Instructions": [
      "Wipe with a clean, dry cloth",
      "Washable"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Vietnam"
    ]
  },
  jacket: {
    "For / Gender": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Brand": [
      "Puma",
      "Adidas",
      "Nike",
      "U.S. Polo Assn.",
      "Levi's",
      "Roadster",
      "Woodland"
    ],
    "Type / Style": [
      "Bomber Jacket",
      "Denim Jacket",
      "Leather Jacket",
      "Puffer Jacket",
      "Windcheater",
      "Hooded Jacket",
      "Blazer"
    ],
    "Size": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "Color": [],
    "Fabric": [
      "Polyester",
      "Denim",
      "Genuine Leather",
      "Faux Leather",
      "Cotton",
      "Nylon",
      "Fleece"
    ],
    "Fit": [
      "Regular Fit",
      "Slim Fit"
    ],
    "Sleeve Style": [
      "Full Sleeve",
      "Sleeveless"
    ],
    "Neck Style": [
      "Hooded",
      "High Neck",
      "Mock Collar",
      "Notch Lapel",
      "Spread Collar"
    ],
    "Closure Type": [
      "Zip",
      "Button"
    ],
    "Lining Material": [
      "Polyester",
      "Fleece",
      "Satin",
      "No Lining"
    ],
    "Number of Pockets": [
      "2",
      "3",
      "4",
      "None"
    ],
    "Water Resistant": [
      "Yes",
      "No"
    ],
    "Occasion": [
      "Casual",
      "Party",
      "Formal",
      "Sports",
      "Winter Wear"
    ],
    "Care Instructions": [
      "Machine Wash",
      "Dry Clean Only",
      "Hand Wash"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Vietnam",
      "Bangladesh"
    ]
  },
  sunglasses: {
    "For / Gender": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Brand": [
      "Ray-Ban",
      "Oakley",
      "Fastrack",
      "Lenskart",
      "Vogue",
      "Prada",
      "Gucci"
    ],
    "Frame Shape": [
      "Aviator",
      "Wayfarer",
      "Round",
      "Square",
      "Rectangle",
      "Cat-Eye",
      "Oval",
      "Clubmaster"
    ],
    "Frame Style": [
      "Full Rim",
      "Half Rim",
      "Rimless"
    ],
    "Frame Material": [
      "Metal",
      "Plastic",
      "Acetate",
      "Polycarbonate",
      "Titanium"
    ],
    "Frame Color": [],
    "Frame Size": [
      "Small",
      "Medium",
      "Large"
    ],
    "Lens Color": [],
    "Lens Material": [
      "Polycarbonate",
      "Glass",
      "Plastic",
      "CR-39"
    ],
    "Lens Technology": [
      "Polarized",
      "Mirrored",
      "Gradient",
      "Photochromic (Transitions)",
      "Standard"
    ],
    "UV Protection Level": [
      "100% UV Protection",
      "UV400"
    ],
    "Temple Material": [
      "Metal",
      "Plastic",
      "Acetate"
    ],
    "Nose Pad Type": [
      "Adjustable Nose Pads",
      "Fixed Nose Pads"
    ],
    "Ideal For": [
      "Driving",
      "Biking",
      "Beach",
      "General Use"
    ],
    "Case Type": [
      "Hard Case",
      "Soft Case / Pouch"
    ],
    "Warranty": [
      "6 Months",
      "1 Year",
      "2 Years"
    ],
    "Country of Origin": [
      "Italy",
      "USA",
      "China",
      "India"
    ]
  },
  watch: {
    "For / Gender": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Brand": [
      "Titan",
      "Casio",
      "Fossil",
      "Fastrack",
      "Timex",
      "Seiko",
      "Citizen",
      "Daniel Wellington"
    ],
    "Model Name/Number": [],
    "Display Type": [
      "Analog",
      "Digital",
      "Analog-Digital"
    ],
    "Movement": [
      "Quartz",
      "Automatic",
      "Solar"
    ],
    "Dial Shape": [
      "Round",
      "Square",
      "Rectangle",
      "Tonneau"
    ],
    "Dial Color": [],
    "Strap Material": [
      "Leather",
      "Stainless Steel",
      "Silicone",
      "Nylon",
      "Ceramic"
    ],
    "Strap Color": [],
    "Case Material": [
      "Stainless Steel",
      "Brass",
      "Titanium",
      "Plastic"
    ],
    "Case Diameter (mm)": [],
    "Glass Material": [
      "Mineral Glass",
      "Sapphire Crystal",
      "Acrylic Glass"
    ],
    "Water Resistance (meters)": [
      "30",
      "50",
      "100",
      "200",
      "Not Water Resistant"
    ],
    "Clasp Type": [
      "Buckle",
      "Push-Button Clasp",
      "Deployment Clasp"
    ],
    "Features": [
      "Date Display",
      "Chronograph",
      "Alarm",
      "Backlight",
      "Tachymeter"
    ],
    "Warranty": [
      "1 Year",
      "2 Years"
    ],
    "Country of Origin": [
      "Japan",
      "Switzerland",
      "India",
      "China"
    ]
  },
  bag: {
    "For / Gender": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Brand": [
      "American Tourister",
      "Skybags",
      "Wildcraft",
      "Puma",
      "Lavie",
      "Caprese"
    ],
    "Type": [
      "Backpack",
      "Laptop Backpack",
      "Handbag",
      "Sling Bag",
      "Tote Bag",
      "Duffle Bag",
      "Messenger Bag"
    ],
    "Material": [
      "Polyester",
      "Nylon",
      "Genuine Leather",
      "Faux Leather / PU",
      "Canvas"
    ],
    "Color": [],
    "Capacity (Liters)": [],
    "Number of Compartments": [
      "1",
      "2",
      "3",
      "4+"
    ],
    "Closure Type": [
      "Zip",
      "Buckle",
      "Drawstring",
      "Magnetic Snap"
    ],
    "Laptop Sleeve": [
      "Yes",
      "No"
    ],
    "Laptop Size Compatibility (inches)": [
      "Up to 14 inch",
      "Up to 15.6 inch",
      "Up to 17 inch"
    ],
    "Water Resistant": [
      "Yes",
      "No"
    ],
    "Strap Type": [
      "Adjustable Strap",
      "Detachable Strap",
      "Padded Strap"
    ],
    "Number of Pockets": [],
    "Occasion": [
      "Casual",
      "Formal",
      "Travel",
      "College",
      "School"
    ],
    "Dimensions (cm)": [],
    "Warranty": [
      "6 Months",
      "1 Year",
      "2 Years",
      "No Warranty"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Vietnam"
    ]
  },
  wallet: {
    "For / Gender": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Brand": [
      "Titan",
      "Tommy Hilfiger",
      "WildHorn",
      "Urban Forest",
      "Levi's",
      "Hidesign"
    ],
    "Type": [
      "Bi-Fold Wallet",
      "Tri-Fold Wallet",
      "Card Holder",
      "Long Wallet / Clutch",
      "Money Clip"
    ],
    "Material": [
      "Genuine Leather",
      "Faux Leather / PU",
      "Nylon",
      "Canvas"
    ],
    "Color": [],
    "Number of Main Compartments": [
      "1",
      "2",
      "3"
    ],
    "Number of Card Slots": [
      "1-3",
      "4-6",
      "7-9",
      "10+"
    ],
    "Coin Pocket": [
      "Yes",
      "No"
    ],
    "ID Card Holder": [
      "Yes",
      "No"
    ],
    "RFID Protection": [
      "Yes",
      "No"
    ],
    "Closure Type": [
      "No Closure",
      "Button",
      "Zip"
    ],
    "Pattern": [
      "Solid",
      "Textured",
      "Printed"
    ],
    "Occasion": [
      "Casual",
      "Formal"
    ],
    "Dimensions (cm)": [],
    "Warranty": [
      "3 Months",
      "6 Months",
      "1 Year",
      "No Warranty"
    ],
    "Country of Origin": [
      "India",
      "China"
    ]
  },
  // Beauty & Personal Care
  facewash: {
    "Brand": [
      "Himalaya",
      "Cetaphil",
      "Clean & Clear",
      "Neutrogena",
      "Mamaearth",
      "WOW Skin Science",
      "Pond's"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Skin Type": [
      "Oily",
      "Dry",
      "Normal",
      "Combination",
      "Sensitive",
      "Acne-Prone",
      "All Skin Types"
    ],
    "Skin Concern": [
      "Acne / Pimples",
      "Dullness",
      "Tan Removal",
      "Oil Control",
      "Dryness",
      "Dark Spots"
    ],
    "Applied For": [
      "Cleansing",
      "Brightening",
      "Exfoliating",
      "Hydrating"
    ],
    "Product Form": [
      "Gel",
      "Foam",
      "Cream",
      "Scrub",
      "Lotion"
    ],
    "Key Ingredients": [
      "Salicylic Acid",
      "Neem",
      "Tea Tree Oil",
      "Aloe Vera",
      "Vitamin C",
      "Hyaluronic Acid",
      "Glycerine"
    ],
    "Scent / Fragrance": [
      "Fragranced",
      "Fragrance-Free"
    ],
    "Paraben-Free": [
      "Yes",
      "No"
    ],
    "Sulfate-Free": [
      "Yes",
      "No"
    ],
    "Organic": [
      "Yes",
      "No"
    ],
    "Volume (ml)": [
      "50",
      "100",
      "150",
      "200"
    ],
    "Container Type": [
      "Tube",
      "Bottle with Pump",
      "Bottle with Flip-top"
    ],
    "Maximum Shelf Life (Months)": [
      "24",
      "36"
    ],
    "Country of Origin": [
      "India",
      "USA",
      "France",
      "South Korea"
    ]
  },
  buty_cream: {
    "Brand": [
      "Nivea",
      "Pond's",
      "Olay",
      "Lakme",
      "L'Oréal",
      "Mamaearth",
      "Plum"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Skin Type": [
      "Oily",
      "Dry",
      "Normal",
      "Combination",
      "Sensitive",
      "All Skin Types"
    ],
    "Skin Concern": [
      "Anti-Ageing",
      "Moisturizing & Nourishment",
      "Fairness / Brightening",
      "Acne / Pimples",
      "Dark Spots Removal",
      "Sun Protection"
    ],
    "Product Form": [
      "Cream",
      "Lotion",
      "Gel",
      "Serum"
    ],
    "Ideal Usage Time": [
      "Day",
      "Night",
      "Day & Night"
    ],
    "Application Area": [
      "Face",
      "Body",
      "Face & Neck"
    ],
    "SPF (Sun Protection Factor)": [
      "No SPF",
      "SPF 15",
      "SPF 25",
      "SPF 30",
      "SPF 50"
    ],
    "Key Ingredients": [
      "Hyaluronic Acid",
      "Retinol",
      "Vitamin C",
      "Niacinamide",
      "Glycerine",
      "Shea Butter",
      "Salicylic Acid"
    ],
    "Paraben-Free": [
      "Yes",
      "No"
    ],
    "Organic": [
      "Yes",
      "No"
    ],
    "Scent / Fragrance": [
      "Fragranced",
      "Fragrance-Free"
    ],
    "Volume (g/ml)": [],
    "Container Type": [
      "Jar",
      "Tube",
      "Bottle with Pump"
    ],
    "Maximum Shelf Life (Months)": [
      "24",
      "36"
    ],
    "Country of Origin": [
      "India",
      "USA",
      "France",
      "South Korea"
    ]
  },
  powder: {
    "Brand": [
      "Pond's",
      "Nycil",
      "Dermicool",
      "Lakme",
      "Maybelline",
      "Johnson's Baby"
    ],
    "Type": [
      "Talcum Powder",
      "Compact Powder",
      "Loose Powder",
      "Baby Powder",
      "Prickly Heat Powder"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Babies",
      "Unisex"
    ],
    "Skin Type": [
      "Oily",
      "Dry",
      "Normal",
      "Combination",
      "Sensitive",
      "All Skin Types"
    ],
    "Skin Concern": [
      "Oil Control",
      "Sweat Control",
      "Soothing",
      "Sun Protection",
      "Rash Prevention"
    ],
    "Product Form": [
      "Loose Powder",
      "Pressed Powder"
    ],
    "Finish": [
      "Matte",
      "Natural",
      "Radiant"
    ],
    "Shade": [],
    "SPF (Sun Protection Factor)": [
      "No SPF",
      "SPF 15",
      "SPF 25",
      "SPF 30"
    ],
    "Key Ingredients": [
      "Talc",
      "Menthol",
      "Sandalwood",
      "Zinc Oxide"
    ],
    "Scent / Fragrance": [],
    "Application Area": [
      "Face",
      "Body"
    ],
    "Quantity (g)": [],
    "Container Type": [
      "Bottle",
      "Compact Case with Mirror",
      "Jar"
    ],
    "Maximum Shelf Life (Months)": [
      "24",
      "36"
    ],
    "Country of Origin": [
      "India",
      "USA",
      "Thailand"
    ]
  },
  shampoo: {
    "Brand": [
      "Head & Shoulders",
      "Dove",
      "Pantene",
      "L'Oréal Paris",
      "Sunsilk",
      "Tresemmé",
      "Mamaearth",
      "WOW Skin Science"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Hair Type": [
      "All Hair Types",
      "Normal",
      "Dry",
      "Oily",
      "Damaged Hair",
      "Color Treated Hair"
    ],
    "Hair Concern": [
      "Dandruff",
      "Hair Fall",
      "Damage Repair",
      "Frizz Control",
      "Color Protection",
      "Dryness",
      "Split Ends"
    ],
    "Applied For": [
      "Anti-dandruff",
      "Anti-hair Fall",
      "Straightening & Smoothening",
      "Nourishment & Moisturization",
      "Damage Repair"
    ],
    "Product Form": [
      "Liquid",
      "Gel",
      "Cream"
    ],
    "Key Ingredients": [
      "Keratin",
      "Argan Oil",
      "Onion Oil",
      "Tea Tree Oil",
      "Aloe Vera",
      "Biotin",
      "Caffeine"
    ],
    "Sulfate-Free": [
      "Yes",
      "No"
    ],
    "Paraben-Free": [
      "Yes",
      "No"
    ],
    "Silicone-Free": [
      "Yes",
      "No"
    ],
    "Organic": [
      "Yes",
      "No"
    ],
    "Scent / Fragrance": [],
    "Quantity (ml)": [
      "100",
      "180",
      "340",
      "500",
      "1000"
    ],
    "Container Type": [
      "Bottle",
      "Bottle with Pump",
      "Sachet"
    ],
    "Maximum Shelf Life (Months)": [
      "24",
      "36"
    ],
    "Country of Origin": [
      "India",
      "USA",
      "France",
      "Thailand"
    ]
  },
  lipstick: {
    "Brand": [
      "Maybelline",
      "L'Oréal Paris",
      "MAC",
      "Lakme",
      "Sugar Cosmetics",
      "Huda Beauty",
      "Nykaa Cosmetics"
    ],
    "Ideal For": [
      "Women",
      "Girls"
    ],
    "Shade Name": [],
    "Color Family": [
      "Red",
      "Pink",
      "Nude",
      "Brown",
      "Maroon",
      "Purple",
      "Orange"
    ],
    "Finish": [
      "Matte",
      "Creamy Matte",
      "Glossy",
      "Satin",
      "Sheer",
      "Metallic"
    ],
    "Product Form": [
      "Liquid",
      "Bullet / Stick",
      "Crayon",
      "Lip Cream"
    ],
    "Coverage": [
      "Full",
      "Medium",
      "Sheer"
    ],
    "Benefits / Features": [
      "Long-lasting",
      "Waterproof",
      "Smudge-proof",
      "Hydrating",
      "Moisturizing"
    ],
    "Skin Tone Suitability": [
      "Fair",
      "Medium",
      "Dusky",
      "All Skin Tones"
    ],
    "Paraben-Free": [
      "Yes",
      "No"
    ],
    "Organic": [
      "Yes",
      "No"
    ],
    "Lasts Up To (hours)": [],
    "Quantity (g/ml)": [],
    "Container Type": [
      "Tube",
      "Wand with Applicator",
      "Crayon Stick"
    ],
    "Maximum Shelf Life (Months)": [
      "24",
      "36"
    ],
    "Country of Origin": [
      "India",
      "USA",
      "France",
      "Germany",
      "South Korea"
    ]
  },
  perfume: {
    "Brand": [
      "Dior",
      "Chanel",
      "Calvin Klein",
      "Giorgio Armani",
      "Davidoff",
      "Paco Rabanne",
      "Titan Skinn",
      "Fogg"
    ],
    "Fragrance Name": [],
    "Ideal For": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Type": [
      "Eau de Parfum (EDP)",
      "Eau de Toilette (EDT)",
      "Eau de Cologne (EDC)",
      "Parfum",
      "Deodorant",
      "Body Mist"
    ],
    "Quantity (ml)": [
      "30",
      "50",
      "100",
      "150",
      "200"
    ],
    "Fragrance Family": [
      "Fresh",
      "Floral",
      "Spicy",
      "Woody",
      "Oriental",
      "Fruity"
    ],
    "Top Notes": [],
    "Heart / Middle Notes": [],
    "Base Notes": [],
    "Scent Description": [],
    "Lasts Up To (hours)": [],
    "Container Type": [
      "Glass Bottle - Spray",
      "Roll-on",
      "Can"
    ],
    "Limited Edition": [
      "Yes",
      "No"
    ],
    "Country of Origin": [
      "France",
      "Italy",
      "USA",
      "India",
      "UAE"
    ],
    "Maximum Shelf Life (Months)": [
      "36",
      "48",
      "60"
    ]
  },
  trimmer_shaver: {
    "Brand": [
      "Philips",
      "Mi",
      "Havells",
      "Syska",
      "Braun",
      "Wahl",
      "Nova"
    ],
    "Model Name/Number": [],
    "Type": [
      "Trimmer",
      "Shaver",
      "Body Groomer",
      "Multi-grooming Kit"
    ],
    "Ideal For": [
      "Men",
      "Women"
    ],
    "Power Source": [
      "Rechargeable Battery",
      "Corded",
      "Corded & Cordless"
    ],
    "Blade Material": [
      "Stainless Steel",
      "Titanium Coated",
      "Ceramic"
    ],
    "Trimming Range (mm)": [],
    "Number of Length Settings": [],
    "Battery Run Time (min)": [],
    "Charging Time (hours)": [],
    "Quick Charge": [
      "Yes",
      "No"
    ],
    "Washable": [
      "Fully Washable",
      "Washable Head",
      "Not Washable"
    ],
    "Number of Attachments": [],
    "Charging Indicator": [
      "Yes",
      "No",
      "LED Indicator"
    ],
    "Body Material": [
      "Plastic",
      "Metal"
    ],
    "Warranty": [
      "1 Year",
      "2 Years",
      "3 Years"
    ],
    "Country of Origin": [
      "China",
      "Indonesia",
      "Germany",
      "India"
    ]
  },
  sunscreen: {
    "Brand": [
      "Neutrogena",
      "La Roche-Posay",
      "Biotique",
      "Lotus Herbals",
      "Mamaearth",
      "The Derma Co",
      "Minimalist"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Sunscreen Type": [
      "Physical (Mineral)",
      "Chemical",
      "Hybrid"
    ],
    "SPF (Sun Protection Factor)": [
      "SPF 15",
      "SPF 25",
      "SPF 30",
      "SPF 50",
      "SPF 50+"
    ],
    "PA Rating": [
      "PA+",
      "PA++",
      "PA+++",
      "PA++++"
    ],
    "Broad Spectrum Protection": [
      "Yes",
      "No"
    ],
    "Skin Type": [
      "Oily",
      "Dry",
      "Normal",
      "Combination",
      "Sensitive",
      "Acne-Prone",
      "All Skin Types"
    ],
    "Product Form": [
      "Lotion",
      "Cream",
      "Gel",
      "Spray",
      "Stick"
    ],
    "Application Area": [
      "Face",
      "Body",
      "Face & Body"
    ],
    "Finish": [
      "Matte",
      "Dewy",
      "Natural"
    ],
    "Key Ingredients": [
      "Zinc Oxide",
      "Titanium Dioxide",
      "Avobenzone",
      "Oxybenzone",
      "Niacinamide",
      "Hyaluronic Acid"
    ],
    "Water Resistance": [
      "Water Resistant",
      "Very Water Resistant",
      "Not Water Resistant"
    ],
    "Paraben-Free": [
      "Yes",
      "No"
    ],
    "Fragrance-Free": [
      "Yes",
      "No"
    ],
    "Quantity (g/ml)": [],
    "Country of Origin": [
      "India",
      "USA",
      "France",
      "South Korea"
    ]
  },
  moisturizer: {
    "Brand": [
      "Cetaphil",
      "Nivea",
      "Pond's",
      "Minimalist",
      "The Derma Co",
      "Plum",
      "Simple",
      "Neutrogena"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Skin Type": [
      "Oily",
      "Dry",
      "Normal",
      "Combination",
      "Sensitive",
      "Acne-Prone",
      "All Skin Types"
    ],
    "Skin Concern": [
      "Dryness",
      "Dullness",
      "Oiliness",
      "Acne / Pimples",
      "Anti-Ageing",
      "Redness"
    ],
    "Product Form": [
      "Cream",
      "Lotion",
      "Gel"
    ],
    "Application Area": [
      "Face",
      "Body",
      "Face & Body"
    ],
    "Ideal Usage Time": [
      "Day",
      "Night",
      "Day & Night"
    ],
    "SPF (Sun Protection Factor)": [
      "No SPF",
      "SPF 15",
      "SPF 25",
      "SPF 30"
    ],
    "Key Ingredients": [
      "Hyaluronic Acid",
      "Ceramides",
      "Glycerine",
      "Niacinamide",
      "Shea Butter",
      "Vitamin E"
    ],
    "Paraben-Free": [
      "Yes",
      "No"
    ],
    "Silicone-Free": [
      "Yes",
      "No"
    ],
    "Fragrance-Free": [
      "Yes",
      "No"
    ],
    "Quantity (g/ml)": [],
    "Container Type": [
      "Jar",
      "Tube",
      "Bottle with Pump"
    ],
    "Maximum Shelf Life (Months)": [
      "24",
      "36"
    ],
    "Country of Origin": [
      "India",
      "USA",
      "France",
      "South Korea"
    ]
  },
  // Sports & Fitness
  treadmill: {
    "Brand": [
      "PowerMax Fitness",
      "Welcare",
      "Fitkit",
      "Durafit",
      "Cockatoo",
      "NordicTrack"
    ],
    "Model Name/Number": [],
    "Type": [
      "Motorized",
      "Manual"
    ],
    "Motor Power (HP)": [
      "1.5 HP",
      "2.0 HP",
      "2.5 HP",
      "3.0 HP",
      "4.0 HP"
    ],
    "Max Speed (km/h)": [],
    "Max User Weight (kg)": [],
    "Running Surface (L x W in inches)": [],
    "Incline Type": [
      "Manual Incline",
      "Auto Incline",
      "No Incline"
    ],
    "Foldable": [
      "Yes",
      "No"
    ],
    "Display Features": [
      "Time, Speed, Distance, Calories, Heart Rate"
    ],
    "Number of Preset Programs": [],
    "Heart Rate Sensor": [
      "Yes",
      "No"
    ],
    "Cushioning / Shock Absorption": [
      "Yes",
      "No"
    ],
    "Speakers": [
      "Yes",
      "No"
    ],
    "Transportation Wheels": [
      "Yes",
      "No"
    ],
    "Item Weight (kg)": [],
    "Warranty": []
  },
  bicycle: {
    "Brand": [
      "Hero",
      "Hercules",
      "Btwin (Decathlon)",
      "Firefox",
      "Trek",
      "Giant",
      "Atlas"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Boys",
      "Girls",
      "Unisex"
    ],
    "Type": [
      "Mountain Bike (MTB)",
      "Road Bike",
      "Hybrid Bike",
      "City Bike / Commuter",
      "Fat Bike",
      "Electric Bike"
    ],
    "Gear System": [
      "Single Speed",
      "Multi-Speed (Geared)"
    ],
    "Number of Gears": [
      "1",
      "7",
      "18",
      "21",
      "24"
    ],
    "Frame Material": [
      "Steel",
      "Alloy",
      "Carbon Fiber"
    ],
    "Frame Size (inches)": [],
    "Recommended Rider Height": [],
    "Brake Type": [
      "Disc Brakes (Mechanical)",
      "Disc Brakes (Hydraulic)",
      "V-Brakes / Caliper Brakes"
    ],
    "Suspension": [
      "No Suspension / Rigid",
      "Front Suspension",
      "Full Suspension"
    ],
    "Tire Size (inches)": [
      "26 inch",
      "27.5 inch",
      "29 inch",
      "700c"
    ],
    "Wheel Type": [
      "Spoked Wheels",
      "Alloy Wheels"
    ],
    "Handlebar Type": [
      "Flat",
      "Riser",
      "Drop"
    ],
    "Included Components": [],
    "Item Weight (kg)": [],
    "Assembly Required": [
      "Self-Assembly (85% Assembled)",
      "Pre-Assembled"
    ],
    "Warranty": []
  },
  dumbbell: {
    "Brand": [
      "Protoner",
      "Kore",
      "Cockatoo",
      "Aurion",
      "Adrenex",
      "Durafit"
    ],
    "Type": [
      "Fixed Weight Dumbbell",
      "Adjustable Dumbbell",
      "Kettlebell"
    ],
    "Weight (per dumbbell in kg)": [],
    "Sales Package": [
      "Set of 2",
      "Single Piece"
    ],
    "Shape": [
      "Hexagonal (Hex)",
      "Round"
    ],
    "Material": [
      "Rubber Coated",
      "Cast Iron",
      "Vinyl Coated",
      "Chrome Plated",
      "PVC"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Usage/Application": [
      "Home Gym",
      "Professional Gym",
      "Strength Training",
      "Weightlifting"
    ],
    "Grip Type": [
      "Contoured",
      "Knurled",
      "Rubberized"
    ],
    "Handle Material": [
      "Steel",
      "Chrome",
      "Rubber"
    ],
    "Lock Type (for Adjustable)": [
      "Spin Lock",
      "Twist Lock"
    ],
    "Included Components (for Adjustable)": [],
    "Color": [],
    "Warranty": [
      "6 Months",
      "1 Year",
      "No Warranty"
    ],
    "Country of Origin": [
      "India",
      "China"
    ]
  },
  cricket_bat: {
    "Brand": [
      "SG",
      "SS (Sareen Sports)",
      "Kookaburra",
      "GM (Gunn & Moore)",
      "Gray-Nicolls",
      "Spartan"
    ],
    "Willow Type": [
      "English Willow",
      "Kashmir Willow"
    ],
    "Bat Size": [
      "Full Size (SH)",
      "Harrow",
      "6",
      "5",
      "4"
    ],
    "Ideal For": [
      "Leather Ball",
      "Tennis Ball",
      "Training"
    ],
    "Player Type": [
      "Beginner",
      "Intermediate",
      "Advanced",
      "Professional"
    ],
    "Bat Weight (g)": [],
    "Sweet Spot": [
      "Low",
      "Mid",
      "High"
    ],
    "Handle Type": [
      "Short Handle",
      "Long Handle"
    ],
    "Edge Thickness (mm)": [],
    "Grains": [],
    "Cover Included": [
      "Yes",
      "No"
    ],
    "Country of Origin": [
      "India",
      "England"
    ]
  },
  badminton_racket: {
    "Brand": [
      "Yonex",
      "Li-Ning",
      "Victor",
      "Apacs",
      "Carlton"
    ],
    "Model Name": [],
    "Player Type": [
      "Beginner",
      "Intermediate",
      "Advanced"
    ],
    "Playing Style": [
      "Attacking",
      "Defensive",
      "All-Round"
    ],
    "Weight (g)": [
      "75-79g (5U)",
      "80-84g (4U)",
      "85-89g (3U)"
    ],
    "Balance Point": [
      "Head-Heavy",
      "Head-Light",
      "Even-Balance"
    ],
    "Flex": [
      "Flexible",
      "Medium Flex",
      "Stiff",
      "Extra Stiff"
    ],
    "Shaft Material": [
      "Graphite",
      "Carbon Fiber",
      "Aluminium"
    ],
    "Frame Material": [
      "Graphite",
      "Carbon Fiber",
      "Aluminium"
    ],
    "Grip Size": [
      "G3",
      "G4",
      "G5"
    ],
    "Recommended String Tension (lbs)": [],
    "Strung": [
      "Yes",
      "No"
    ],
    "Cover Included": [
      "Full Cover",
      "Head Cover",
      "No Cover"
    ],
    "Country of Origin": [
      "Japan",
      "China",
      "Taiwan"
    ]
  },
  football: {
    "Brand": [
      "Nivia",
      "Cosco",
      "Adidas",
      "Nike",
      "Puma",
      "Vector X"
    ],
    "Model Name/Number": [],
    "Size": [
      "1",
      "2",
      "3",
      "4",
      "5"
    ],
    "Outer Material": [
      "PU (Polyurethane)",
      "PVC (Polyvinyl Chloride)",
      "TPU (Thermoplastic Polyurethane)"
    ],
    "Suitable For": [
      "Grass",
      "Astroturf",
      "Hard Ground",
      "Indoor"
    ],
    "Ideal For": [
      "Match",
      "Training",
      "Recreational Play"
    ],
    "Stitching Type": [
      "Hand Stitched",
      "Machine Stitched",
      "Thermally Bonded"
    ],
    "Bladder Type": [
      "Latex Bladder",
      "Butyl Bladder"
    ],
    "Number of Panels": [
      "32",
      "18",
      "12"
    ],
    "Water Resistance": [
      "Yes",
      "No"
    ],
    "Official Approvals": [
      "FIFA Approved",
      "None"
    ],
    "Country of Origin": [
      "India",
      "Pakistan",
      "China"
    ]
  },
  gym_essentials: {
    "Brand": [
      "Kore",
      "Boldfit",
      "Strauss",
      "Nivia",
      "Adidas",
      "Nike"
    ],
    "Product Type": [
      "Gym Gloves",
      "Resistance Band",
      "Skipping Rope",
      "Ab Roller",
      "Yoga Mat",
      "Push-up Bar",
      "Shaker Bottle"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Material": [
      "Rubber",
      "Latex",
      "Nylon",
      "Neoprene",
      "PVC",
      "Foam",
      "Leather"
    ],
    "Usage / Application": [
      "Strength Training",
      "Cardio",
      "Yoga & Pilates",
      "Crossfit",
      "Stretching"
    ],
    "Size": [
      "S",
      "M",
      "L",
      "XL",
      "Adjustable",
      "Standard"
    ],
    "Color": [],
    "Key Feature": [],
    "Sales Package / Contents": [],
    "Washable / Care Instructions": [
      "Yes",
      "No",
      "Hand Wash Only"
    ],
    "Warranty": [
      "3 Months",
      "6 Months",
      "No Warranty"
    ],
    "Country of Origin": [
      "India",
      "China"
    ]
  },
  // Furniture
  sofa: {
    "Brand": [
      "IKEA",
      "Godrej Interio",
      "Nilkamal",
      "Pepperfry",
      "Urban Ladder",
      "Royaloak"
    ],
    "Type / Style": [
      "Sectional Sofa",
      "Sofa Cum Bed",
      "Recliner",
      "Loveseat",
      "Chesterfield Sofa",
      "L-Shaped Sofa"
    ],
    "Seating Capacity": [
      "1 Seater",
      "2 Seater",
      "3 Seater",
      "4 Seater",
      "5 Seater",
      "6+ Seater"
    ],
    "Upholstery Material": [
      "Fabric",
      "Leatherette (Faux Leather)",
      "Genuine Leather",
      "Velvet"
    ],
    "Color": [],
    "Frame Material": [
      "Solid Wood",
      "Engineered Wood",
      "Metal"
    ],
    "Filling Material": [
      "Foam",
      "Fibre",
      "Springs",
      "Down Feather"
    ],
    "Leg Material": [
      "Solid Wood",
      "Metal",
      "Plastic"
    ],
    "Storage Included": [
      "Yes",
      "No"
    ],
    "Cushions Included": [
      "Yes",
      "No"
    ],
    "Assembly Required": [
      "Pre-assembled",
      "DIY (Do It Yourself)",
      "Carpenter Assembly"
    ],
    "Room Type": [
      "Living Room",
      "Bedroom",
      "Office"
    ],
    "Dimensions (W x H x D in cm)": [],
    "Weight (kg)": [],
    "Warranty": [],
    "Care Instructions": [
      "Wipe with a dry cloth",
      "Professional cleaning recommended"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Malaysia",
      "Vietnam"
    ]
  },
  bed: {
    "Brand": [
      "IKEA",
      "Godrej Interio",
      "Nilkamal",
      "Pepperfry",
      "Urban Ladder",
      "Wakefit"
    ],
    "Bed Size": [
      "Single",
      "Double",
      "Queen",
      "King"
    ],
    "Type": [
      "Standard Bed",
      "Bunk Bed",
      "Sofa Cum Bed",
      "Trundle Bed",
      "Four-Poster Bed"
    ],
    "Material": [
      "Solid Wood",
      "Engineered Wood",
      "Metal"
    ],
    "Storage Type": [
      "No Storage",
      "Box Storage",
      "Hydraulic Storage",
      "Drawer Storage"
    ],
    "Headboard Included": [
      "Yes",
      "No"
    ],
    "Headboard Material": [
      "Wood",
      "Upholstered",
      "Metal"
    ],
    "Finish Type": [
      "Matte",
      "Glossy",
      "Laminate",
      "Veneer"
    ],
    "Style": [
      "Modern",
      "Contemporary",
      "Traditional",
      "Minimalist"
    ],
    "Room Type": [
      "Bedroom",
      "Kids Room",
      "Guest Room"
    ],
    "Recommended Mattress Size (L x W in inches)": [],
    "Assembly Required": [
      "Pre-assembled",
      "DIY (Do It Yourself)",
      "Carpenter Assembly"
    ],
    "Maximum Load Capacity (kg)": [],
    "Dimensions (L x W x H in cm)": [],
    "Warranty": [],
    "Care Instructions": [
      "Wipe with a dry cloth",
      "Do not use harsh chemicals"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Malaysia",
      "Vietnam"
    ]
  },
  office_chair: {
    "Brand": [
      "IKEA",
      "Godrej Interio",
      "Nilkamal",
      "Pepperfry",
      "Urban Ladder",
      "Wakefit"
    ],
    "Bed Size": [
      "Single",
      "Double",
      "Queen",
      "King"
    ],
    "Type": [
      "Standard Bed",
      "Bunk Bed",
      "Sofa Cum Bed",
      "Trundle Bed",
      "Four-Poster Bed"
    ],
    "Material": [
      "Solid Wood",
      "Engineered Wood",
      "Metal"
    ],
    "Storage Type": [
      "No Storage",
      "Box Storage",
      "Hydraulic Storage",
      "Drawer Storage"
    ],
    "Headboard Included": [
      "Yes",
      "No"
    ],
    "Headboard Material": [
      "Wood",
      "Upholstered",
      "Metal"
    ],
    "Finish Type": [
      "Matte",
      "Glossy",
      "Laminate",
      "Veneer"
    ],
    "Style": [
      "Modern",
      "Contemporary",
      "Traditional",
      "Minimalist"
    ],
    "Room Type": [
      "Bedroom",
      "Kids Room",
      "Guest Room"
    ],
    "Recommended Mattress Size (L x W in inches)": [],
    "Assembly Required": [
      "Pre-assembled",
      "DIY (Do It Yourself)",
      "Carpenter Assembly"
    ],
    "Maximum Load Capacity (kg)": [],
    "Dimensions (L x W x H in cm)": [],
    "Warranty": [],
    "Care Instructions": [
      "Wipe with a dry cloth",
      "Do not use harsh chemicals"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Malaysia",
      "Vietnam"
    ]
  },
  dining_table: {
    "Brand": [
      "IKEA",
      "Godrej Interio",
      "Nilkamal",
      "Pepperfry",
      "Urban Ladder",
      "Royaloak"
    ],
    "Set Content": [
      "1 Table with 4 Chairs",
      "1 Table with 6 Chairs",
      "1 Table with 8 Chairs",
      "Table Only",
      "Chairs Only"
    ],
    "Seating Capacity": [
      "2 Seater",
      "4 Seater",
      "6 Seater",
      "8 Seater"
    ],
    "Shape": [
      "Rectangle",
      "Round",
      "Square"
    ],
    "Table Top Material": [
      "Solid Wood",
      "Engineered Wood",
      "Glass",
      "Marble",
      "Metal"
    ],
    "Table Frame Material": [
      "Solid Wood",
      "Engineered Wood",
      "Metal"
    ],
    "Chair Material": [
      "Solid Wood",
      "Engineered Wood",
      "Metal"
    ],
    "Chair Upholstery Material": [
      "Fabric",
      "Leatherette",
      "No Upholstery"
    ],
    "Finish Type": [
      "Matte",
      "Glossy",
      "Laminate",
      "Veneer"
    ],
    "Style": [
      "Modern",
      "Contemporary",
      "Traditional",
      "Industrial"
    ],
    "Assembly Required": [
      "Pre-assembled",
      "DIY (Do It Yourself)",
      "Carpenter Assembly"
    ],
    "Table Dimensions (L x W x H in cm)": [],
    "Chair Dimensions (L x W x H in cm)": [],
    "Warranty": [],
    "Care Instructions": [
      "Wipe with a clean, dry cloth",
      "Avoid direct sunlight"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Malaysia",
      "Vietnam"
    ]
  },
  wardrobe: {
    "Brand": [
      "IKEA",
      "Godrej Interio",
      "Nilkamal",
      "Pepperfry",
      "Urban Ladder",
      "Wakefit"
    ],
    "Number of Doors": [
      "1 Door",
      "2 Door",
      "3 Door",
      "4 Door",
      "5 Door"
    ],
    "Door Type": [
      "Hinged",
      "Sliding"
    ],
    "Material": [
      "Engineered Wood",
      "Solid Wood",
      "Metal",
      "Plastic"
    ],
    "Finish Type": [
      "Matte",
      "Glossy",
      "Laminate",
      "Veneer"
    ],
    "Mirror Included": [
      "Yes",
      "No"
    ],
    "Locker Included": [
      "Yes",
      "No"
    ],
    "Number of Drawers": [
      "1",
      "2",
      "3",
      "4",
      "None"
    ],
    "Number of Shelves": [],
    "Style": [
      "Modern",
      "Contemporary",
      "Traditional"
    ],
    "Room Type": [
      "Bedroom",
      "Kids Room"
    ],
    "Assembly Required": [
      "Pre-assembled",
      "DIY (Do It Yourself)",
      "Carpenter Assembly"
    ],
    "Dimensions (H x W x D in cm)": [],
    "Weight (kg)": [],
    "Warranty": [],
    "Care Instructions": [
      "Wipe with a clean, dry cloth"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Malaysia"
    ]
  },
  bookshelf: {
    "Brand": [
      "IKEA",
      "Godrej Interio",
      "Nilkamal",
      "Pepperfry",
      "Urban Ladder",
      "Wakefit"
    ],
    "Type / Design": [
      "Standard",
      "Ladder",
      "Corner",
      "Wall-Mounted",
      "Cube"
    ],
    "Material": [
      "Engineered Wood",
      "Solid Wood",
      "Metal",
      "Plastic"
    ],
    "Number of Shelves": [
      "2",
      "3",
      "4",
      "5",
      "6+"
    ],
    "Adjustable Shelves": [
      "Yes",
      "No"
    ],
    "Back Panel": [
      "Open Back",
      "Closed Back"
    ],
    "Doors Included": [
      "Yes",
      "No"
    ],
    "Drawers Included": [
      "Yes",
      "No"
    ],
    "Finish Type": [
      "Matte",
      "Glossy",
      "Laminate",
      "Veneer"
    ],
    "Style": [
      "Modern",
      "Contemporary",
      "Traditional",
      "Industrial",
      "Minimalist"
    ],
    "Room Type": [
      "Living Room",
      "Study Room",
      "Office",
      "Bedroom"
    ],
    "Assembly Required": [
      "Pre-assembled",
      "DIY (Do It Yourself)",
      "Carpenter Assembly"
    ],
    "Dimensions (H x W x D in cm)": [],
    "Shelf Load Capacity (kg)": [],
    "Warranty": [],
    "Care Instructions": [
      "Wipe with a clean, dry cloth"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Malaysia"
    ]
  },
  // Books & Stationery
  books: {
    "Title": [],
    "Author": [],
    "Publisher": [],
    "Genre": [
      "Fiction",
      "Non-Fiction",
      "Sci-Fi",
      "Fantasy",
      "Biography",
      "Self-Help",
      "Mystery",
      "Thriller",
      "Romance",
      "Business & Economics"
    ],
    "Language": [
      "English",
      "Hindi",
      "Marathi",
      "Bengali",
      "Tamil"
    ],
    "Binding": [
      "Paperback",
      "Hardcover",
      "Kindle Edition",
      "Audiobook"
    ],
    "Number of Pages": [],
    "ISBN-13": [],
    "Publication Date": [],
    "Edition": [],
    "Country of Origin": [
      "India",
      "USA",
      "UK"
    ]
  },
  stationery: {
    "Brand": [
      "Classmate",
      "Faber-Castell",
      "Camlin",
      "Parker",
      "Cello",
      "Pilot",
      "Navneet"
    ],
    "Product Type": [
      "Pen",
      "Pencil",
      "Notebook",
      "Diary",
      "Stapler",
      "Glue Stick",
      "Highlighter",
      "Art Set"
    ],
    "Ideal For": [
      "Students",
      "Office Use",
      "Artists",
      "General Use"
    ],
    "Sales Package / Contents": [],
    "Material": [
      "Plastic",
      "Metal",
      "Wood",
      "Paper"
    ],
    "Color / Ink Color": [
      "Blue",
      "Black",
      "Red",
      "Green",
      "Multi-color"
    ],
    "Key Feature 1": [],
    "Key Feature 2": [],
    "Pack of": [
      "1",
      "5",
      "10",
      "50"
    ],
    "Dimensions / Size": [],
    "Country of Origin": [
      "India",
      "Japan",
      "Germany",
      "China"
    ]
  },
  pen: {
    "Brand": [
      "Parker",
      "Cello",
      "Reynolds",
      "Pilot",
      "Luxor",
      "Pentel",
      "Uniball"
    ],
    "Type": [
      "Ballpoint Pen",
      "Gel Pen",
      "Fountain Pen",
      "Rollerball Pen",
      "Fine liner"
    ],
    "Ink Color": [
      "Blue",
      "Black",
      "Red",
      "Green"
    ],
    "Point Size (mm)": [
      "0.5mm (Fine)",
      "0.7mm (Medium)",
      "1.0mm (Bold)"
    ],
    "Mechanism": [
      "Retractable (Click)",
      "Capped"
    ],
    "Body Material": [
      "Plastic",
      "Metal",
      "Resin"
    ],
    "Grip Type": [
      "Rubberized Grip",
      "Contoured Grip",
      "Textured Grip",
      "No Grip"
    ],
    "Ink Features": [
      "Waterproof Ink",
      "Quick-Drying Ink",
      "Erasable Ink"
    ],
    "Refillable": [
      "Yes",
      "No"
    ],
    "Sales Package": [
      "Pack of 1",
      "Pack of 5",
      "Pack of 10",
      "Box of 50"
    ],
    "Ideal For": [
      "Writing",
      "Calligraphy",
      "Drawing",
      "Signing"
    ],
    "Country of Origin": [
      "India",
      "Japan",
      "Germany",
      "France"
    ]
  },
  notebook: {
    "Brand": [
      "Classmate",
      "Navneet",
      "Sundaram",
      "Camlin",
      "Muji"
    ],
    "Size": [
      "A4",
      "A5",
      "B5",
      "Pocket Size"
    ],
    "Number of Pages": [
      "100",
      "150",
      "180",
      "200",
      "300"
    ],
    "Paper Quality (GSM)": [
      "60 GSM",
      "70 GSM",
      "80 GSM",
      "90 GSM"
    ],
    "Ruling": [
      "Ruled / Lined",
      "Unruled / Plain",
      "Grid / Graph",
      "Dotted"
    ],
    "Binding": [
      "Spiral Bound",
      "Perfect Bound (Paperback)",
      "Stapled / Saddle Stitched",
      "Hard Bound"
    ],
    "Cover Type": [
      "Softcover",
      "Hardcover"
    ],
    "Cover Material": [
      "Paperboard",
      "Cardboard",
      "Plastic (Polypropylene)"
    ],
    "Ideal For": [
      "Students",
      "Office Use",
      "Journaling",
      "Artists"
    ],
    "Sales Package": [
      "Single Notebook",
      "Pack of 3",
      "Pack of 6"
    ],
    "Country of Origin": [
      "India",
      "Japan",
      "China"
    ]
  },
  // Toys & Baby
  Toys: {
    "Brand": [
      "LEGO",
      "Hot Wheels",
      "Barbie",
      "Funskool",
      "Hasbro",
      "Mattel",
      "Nerf"
    ],
    "Type": [
      "Action Figure",
      "Doll",
      "Board Game",
      "Puzzle",
      "Remote Control Toy",
      "Building Blocks",
      "Educational Toy",
      "Soft Toy"
    ],
    "Character": [],
    "Ideal For": [
      "Boys",
      "Girls",
      "Unisex"
    ],
    "Recommended Age": [
      "0-2 Years",
      "3-5 Years",
      "6-8 Years",
      "9-12 Years",
      "12+ Years"
    ],
    "Material": [
      "Plastic",
      "Wood",
      "Metal",
      "Plush / Fabric",
      "Cardboard"
    ],
    "Assembly Required": [
      "Yes",
      "No"
    ],
    "Battery Required": [
      "Yes",
      "No"
    ],
    "Number of Batteries": [],
    "Battery Type": [
      "AA",
      "AAA",
      "Rechargeable"
    ],
    "Rechargeable": [
      "Yes",
      "No"
    ],
    "Skills Developed": [],
    "Number of Players (for games)": [
      "1",
      "2",
      "3",
      "4",
      "4+"
    ],
    "Sales Package / Contents": [],
    "Dimensions (L x W x H in cm)": [],
    "Safety Standards": [],
    "Country of Origin": [
      "India",
      "China",
      "USA",
      "Denmark"
    ]
  },
  soft_toy: {
    "Brand": [
      "Hamleys",
      "Miniso",
      "Disney",
      "Ty",
      "Funskool"
    ],
    "Type": [
      "Teddy Bear",
      "Dog",
      "Cat",
      "Rabbit",
      "Dinosaur",
      "Unicorn"
    ],
    "Character": [],
    "Ideal For": [
      "Boys",
      "Girls",
      "Unisex"
    ],
    "Recommended Age": [
      "0-6 Months",
      "6-12 Months",
      "1-2 Years",
      "3+ Years"
    ],
    "Outer Material": [
      "Plush",
      "Velvet",
      "Felt",
      "Faux Fur"
    ],
    "Filling Material": [
      "Polyester Fiber",
      "Cotton",
      "Foam"
    ],
    "Size / Height (cm)": [],
    "Color": [],
    "Washable / Care Instructions": [
      "Machine Washable",
      "Hand Wash Only",
      "Surface Clean Only"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Vietnam"
    ]
  },
  diapers: {
    "Brand": [
      "Pampers",
      "Huggies",
      "MamyPoko",
      "Little's",
      "Himalaya Baby"
    ],
    "Type": [
      "Diaper Pants",
      "Taped Diapers"
    ],
    "Size": [
      "Newborn (NB)",
      "Small (S)",
      "Medium (M)",
      "Large (L)",
      "Extra Large (XL)",
      "XXL"
    ],
    "Pack Size (Number of Diapers)": [],
    "Recommended Baby Weight (kg)": [],
    "Absorption Capacity": [
      "Up to 12 hours"
    ],
    "Key Features": [],
    "Material": [
      "Cotton",
      "Non-woven Fabric"
    ],
    "Fragrance": [
      "Yes",
      "No"
    ],
    "Maximum Shelf Life (Months)": [
      "36"
    ],
    "Country of Origin": [
      "India",
      "Japan",
      "USA"
    ]
  },
  stroller_pram: {
    "Brand": [
      "LuvLap",
      "R for Rabbit",
      "Chicco",
      "Graco",
      "Mee Mee",
      "Babyhug"
    ],
    "Type": [
      "Stroller",
      "Pram",
      "Buggy",
      "Travel System"
    ],
    "Recommended Age": [
      "0-6 Months",
      "0-12 Months",
      "6 Months to 3 Years",
      "0-3 Years"
    ],
    "Weight Capacity (kg)": [],
    "Safety Harness": [
      "3-Point",
      "5-Point"
    ],
    "Foldable Mechanism": [
      "One-Hand Fold",
      "Umbrella Fold",
      "Compact Fold"
    ],
    "Number of Reclining Positions": [
      "1",
      "2",
      "3",
      "Multiple",
      "Flat Recline"
    ],
    "Reversible Handle": [
      "Yes",
      "No"
    ],
    "Canopy": [
      "Full Canopy",
      "Half Canopy",
      "Extendable Canopy"
    ],
    "Storage Basket": [
      "Yes",
      "No"
    ],
    "Wheel Type": [
      "Swivel Wheels",
      "Fixed Wheels",
      "Swivel & Lockable Wheels"
    ],
    "Wheel Suspension": [
      "Yes",
      "No"
    ],
    "Brake Type": [
      "Rear Wheel Brakes",
      "One-Step Link Brake"
    ],
    "Frame Material": [
      "Aluminium",
      "Steel"
    ],
    "Item Weight (kg)": [],
    "Country of Origin": [
      "India",
      "China"
    ]
  },
  baby_care: {
    "Brand": [
      "Johnson's",
      "Himalaya Baby",
      "Sebamed",
      "Mamaearth",
      "Cetaphil Baby",
      "Chicco"
    ],
    "Product Type": [
      "Baby Lotion",
      "Baby Oil",
      "Baby Shampoo",
      "Baby Soap",
      "Baby Powder",
      "Diaper Rash Cream",
      "Baby Wipes"
    ],
    "Recommended Age": [
      "Newborn (0+ months)",
      "3+ Months",
      "6+ Months"
    ],
    "Ideal For": [
      "Babies",
      "Kids"
    ],
    "Skin Type": [
      "Normal Skin",
      "Sensitive Skin",
      "Dry Skin"
    ],
    "Skin Concern": [
      "Dryness",
      "Rash",
      "Gentle Cleansing"
    ],
    "Product Form": [
      "Cream",
      "Lotion",
      "Oil",
      "Liquid",
      "Powder",
      "Bar",
      "Wipe"
    ],
    "Key Ingredients": [
      "Aloe Vera",
      "Vitamin E",
      "Olive Oil",
      "Shea Butter",
      "Almond Oil"
    ],
    "Paraben-Free": [
      "Yes",
      "No"
    ],
    "Sulfate-Free": [
      "Yes",
      "No"
    ],
    "Hypoallergenic": [
      "Yes",
      "No"
    ],
    "Dermatologically Tested": [
      "Yes",
      "No"
    ],
    "Scent / Fragrance": [
      "Fragranced",
      "Fragrance-Free"
    ],
    "Quantity (g/ml) / Count": [],
    "Container Type": [
      "Bottle",
      "Tube",
      "Jar",
      "Wipes Pack"
    ],
    "Maximum Shelf Life (Months)": [
      "24",
      "36"
    ],
    "Country of Origin": [
      "India",
      "USA",
      "Germany"
    ]
  },
  // More
  car_accessories: {
    "Brand": [
      "3M",
      "JBL",
      "Sony",
      "Pioneer",
      "Godrej",
      "Auto-Ex",
      "Bosch"
    ],
    "Product Type": [
      "Car Cover",
      "Seat Cover",
      "Floor Mat",
      "Steering Wheel Cover",
      "Car Stereo",
      "Car Speaker",
      "Air Freshener",
      "Mobile Holder",
      "Vacuum Cleaner",
      "Tyre Inflator"
    ],
    "Vehicle Compatibility / Model": [],
    "Material": [
      "Leatherette",
      "Fabric",
      "PVC",
      "Rubber",
      "Plastic",
      "Metal"
    ],
    "Color": [],
    "Position": [
      "Front",
      "Rear",
      "Interior",
      "Exterior",
      "Full Car"
    ],
    "Power Source (for electronics)": [
      "12V Car Socket",
      "USB",
      "Battery Powered"
    ],
    "Connectivity (for electronics)": [
      "Bluetooth",
      "AUX",
      "USB",
      "FM Radio"
    ],
    "Water Resistant / Waterproof": [
      "Yes",
      "No"
    ],
    "Foldable / Collapsible": [
      "Yes",
      "No"
    ],
    "Key Feature 1": [],
    "Key Feature 2": [],
    "Sales Package / Contents": [],
    "Warranty": [
      "1 Year",
      "6 Months",
      "No Warranty"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Taiwan",
      "Japan"
    ]
  },
  bike_accessories: {
    "Brand": [
      "Vega",
      "Steelbird",
      "Royal Enfield",
      "TVS",
      "Hero",
      "Autofy"
    ],
    "Product Type": [
      "Helmet",
      "Riding Gloves",
      "Bike Cover",
      "Mobile Holder",
      "Face Mask",
      "Riding Jacket",
      "Saddlebag / Luggage Box",
      "Leg Guard"
    ],
    "Vehicle Compatibility / Model": [],
    "Material": [
      "ABS Plastic",
      "Polycarbonate",
      "Leather",
      "Faux Leather",
      "Nylon",
      "Metal"
    ],
    "Color": [],
    "Size (for apparel/helmets)": [
      "S",
      "M",
      "L",
      "XL",
      "Universal"
    ],
    "Certification (for helmets)": [
      "ISI",
      "DOT",
      "ECE"
    ],
    "Visor Type (for helmets)": [
      "Clear",
      "Smoked",
      "Mirrored"
    ],
    "Water Resistant / Waterproof": [
      "Yes",
      "No"
    ],
    "Position": [
      "Handlebar",
      "Seat",
      "Side",
      "Front",
      "Rear"
    ],
    "Key Feature 1": [],
    "Key Feature 2": [],
    "Sales Package / Contents": [],
    "Warranty": [
      "6 Months",
      "1 Year",
      "No Warranty"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Taiwan"
    ]
  },
  helmet: {
    "Brand": [
      "Vega",
      "Steelbird",
      "Studds",
      "Royal Enfield",
      "Axor",
      "SMK",
      "LS2"
    ],
    "Type": [
      "Full-Face",
      "Open-Face",
      "Modular (Flip-up)",
      "Off-Road",
      "Half-Face"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Size": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "Finish": [
      "Glossy",
      "Matte"
    ],
    "Outer Shell Material": [
      "ABS Plastic",
      "Polycarbonate",
      "Fiberglass",
      "Carbon Fiber"
    ],
    "Inner Shell / Padding Material": [
      "EPS (Expanded Polystyrene)",
      "Foam"
    ],
    "Liner Type": [
      "Removable & Washable Liner",
      "Fixed Liner"
    ],
    "Certification": [
      "ISI",
      "DOT",
      "ECE"
    ],
    "Visor Type": [
      "Clear Visor",
      "Smoked Visor",
      "Mirrored Visor"
    ],
    "Visor Features": [
      "Anti-Scratch",
      "UV Resistant",
      "Pinlock Ready"
    ],
    "Ventilation": [
      "Front & Rear Vents",
      "Adjustable Vents"
    ],
    "Locking Mechanism / Strap": [
      "Quick Release Buckle",
      "D-Ring"
    ],
    "Weight (grams)": [],
    "Country of Origin": [
      "India",
      "China",
      "Spain"
    ]
  },
  gardening_tool: {
    "Brand": [
      "Falcon",
      "Kraft Seeds",
      "Wolf-Garten",
      "Fiskars",
      "Sharpex",
      "TrustBasket"
    ],
    "Product Type": [
      "Trowel",
      "Cultivator",
      "Pruning Shear / Secateurs",
      "Gardening Gloves",
      "Watering Can",
      "Hose Pipe",
      "Shovel",
      "Rake",
      "Lawn Mower"
    ],
    "Material": [
      "Carbon Steel",
      "Stainless Steel",
      "Plastic",
      "Wood",
      "Aluminium",
      "Fabric"
    ],
    "Handle Material": [
      "Plastic",
      "Wood",
      "Metal with Rubber Grip"
    ],
    "Blade Material (for cutting tools)": [
      "Carbon Steel",
      "Stainless Steel"
    ],
    "Usage / Application": [
      "Digging",
      "Weeding",
      "Pruning",
      "Watering",
      "Lawn Care",
      "Planting"
    ],
    "Ideal For": [
      "Home Gardening",
      "Professional Landscaping",
      "Indoor Plants",
      "Outdoor Plants"
    ],
    "Power Source (for powered tools)": [
      "Manual",
      "Electric (Corded)",
      "Battery Powered",
      "Petrol"
    ],
    "Ergonomic Design": [
      "Yes",
      "No"
    ],
    "Corrosion Resistant": [
      "Yes",
      "No"
    ],
    "Key Feature": [],
    "Sales Package / Contents": [],
    "Dimensions (L x W x H in cm)": [],
    "Weight (grams)": [],
    "Warranty": [
      "6 Months",
      "1 Year",
      "No Warranty"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Germany"
    ]
  },
  power_tool: {
    "Brand": [
      "Bosch",
      "Makita",
      "Dewalt",
      "Black & Decker",
      "Stanley",
      "Cheston",
      "iBELL"
    ],
    "Product Type": [
      "Drill Machine",
      "Angle Grinder",
      "Jigsaw",
      "Circular Saw",
      "Sander",
      "Heat Gun",
      "Impact Wrench"
    ],
    "Power Source": [
      "Corded",
      "Cordless (Battery Powered)"
    ],
    "Usage / Application": [
      "Woodworking",
      "Metalworking",
      "Construction",
      "Home Improvement / DIY"
    ],
    "Wattage (Watts) / Power Input": [],
    "Voltage (for cordless)": [
      "12V",
      "18V",
      "20V",
      "36V"
    ],
    "No-Load Speed (RPM)": [],
    "Chuck Size (for drills, in mm)": [
      "10mm",
      "13mm"
    ],
    "Disc Diameter (for grinders, in inches)": [
      "4 inch",
      "5 inch",
      "7 inch"
    ],
    "Battery Included (for cordless)": [
      "Yes",
      "No"
    ],
    "Number of Batteries (for cordless)": [
      "1",
      "2"
    ],
    "Battery Type (for cordless)": [
      "Lithium-Ion",
      "Ni-Cad"
    ],
    "Case / Box Included": [
      "Yes",
      "No"
    ],
    "Sales Package / Contents": [],
    "Weight (kg)": [],
    "Warranty": [
      "6 Months",
      "1 Year",
      "2 Years"
    ],
    "Country of Origin": [
      "Germany",
      "USA",
      "Japan",
      "India",
      "China"
    ]
  },
  musical_instrument:  {
    "Brand": [
      "Yamaha",
      "Fender",
      "Casio",
      "Roland",
      "Kadence",
      "Juarez",
      "Gibson",
      "Ibanez"
    ],
    "Instrument Type": [
      "Acoustic Guitar",
      "Electric Guitar",
      "Keyboard",
      "Digital Piano",
      "Drum Kit",
      "Violin",
      "Flute",
      "Ukulele",
      "Tabla"
    ],
    "Ideal For": [
      "Beginners",
      "Professionals",
      "Kids"
    ],
    "Skill Level": [
      "Beginner",
      "Intermediate",
      "Professional"
    ],
    "Body Material": [
      "Wood",
      "Rosewood",
      "Mahogany",
      "Plastic",
      "Metal"
    ],
    "Color": [],
    "Number of Keys (for keyboards)": [
      "32",
      "49",
      "61",
      "88"
    ],
    "Number of Strings (for guitars/violins)": [
      "4",
      "6",
      "12"
    ],
    "Power Source (for electronic instruments)": [
      "AC Adapter",
      "Battery Powered"
    ],
    "Connectivity / Ports (for electronic)": [
      "USB",
      "MIDI",
      "Headphone Jack",
      "Sustain Pedal Input"
    ],
    "Included Accessories": [],
    "Sales Package / Contents": [],
    "Dimensions (L x W x H in cm)": [],
    "Weight (kg)": [],
    "Warranty": [
      "1 Year",
      "2 Years",
      "No Warranty"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Japan",
      "USA",
      "Indonesia"
    ]
  },
  pet_food: {
    "Brand": [
      "Pedigree",
      "Royal Canin",
      "Whiskas",
      "Drools",
      "Farmina N&D",
      "Acana",
      "Orijen"
    ],
    "Pet Type": [
      "Dog",
      "Cat",
      "Fish",
      "Bird"
    ],
    "Diet Type / Food Type": [
      "Dry Food",
      "Wet Food",
      "Treats"
    ],
    "Life Stage": [
      "Puppy",
      "Kitten",
      "Adult",
      "Senior"
    ],
    "Breed Size": [
      "Toy",
      "Small",
      "Medium",
      "Large",
      "Giant",
      "All Breed Sizes"
    ],
    "Breed Type": [],
    "Health Condition / Special Diet": [
      "Weight Control",
      "Sensitive Skin",
      "Joint Support",
      "Grain-Free"
    ],
    "Flavor": [
      "Chicken",
      "Lamb",
      "Fish",
      "Egg",
      "Vegetable"
    ],
    "Vegetarian / Non-Vegetarian": [
      "Vegetarian",
      "Non-Vegetarian"
    ],
    "Form": [
      "Kibble",
      "Gravy",
      "Pate",
      "Sticks"
    ],
    "Key Ingredients": [],
    "Nutrient Content": [],
    "Quantity (kg/g)": [],
    "Storage Instructions": [
      "Store in a cool, dry place",
      "Refrigerate after opening"
    ],
    "Maximum Shelf Life (Months)": [
      "12",
      "18",
      "24"
    ],
    "Country of Origin": [
      "India",
      "USA",
      "France",
      "Canada"
    ]
  },
  travel_luggage: {
    "Brand": [
      "American Tourister",
      "Samsonite",
      "Skybags",
      "VIP",
      "Safari",
      "Mokobara"
    ],
    "Type": [
      "Hard-sided Luggage",
      "Soft-sided Luggage",
      "Duffle Bag",
      "Travel Backpack",
      "Trunk"
    ],
    "Size": [
      "Cabin (Small)",
      "Medium",
      "Large"
    ],
    "Ideal For": [
      "Men",
      "Women",
      "Unisex"
    ],
    "Outer Material": [
      "Polycarbonate",
      "Polypropylene",
      "ABS",
      "Polyester",
      "Nylon"
    ],
    "Capacity (Liters)": [],
    "Number of Wheels": [
      "2",
      "4",
      "8"
    ],
    "Wheel Type": [
      "Spinner (360-degree rotation)",
      "Roller (2-wheel)"
    ],
    "Lock Type": [
      "TSA Lock",
      "Combination Lock",
      "Key Lock"
    ],
    "Expandable": [
      "Yes",
      "No"
    ],
    "Water Resistant": [
      "Yes",
      "No"
    ],
    "Number of Compartments": [
      "1",
      "2",
      "3+"
    ],
    "Handle Type": [
      "Telescopic Handle"
    ],
    "Weight (kg)": [],
    "Dimensions (L x W x H in cm)": [],
    "Warranty": [
      "3 Years",
      "5 Years",
      "10 Years",
      "Global Warranty"
    ],
    "Country of Origin": [
      "India",
      "China",
      "USA"
    ]
  },
  light: {
    "Brand": [
      "Philips",
      "Wipro",
      "Syska",
      "Crompton",
      "Havells",
      "Mi"
    ],
    "Product Type": [
      "LED Bulb",
      "LED Tube Light",
      "Smart Bulb",
      "Ceiling Light",
      "Wall Light",
      "Table Lamp",
      "String/Fairy Light"
    ],
    "Ideal For / Usage": [
      "Indoor",
      "Outdoor",
      "Home",
      "Office",
      "Decorative"
    ],
    "Wattage (Watts)": [],
    "Lumen Output": [],
    "Light Color": [
      "Cool Daylight (White)",
      "Warm White (Yellowish)",
      "Natural White",
      "RGB (Multi-color)"
    ],
    "Base / Cap Type": [
      "B22 (Standard Pin)",
      "E27 (Standard Screw)",
      "E14 (Small Screw)"
    ],
    "Dimmable": [
      "Yes",
      "No"
    ],
    "Smart Features": [],
    "Body Material": [
      "Polycarbonate",
      "Aluminium",
      "Glass",
      "Plastic"
    ],
    "Shape": [
      "Round",
      "Candle",
      "Spiral",
      "Linear (Tube)"
    ],
    "CRI (Color Rendering Index)": [
      ">70",
      ">80",
      ">90"
    ],
    "Beam Angle": [],
    "Power Source": [
      "AC",
      "DC",
      "Battery Powered",
      "Solar Powered"
    ],
    "Voltage": [],
    "Warranty": [
      "1 Year",
      "2 Years",
      "No Warranty"
    ],
    "Country of Origin": [
      "India",
      "China"
    ]
  },
  blanket: {
    "Brand": [
      "Raymond Home",
      "Swayam",
      "Signature",
      "Bombay Dyeing",
      "Portico New York"
    ],
    "Type": [
      "Blanket",
      "Comforter",
      "Dohar",
      "Quilt"
    ],
    "Material": [
      "Fleece",
      "Mink",
      "Wool",
      "Cotton",
      "Polyester",
      "Sherpa"
    ],
    "Size": [
      "Single Bed",
      "Double Bed",
      "King Size",
      "Throw"
    ],
    "Color": [],
    "Pattern": [
      "Solid",
      "Floral",
      "Geometric",
      "Abstract",
      "Checked"
    ],
    "Ideal For": [
      "Mild Winter",
      "Heavy Winter",
      "AC Room",
      "Travel"
    ],
    "Warmth Level / GSM": [
      "Lightweight",
      "Medium Weight",
      "Heavy Weight",
      "All Season"
    ],
    "Ply": [
      "Single Ply",
      "Double Ply"
    ],
    "Knit/Woven": [
      "Knitted",
      "Woven"
    ],
    "Reversible": [
      "Yes",
      "No"
    ],
    "Thread Count": [],
    "Dimensions (L x W in cm)": [],
    "Sales Package": [
      "1 Blanket",
      "Set of 2"
    ],
    "Care Instructions": [
      "Machine Wash",
      "Hand Wash",
      "Dry Clean Only"
    ],
    "Country of Origin": [
      "India",
      "China"
    ]
  },
  bottel: {
    "Brand": [
      "Milton",
      "Cello",
      "Tupperware",
      "Borosil",
      "Treo",
      "Speedex"
    ],
    "Type": [
      "Water Bottle",
      "Thermos / Flask",
      "Sipper Bottle",
      "Infuser Bottle"
    ],
    "Material": [
      "Stainless Steel",
      "Plastic",
      "Copper",
      "Glass",
      "Silicone"
    ],
    "Capacity (ml/L)": [
      "500 ml",
      "750 ml",
      "1 L",
      "1.5 L",
      "2 L"
    ],
    "Color": [],
    "Ideal For": [
      "Home",
      "Office",
      "School",
      "Gym",
      "Travel"
    ],
    "Insulated / Thermosteel": [
      "Yes",
      "No"
    ],
    "Leak Proof": [
      "Yes",
      "No"
    ],
    "BPA Free": [
      "Yes",
      "No"
    ],
    "Cap Type": [
      "Screw Cap",
      "Flip-Top Cap",
      "Sipper Cap",
      "Push Button Cap"
    ],
    "Heat Retention (hours)": [],
    "Cold Retention (hours)": [],
    "Dishwasher Safe": [
      "Yes",
      "No"
    ],
    "Sales Package": [
      "1 Bottle",
      "Set of 2",
      "Set of 3"
    ],
    "Dimensions (H x D in cm)": [],
    "Warranty": [],
    "Country of Origin": [
      "India",
      "China"
    ]
  },
  battery: {
    "Brand": [
      "Duracell",
      "Eveready",
      "Panasonic",
      "Exide",
      "Luminous",
      "Amaron"
    ],
    "Battery Type": [
      "Disposable",
      "Rechargeable",
      "Inverter Battery",
      "Car Battery"
    ],
    "Size": [
      "AA",
      "AAA",
      "C",
      "D",
      "9V"
    ],
    "Chemical Composition": [
      "Alkaline",
      "Lithium-Ion",
      "Zinc-Carbon",
      "Lead-Acid",
      "Ni-MH"
    ],
    "Compatible Devices": [],
    "Voltage (V)": [
      "1.2V",
      "1.5V",
      "9V",
      "12V"
    ],
    "Capacity (mAh / Ah)": [],
    "Sales Package": [
      "Pack of 2",
      "Pack of 4",
      "Pack of 10",
      "Single Piece"
    ],
    "Rechargeable": [
      "Yes",
      "No"
    ],
    "Recharge Time (hours)": [],
    "Life Cycle (Recharge Cycles)": [],
    "Pre-Charged": [
      "Yes",
      "No"
    ],
    "Electrolyte Level Indicator": [
      "Yes",
      "No"
    ],
    "Dimensions (L x W x H in cm)": [],
    "Weight (kg/g)": [],
    "Warranty": [
      "1 Year",
      "2 Years",
      "48 Months",
      "No Warranty"
    ],
    "Country of Origin": [
      "India",
      "China",
      "Japan",
      "USA"
    ]
  },
  other: {}
};






const AddProduct = () => {
  // 1. Defined product types for the new dropdown
  const productTypes = ["Smartphone", "Fashion", "Electronics","furniture", "Appliances", "headphones", "beauty_personal_care", "Watches","sports_fitness","Books_Stationery", "Other"];

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    type: "", // 2. Added type to the initial state
    specifications: [],
  });
  const [images, setImages] = useState([]);
  const [bannerImage, setBannerImage] = useState(null); // ✅ New state for banner
  const [isLoading, setIsLoading] = useState(false);
  const {backend} = useContext(Context);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "category" && categorySpecs[value]) {
      const specDetails = categorySpecs[value];
      const autoSpecs = Object.keys(specDetails).map(key => ({
        key: key,
        value: "",
        suggestions: specDetails[key] || [],
        isPredefined: true
      }));
      setForm((prev) => ({ ...prev, specifications: autoSpecs }));
    }
  };

  const handleSpecChange = (index, field, newValue) => {
    const newSpecs = [...form.specifications];
    newSpecs[index][field] = newValue;
    setForm({ ...form, specifications: newSpecs });
  };

  const addSpecification = () => {
    setForm((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "", suggestions: [], isPredefined: false }]
    }));
  };

  const handleImageUpload = (e) => {
    setImages([...images, ...e.target.files]);
  };

  // ✅ New function for banner image upload
  const handleBannerUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBannerImage(e.target.files[0]);
    }
  };

  // ✅ Function to remove banner image
  const removeBannerImage = () => {
    setBannerImage(null);
    document.getElementById('banner-upload').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    
    // Add form fields
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "specifications") {
        formData.append(key, value);
      }
    });
    
    // Add specifications
    form.specifications.forEach((spec, index) => {
      formData.append(`specifications[${index}][key]`, spec.key);
      formData.append(`specifications[${index}][value]`, spec.value);
    });
    
    // Add images
    images.forEach((img) => formData.append("images", img));
    
    // ✅ Add banner image if exists
    if (bannerImage) {
      formData.append("banner", bannerImage);
    }

    try {
      const res = await fetch(`${backend}/api/v1/seller/sellproducts`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("✅ Product uploaded successfully");
        // Reset all fields including banner
        setForm({ name: "", description: "", price: "", stock: "", category: "", type: "", specifications: [] });
        setImages([]);
        setBannerImage(null); // ✅ Reset banner
        document.querySelector('input[type="file"]').value = '';
        document.getElementById('banner-upload').value = '';
      } else {
        toast.error("❌ Error: " + result.message);
      }
    } catch (error) {
      toast.error("❌ Upload failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <SellerLayout>
    <div className="container py-5">
        <LoadingOverlay isLoading={isLoading} text="Uploading Product..." />
      <div className="card shadow p-4">
        <h2 className="text-center text-success mb-4">📦 Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Product Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Price (₹)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required className="form-control" />
            </div>
          </div>
          
          {/* 4. Updated row to include the new Type dropdown */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} required className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select name="category" value={form.category} onChange={handleChange} required className="form-select">
                <option value="">-- Select Category --</option>
                {Object.keys(categorySpecs).map((cat) => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Product Type</label>
              <select name="type" value={form.type} onChange={handleChange} required className="form-select">
                <option value="">-- Select Type --</option>
                {productTypes.map((type) => (
                  <option key={type} value={type.toLowerCase().replace(/ & /g, '_')}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows="4" className="form-control"></textarea>
          </div>

          {/* ✅ Banner Image Upload Section */}
          <div className="mb-3">
            <label className="form-label">Banner Image (Optional)</label>
            <input 
              type="file" 
              id="banner-upload"
              name="banner" 
              accept="image/*" 
              onChange={handleBannerUpload} 
              className="form-control" 
            />
            {bannerImage && (
              <div className="mt-2">
                <div className="d-flex align-items-center">
                  <span className="text-success me-2">✓ Banner selected: {bannerImage.name}</span>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger"
                    onClick={removeBannerImage}
                  >
                    Remove
                  </button>
                </div>
                <small className="text-muted">This image will be used as the main banner for your product</small>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Product Images</label>
            <input type="file" name="images" multiple accept="image/*" onChange={handleImageUpload} className="form-control" />
            {images.length > 0 && (
              <small className="text-muted">{images.length} image(s) selected</small>
            )}
          </div>

          {form.specifications.length > 0 && (
            <div className="mb-3 p-3 border rounded bg-light">
              <label className="form-label fw-bold">Specifications</label>
              {form.specifications.map((spec, index) => (
                <div key={index} className="row g-2 mb-2 align-items-center">
                  {spec.isPredefined ? (
                    <>
                      <div className="col-md-5">
                        <label className="form-control-plaintext">{spec.key}</label>
                      </div>
                      <div className="col-md-7">
                        {spec.suggestions && spec.suggestions.length > 0 ? (
                          <>
                            <input
                              list={`suggestions-${spec.key}-${index}`}
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                              className="form-control"
                              placeholder={`Select or type for ${spec.key}`}
                              
                            />
                            <datalist id={`suggestions-${spec.key}-${index}`}>
                              {spec.suggestions.map((suggestion, i) => (
                                <option key={i} value={suggestion} />
                              ))}
                            </datalist>
                          </>
                        ) : (
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                            className="form-control"
                            placeholder={`Enter ${spec.key}`}
                            
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-md-5">
                        <input type="text" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} className="form-control" placeholder="Specification Name" required />
                      </div>
                      <div className="col-md-7">
                        <input type="text" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className="form-control" placeholder="Specification Value" required />
                      </div>
                    </>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-secondary mt-2" onClick={addSpecification}>➕ Add Custom Specification</button>
            </div>
          )}

          <div className="d-grid">
             <button type="submit" className="btn btn-success" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Uploading...</span>
                </>
              ) : (
                'Submit Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </SellerLayout>
  );
};

export default AddProduct;