import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product } from "../models/productModel.js";
import { User } from "../models/userModel.js";

const userContext = new Map();
const PAGE_SIZE = 6;

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const productSearchByNameDeclaration = {
  name: "productSearchByName",
  description: "Fetch products from backend using exact product name or keyword.",
  parameters: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
};
const productSearchDeclaration = {
  name: "productSearch",
  description: "Fetch product data from backend based on type and category",
  parameters: { type: "object", properties: { type: { type: "string" }, category: { type: "string" } }, required: ["type", "category"] },
};
const productDetailDeclaration = {
  name: "fetchProductDetail",
  description: "Fetch full details of a product from the last search list, using its index.",
  parameters: { type: "object", properties: { productIndex: { type: "number" } }, required: ["productIndex"] },
};
const showMoreProductsDeclaration = {
  name: "showMoreProducts",
  description: "Fetch the next page of products from the previous search query.",
  parameters: { type: "object", properties: {} },
};
const getUserProfileDeclaration = {
  name: "getUserProfile",
  description: "Fetch current user's profile info and last order details.",
  parameters: { type: "object", properties: {} },
};

const internal_productSearch = async ({ type, category, userId }) => {
    try {
        const products = await Product.find({
            type: { $regex: new RegExp(type, "i") },
            category: { $regex: new RegExp(category, "i") },
        }).sort({ rating: -1 }).limit(PAGE_SIZE);
        userContext.set(userId, { query: { type, category }, currentPage: 1, products: products });
        return products;
    } catch (err) { console.error("internal_productSearch error:", err); return []; }
};

const internal_showMoreProducts = async ({ userId }) => {
    const context = userContext.get(userId);
    if (!context) return { error: "Pehle kuch search karein." };
    const nextPage = context.currentPage + 1;
    const { type, category } = context.query; // Use type/category from context
    try {
        const products = await Product.find({
            type: { $regex: new RegExp(type, "i") },
            category: { $regex: new RegExp(category, "i") },
        }).sort({ rating: -1 }).skip((nextPage - 1) * PAGE_SIZE).limit(PAGE_SIZE);
        if (products.length === 0) return { error: "Aur products nahi hain." };
        context.currentPage = nextPage;
        context.products = products; // Update context with newly fetched products
        userContext.set(userId, context);
        return { products };
    } catch (err) { console.error("internal_showMoreProducts error:", err); return { error: err.message }; }
};


const internal_fetchProductDetail = async ({ productIndex, userId }) => {
    const context = userContext.get(userId);
    if (!context || !context.products || context.products.length === 0) { // Add check for context.products
        console.warn(`No context or products found for user ${userId} to fetch detail for index ${productIndex}`);
        return { error: "Pehle kuch search karein ya product list abhi available nahi hai." };
    }
    const index = parseInt(productIndex) - 1;
    if (isNaN(index) || index < 0 || index >= context.products.length) { // Add isNaN check
         console.warn(`Invalid product index ${productIndex} requested by user ${userId}. Available count: ${context.products.length}`);
        return { error: `Invalid product index. Please choose between 1 and ${context.products.length}.` };
    }
     console.log(`Fetching detail for product at index ${index} for user ${userId}`);
    return { product: context.products[index] };
};

const internal_getUserProfile = async ({ userId }) => {
    if (!userId || userId === 'guest') return { error: "User not logged in" };
    try {
        const user = await User.findById(userId).populate({
            path: 'orders',
            options: { sort: { 'createdAt': -1 }, limit: 1 }, 
            populate: { path: 'orderItems.product', select: 'name' },
        });
        if (!user) {
             console.warn(`User profile not found for ID: ${userId}`);
            return { error: "User not found" };
        }
        const lastOrder = user.orders?.[0] || null;
        const profileData = {
            name: user.name,
            address: user.address,
            lastOrder: lastOrder ? { productName: lastOrder.orderItems.map(i => i.product?.name || 'Unknown Product').join(', ') } : null 
        };
        return profileData;
    } catch (err) { console.error(`Error fetching profile for user ${userId}:`, err); return { error: "Failed to fetch user profile" }; }
};


const internal_productSearchByName = async ({ name, userId }) => {
    try {
        const products = await Product.find({
             $text: { $search: name } 
        })
         .sort({ rating: -1 })
        .limit(PAGE_SIZE); 
        userContext.set(userId, { query: { name }, currentPage: 1, products: products });
        return products;
    } catch (err) { console.error(`Error in productSearchByName for user ${userId}, query '${name}':`, err); return []; }
};


