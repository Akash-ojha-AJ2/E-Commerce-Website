import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product } from "../models/productModel.js";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRODUCT_TYPES_AND_CATEGORIES = {
    "electronics": ["laptop", "tablet", "camera", "power_bank", "keyboard", "mouse", "projector", "storage_device", "smartwatch", "speaker"],
    "smartphone": ["smartphone"],
    "watches": ["smartwatch", "watches"],
    "headphones": ["headphones_earbuds", "headphones", "earbuds", "wireless_earphones"],
    "appliances": ["refrigerator", "washing_machine", "microwave_oven", "air_conditioner", "water_purifier", "water_heater", "vacuum_cleaner", "dishwasher", "mixer_grinder", "toaster", "coffee_maker", "induction_cooktop", "fan", "cooler", "geyser","television"],
    "fashion": ["tshirt", "shirt", "jeans", "trousers", "kurta", "saree", "dress", "jacket", "fashion", "sunglasses", "shoes", "sandals_floaters", "bag", "wallet"],
    "Beauty_Personal_Care": ["facewash", "buty_cream", "powder", "lipstick", "perfume", "sunscreen", "moisturizer", "shampoo", "trimmer_shaver"],
    "Sports_Fitness": ["treadmill", "bicycle", "dumbbell", "cricket_bat", "badminton_racket", "football", "gym_essentials"],
    "Furniture": ["sofa", "bed", "dining_table", "wardrobe", "table", "bookshelf", "office_chair"],
    "Books_Stationery": ["notebook", "pen", "stationery", "books"],
    "Toys_Baby": ["toys", "soft_toy", "diapers", "stroller_pram", "baby_care"],
    "other": ["car_accessories", "bike_accessories", "helmet", "gardening_tool", "power_tool", "musical_instrument", "battery", "bottel", "blanket", "light", "travel_luggage", "pet_food"]
};

const extractJSONFromMarkdown = (text) => {
  try {
    let cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    if (!cleanedText.startsWith('{')) {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleanedText = jsonMatch[0];
    }
    return cleanedText;
  } catch (error) {
    console.error("Error in extractJSONFromMarkdown:", error);
    throw new Error("Failed to extract JSON from AI response");
  }
};

const extractPriceFromQuery = (query, specifications = []) => {
  try {
    if (!query) return {};
    let priceFilter = {};
    
    const cleanQuery = query.toLowerCase()
      .replace(/mobile|phone|smartphone|under|below|above|over|less than|more than|greater than|upto|max|min/g, '')
      .trim();
    
    const maxPriceMatch = cleanQuery.match(/(under|below|less than|upto|max)\s*₹?\s*(\d+)/i) || 
                         cleanQuery.match(/₹?\s*(\d+)\s*(under|below|less than|max)/i);
    if (maxPriceMatch) {
      let maxPriceValue = maxPriceMatch[2] ? parseInt(maxPriceMatch[2]) : parseInt(maxPriceMatch[1]);
      if (!isNaN(maxPriceValue)) {
        priceFilter.maxPrice = maxPriceValue;
      }
    }
    
    const minPriceMatch = cleanQuery.match(/(above|over|more than|greater than|min)\s*₹?\s*(\d+)/i) || 
                         cleanQuery.match(/₹?\s*(\d+)\s*(above|over|more than|greater than|min)/i);
    if (minPriceMatch) {
      let minPriceValue = minPriceMatch[2] ? parseInt(minPriceMatch[2]) : parseInt(minPriceMatch[1]);
      if (!isNaN(minPriceValue)) {
        priceFilter.minPrice = minPriceValue;
      }
    }
    
    const rangeMatch = cleanQuery.match(/₹?\s*(\d+)\s*-\s*₹?\s*(\d+)/i) || 
                      cleanQuery.match(/₹?\s*(\d+)\s*to\s*₹?\s*(\d+)/i);
    if (rangeMatch) {
      const minPrice = parseInt(rangeMatch[1]);
      const maxPrice = parseInt(rangeMatch[2]);
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        priceFilter.minPrice = minPrice;
        priceFilter.maxPrice = maxPrice;
      }
    }
    
    if (!priceFilter.minPrice && !priceFilter.maxPrice) {
      const simplePriceMatch = cleanQuery.match(/\b₹?\s*(\d{4,})\b/g); // Only numbers with 4+ digits
      if (simplePriceMatch && simplePriceMatch.length === 1) {
        const priceString = simplePriceMatch[0].replace(/[₹\s,]/g, '');
        const isPartOfSpec = specifications.some(spec => 
          spec.value && spec.value.toLowerCase().includes(priceString)
        );
        const priceValue = parseInt(priceString);
        
        if (!isNaN(priceValue) && !isPartOfSpec && priceValue > 1000 && priceValue < 1000000) {
          priceFilter.maxPrice = priceValue;
        }
      }
    }
    
    return priceFilter;
  } catch (error) {
    console.error("❌ Error in extractPriceFromQuery:", error);
    return {};
  }
};

const fixSpecificationsFormat = (filters) => {
  try {
    if (!filters.specifications) {
        filters.specifications = [];
    }
    if (typeof filters.specifications === 'object' && !Array.isArray(filters.specifications)) {
        const specsArray = [];
        for (const [key, value] of Object.entries(filters.specifications)) {
            if (!key.toLowerCase().includes('price')) {
                specsArray.push({ key, value: value.toString() });
            }
        }
        filters.specifications = specsArray;
    }
    filters.specifications = filters.specifications
        .filter(spec => spec && spec.key && spec.value && !spec.key.toLowerCase().includes('price'))
        .map(spec => ({
            key: spec.key.toString(),
            value: spec.value.toString()
        }));
    return filters;
  } catch (error) {
    console.error("Error in fixSpecificationsFormat:", error);
    filters.specifications = [];
    return filters;
  }
};

// --- Function to escape regex special characters ---
const escapeRegex = (string) => {
  try {
    if (!string || typeof string !== 'string') return '';
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  } catch (error) {
    console.error("Error in escapeRegex:", error);
    return string || '';
  }
};

// --- Function to calculate match score for sorting ---
const calculateMatchScore = (product, userQuery, filters) => {
  let score = 0;
  const queryWords = userQuery.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const productName = product.name.toLowerCase();
  const productDesc = product.description.toLowerCase();
  
  // Exact name match (highest priority)
  if (productName === userQuery.toLowerCase()) {
    score += 1000;
  }
  
  // Name contains exact query
  if (productName.includes(userQuery.toLowerCase())) {
    score += 500;
  }
  
  // Count matching words in name
  queryWords.forEach(word => {
    if (productName.includes(word)) {
      score += 20;
    }
  });
  
  // Count matching words in description
  queryWords.forEach(word => {
    if (productDesc.includes(word)) {
      score += 5;
    }
  });
  
  // Specifications match
  if (filters.specifications && filters.specifications.length > 0) {
    filters.specifications.forEach(spec => {
      const hasSpec = product.specifications.some(productSpec => 
        productSpec.key.toLowerCase().includes(spec.key.toLowerCase()) &&
        productSpec.value.toLowerCase().includes(spec.value.toLowerCase())
      );
      if (hasSpec) score += 30;
    });
  }
  
  // Type and category match
  if (filters.type && product.type && product.type.toLowerCase().includes(filters.type.toLowerCase())) {
    score += 40;
  }
  if (filters.category && product.category && product.category.toLowerCase().includes(filters.category.toLowerCase())) {
    score += 40;
  }
  
  return score;
};