export const handleChat = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const { message, history, userProfile: profileFromFrontend } = req.body;
        const userId = req.headers["user-id"] || "guest";

        let userProfile = profileFromFrontend;
        if (userId !== 'guest') {
            const freshProfile = await internal_getUserProfile({ userId });
             if (!freshProfile.error) {
                 userProfile = freshProfile;
             } else {
                  console.warn("Could not fetch fresh profile, using frontend data. Error:", freshProfile.error);
             }
         } else {
              console.log("User is guest, using default profile data.");
         }

        const systemInstruction = `
# Persona
- Tum "ShopKart" e-commerce website ke ek friendly aur professional AI assistant ho.
- Tumhe user ke baare me ye details malum hain:
  - Naam: ${userProfile?.name || "unknown"}
  - Address: ${userProfile?.address || "not available"}
  - Last Order: ${userProfile?.lastOrder?.productName || "no previous order"}
- Jab user pehli baar message bheje, aur naam 'unknown' na ho, tab uska naam casual friendly tareeke se lo (jaise: "Jarur ${userProfile?.name}"). Agar naam nahi pata to normal "Hello!" bolo.
- Tumhara style Hinglish ho aur reply natural lage.

# Primary Rules
1.  **Tool First:** Product ya User Profile se judi queries ke liye hamesha tools ka istemaal karo. User ki baat se intent samjho. Agar woh "laptop dikhao" kahe to productSearch, agar "mera naam kya hai" kahe to getUserProfile use karo.
2.  **General Advice:** Gift/fashion/general suggestions ke liye normal baat karo bina tool ke.
3.  **Hinglish Only:** Saari baatchit sirf Hinglish mein honi chahiye.

# Tool Usage: User Profile
- User agar apne naam, address, pichle order ("last order") ke baare mein pooche TOH **HAMESHA "getUserProfile" tool use karo**. Frontend se mile data par depend mat karo, tool call karo. Example: "mera address kya hai?", "maine aakhri baar kya order kiya tha?".

# Tool Usage: Product Search
- **Search:** "productSearch" tool use karo type/category ke liye. (e.g., "mujhe phone dikhao").
- **Detail:** "fetchProductDetail" tool use karo jab user list se specific item pooche (e.g., "pehla wala dikhao", "dusre phone ki detail"). Index number (1-based) use karo.
- **More:** "showMoreProducts" tool use karo jab user "aur dikhao", "next page" jaisa kuch kahe.
- **Name Search:** "productSearchByName" tool use karo jab user specific naam le (e.g., "iPhone 15 search karo").

# Product Search Workflow
- User ke message se category samjho.
- **"# Category Mapping"** ka use karke 'type' aur 'category' nikalo.
- Example: User "laptop" -> Mapping -> type: "electronics", category: "laptop" -> Call "productSearch" with these args.
- Agar user seedha naam le (e.g., "Redmi Note 10"), toh "productSearchByName" call karo \`name: "Redmi Note 10"\` ke saath.

# Category Mapping
electronics: ["laptop", "tablet", "camera", "power_bank", "keyboard", "mouse", "projector", "storage_device", "smartwatch", "speaker"]
smartphone: ["smartphone"]
watches: ["smartwatch", "watches"]
headphones: ["headphones & earbuds", "headphones", "earbuds", "wireless earphones"]
appliances: ["refrigerator", "washing_machine", "microwave_oven", "air_conditioner", "water_purifier", "water_heater", "vacuum_cleaner", "dishwasher", "mixer_grinder", "toaster", "coffee_maker", "induction_cooktop", "fan", "cooler", "geyser"]
fashion: ["tshirt", "shirt", "jeans", "trousers", "kurta", "saree", "dress", "jacket", "fashion", "sunglasses", "shoes", "sandals_floaters", "bag", "wallet"]
Beauty_Personal_Care: ["facewash", "buty_cream", "powder", "lipstick", "perfume", "sunscreen", "moisturizer", "shampoo", "trimmer_shaver"]
Sports_Fitness: ["treadmill", "bicycle", "dumbbell", "cricket_bat", "badminton_racket", "football", "gym_essentials"]
Furniture: ["sofa", "bed", "dining_table", "wardrobe", "table", "bookshelf", "office_chair"]
Books_Stationery: ["notebook", "pen", "stationery", "books"]
Toys_Baby: ["toys", "soft_toy", "diapers", "stroller_pram", "baby_care"]
other: ["car_accessories", "bike_accessories", "helmet", "gardening_tool", "power_tool", "musical_instrument", "bettry", "bottel", "blanket", "light", "travel_luggage", "pet_food"]

# Tool Response Handling
- **productSearch/showMoreProducts/productSearchByName Success:** Agar products mile (count > 0), bolo "Yeh lijiye kuch results aapke liye:". Frontend ko 'products' action type se data bhejo.
- **productSearch/showMoreProducts/productSearchByName Failure:** Agar products nahi mile (count=0 or success=false), bolo "Maaf kijiye, iske liye abhi koi product nahi mila." Ya "Is naam se koi product nahi mila."
- **fetchProductDetail Success:** Agar product mila, **sirf confirmation do**: "Yeh rahi [ProductName] ki details:". Frontend ko 'productDetail' action type se data bhejo. Iske baad user agar specific sawaal pooche (e.g., "RAM kitni hai?"), toh sirf ussi ka jawaab do jo detail tumhare paas hai. Extra details mat do.
- **fetchProductDetail Failure:** Agar error aaya (e.g., invalid index), bolo "Lagta hai aapne galat product number bataya. Please list mein se sahi number (1, 2, 3...) bataiye."
- **getUserProfile Success:** Tool se mile user data (naam, address, last order) ko use karke user ke sawaal ka jawaab do. Example: User: "Mera naam kya hai?" -> AI: "Aapka naam **${userProfile?.name || 'mujhe nahi pata'}** hai." User: "Mera last order?" -> AI: "Aapka aakhri order **${userProfile?.lastOrder?.productName || 'mujhe nahi mil raha'}** tha."
- **getUserProfile Failure:** Agar error aaya, bolo "Maaf kijiye, main abhi aapki profile details nahi dekh paa raha hoon."

# Sales & Recommendation Strategy
(Aapka sales strategy wala poora text yahan...)
`;
      

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{
                functionDeclarations: [
                    productSearchDeclaration,
                    productDetailDeclaration,
                    showMoreProductsDeclaration,
                    getUserProfileDeclaration,
                    productSearchByNameDeclaration,
                ]
            }],
            systemInstruction: systemInstruction,
        });

        const cleanedHistory = history.map(msg => ({
             role: msg.sender === "user" ? "user" : "model",
             parts: [{ text: msg.text.split('\n\n[Products Shown:')[0].trim() }]
         }));

        const chat = model.startChat({ history: cleanedHistory });

        const result = await chat.sendMessageStream(message);

        const writeStreamChunk = (type, data) => {
             if (type === 'products' || type === 'productDetail') {
             } else {
                 const logData = (type === 'text' && data?.content?.length > 100)
                     ? { ...data, content: data.content.substring(0, 100) + '...' }
                     : data;
             }
            res.write(JSON.stringify({ type, ...data }) + "\n");
        };


        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                writeStreamChunk("text", { content: chunkText });
            }

            const functionCalls = chunk.functionCalls?.();
            if (functionCalls && functionCalls.length > 0) {
                const fn = functionCalls[0];
                let toolResponsePayload;
                let frontendActionType = null;
                let frontendData = null;

                try {
                     if (fn.name === 'productSearch') {
                         const productsData = await internal_productSearch({ ...fn.args, userId });
                         toolResponsePayload = { success: productsData.length > 0, count: productsData.length };
                         frontendActionType = 'products';
                         frontendData = productsData;
                     }
                     else if (fn.name === 'fetchProductDetail') {
                         const { product, error } = await internal_fetchProductDetail({ ...fn.args, userId });
                         toolResponsePayload = { product: product, error: error };
                         frontendActionType = 'productDetail';
                         frontendData = product;
                     }
                     else if (fn.name === 'showMoreProducts') {
                         const { products, error } = await internal_showMoreProducts({ userId });
                         toolResponsePayload = { success: !!products, count: products?.length || 0, error };
                         frontendActionType = 'products';
                         frontendData = products;
                     }
                     else if (fn.name === 'getUserProfile') {
                         const userData = await internal_getUserProfile({ userId });
                         toolResponsePayload = { user: userData };
                         if (!userData.error) {
                             userProfile = userData;
                         }
                     }
                     else if (fn.name === 'productSearchByName') {
                         const productsData = await internal_productSearchByName({ ...fn.args, userId });
                         toolResponsePayload = { success: productsData.length > 0, count: productsData.length };
                         frontendActionType = 'products';
                         frontendData = productsData;
                     }
                     else {
                          toolResponsePayload = { error: `Function ${fn.name} not recognized.` };
                     }

                 } catch (toolError) {
                      toolResponsePayload = { error: `Failed to execute ${fn.name} on the server.` };
                 }

                if (frontendActionType && frontendData !== undefined && frontendData !== null) {
                    writeStreamChunk(frontendActionType, { data: frontendData });
                } else if (frontendActionType) {
                     console.log(`Frontend action ${frontendActionType} requested, but no data to send.`);
                 }

                const aiResponse = { functionResponse: { name: fn.name, response: toolResponsePayload } };
                 const logPayload = { ...toolResponsePayload };
                 if (logPayload.product) logPayload.product = { id: logPayload.product._id, name: logPayload.product.name, partial: true }; 

                const followUpResult = await chat.sendMessageStream(JSON.stringify(aiResponse)); 

                for await (const fChunk of followUpResult.stream) {
                    const textChunk = fChunk.text();
                    if (textChunk) {
                        writeStreamChunk("text", { content: textChunk });
                    }
                }
            }
        }

        writeStreamChunk("end", {});
        res.end();

    } catch (err) {
        const clientErrorMessage = process.env.NODE_ENV === 'production'
            ? "Server par kuch technical error aagaya."
            : `Server error: ${err.message}`;

        if (!res.headersSent) {
             res.setHeader("Content-Type", "application/json");
             writeStreamChunk("error", { message: clientErrorMessage });
             writeStreamChunk("end", {});
             res.end();
        } else {
             console.error("Headers already sent, could not send error chunk to client.");
        }
    }
};