// --- AI Search Controller ---
export const aiSearch = async (req, res) => {
  const { query: userQuery } = req.body;

  if (!userQuery || !userQuery.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: "Search query is required" 
    });
  }


  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { 
        temperature: 0.1, 
        maxOutputTokens: 1000 
      }
    });

    // --- SIMPLIFIED PROMPT ---
    const prompt = `
# TASK
You are an e-commerce search filter extraction system. Your task is to convert a user query into a JSON object with 'type', 'category', and 'specifications'.

# INSTRUCTIONS
1. FIRST identify the 'type' and 'category' from the PRODUCT_TYPES_AND_CATEGORIES map
2. THEN extract ONLY the product specifications (color, size, brand, model, etc.) from the query
3. IGNORE price-related words (under, below, above, ₹, etc.) - price will be handled separately
4. Return ONLY the valid JSON object

# PRODUCT_TYPES_AND_CATEGORIES
${JSON.stringify(PRODUCT_TYPES_AND_CATEGORIES, null, 2)}

# CRITICAL RULES
1. **JSON ONLY:** Do NOT output any text or markdown. The response MUST be *only* the raw JSON object.
2. **IGNORE PRICE:** Completely ignore price-related words like: under, below, above, over, ₹, rupees, etc.
3. **ONLY PRODUCT SPECS:** Only extract product specifications like: color, size, brand, model, material, etc.
4. **SPEC FORMAT:** [{"key": "Color", "value": "Red"}, {"key": "Size", "value": "M"}]

# EXAMPLES
Query: "mobile under 40000"
Response: {"type": "smartphone", "category": "smartphone", "specifications": []}

Query: "laptop above 50000"
Response: {"type": "electronics", "category": "laptop", "specifications": []}

Query: "tshirt under 1000"
Response: {"type": "fashion", "category": "tshirt", "specifications": []}

Query: "red tshirt below 500"
Response: {"type": "fashion", "category": "tshirt", "specifications": [{"key": "Color", "value": "Red"}]}

Query: "nike shoes under 2000"
Response: {"type": "fashion", "category": "shoes", "specifications": [{"key": "Brand", "value": "Nike"}]}

Query: "samsung phone 8gb ram"
Response: {"type": "smartphone", "category": "smartphone", "specifications": [{"key": "Brand", "value": "Samsung"}, {"key": "RAM", "value": "8GB"}]}

# USER QUERY
User Query: "${userQuery}"
JSON Response:
`;

    
    let aiResponseText;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      aiResponseText = response.text();
      
      if (!aiResponseText || aiResponseText.trim() === "") {
        throw new Error("AI returned an empty response");
      }
      
    } catch (aiError) {
      console.error("AI API Error:", aiError);
      aiResponseText = JSON.stringify({
        type: "",
        category: "", 
        specifications: []
      });
    }

    let filters;
    try {
      const jsonText = extractJSONFromMarkdown(aiResponseText);
      filters = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      filters = {
        type: "",
        category: "",
        specifications: []
      };
    }

    if (!filters.type) filters.type = "";
    if (!filters.category) filters.category = "";
    
    try {
      filters = fixSpecificationsFormat(filters);
    } catch (formatError) {
      console.error("Error fixing specifications format:", formatError);
      filters.specifications = [];
    }

   
    const priceFilter = extractPriceFromQuery(userQuery, filters.specifications);
    
    if (priceFilter.minPrice) {
      filters.minPrice = priceFilter.minPrice;
    }
    if (priceFilter.maxPrice) {
      filters.maxPrice = priceFilter.maxPrice;
    }


    let dbQuery = {};
    let products = [];

    try {
      const searchConditions = [];
      searchConditions.push({ name: { $regex: new RegExp(escapeRegex(userQuery), 'i') } });
      
      searchConditions.push({ description: { $regex: new RegExp(escapeRegex(userQuery), 'i') } });
    
      searchConditions.push({ 
        'specifications.value': { $regex: new RegExp(escapeRegex(userQuery), 'i') } 
      });

      if (filters.type && filters.type.trim() !== "") {
        searchConditions.push({ type: { $regex: new RegExp(escapeRegex(filters.type), 'i') } });
      }
      if (filters.category && filters.category.trim() !== "") {
        searchConditions.push({ category: { $regex: new RegExp(escapeRegex(filters.category), 'i') } });
      }

      if (filters.specifications && filters.specifications.length > 0) {
        filters.specifications.forEach(spec => {
          searchConditions.push({
            'specifications': {
              $elemMatch: {
                key: { $regex: new RegExp(escapeRegex(spec.key), 'i') },
                value: { $regex: new RegExp(escapeRegex(spec.value), 'i') }
              }
            }
          });
        });
      }

      dbQuery.$or = searchConditions;

      if (filters.minPrice || filters.maxPrice) {
        dbQuery.price = {};
        if (filters.minPrice) {
          dbQuery.price.$gte = parseInt(filters.minPrice);
        }
        if (filters.maxPrice) {
          dbQuery.price.$lte = parseInt(filters.maxPrice);
        }
      }

      products = await Product.find(dbQuery)
        .populate('seller', 'name email')
        .select('-__v')
        .maxTimeMS(30000);

      if (products.length > 0) {
        const productsWithScores = products.map(product => ({
          ...product.toObject(),
          matchScore: calculateMatchScore(product, userQuery, filters)
        }));

        productsWithScores.sort((a, b) => b.matchScore - a.matchScore);
        products = productsWithScores;   
      }
      products = products.slice(0, 50);
    } catch (dbError) {
      console.error("Database Query Error:", dbError);
      products = [];
    }

    return res.json({
      success: true,
      products: products,
      count: products.length,
      filtersApplied: filters,
      message: products.length === 0 ? "No products found matching your search" : "Search completed successfully"
    });

  } catch (error) {
    console.error('AI Search Controller Error:', error);
    throw error;
  }
};