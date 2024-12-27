import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore';
import { firebaseConfig } from './firebaseAuth.mjs';
import { PRODUCTS_COLLECTION, USERS_COLLECTION, VENDOR_COLLECTION } from '../constant.mjs';

const serviceAccount = JSON.stringify(firebaseConfig);
 
  
initializeApp({ 
    credential: cert(firebaseConfig),
});

const db = getFirestore();
export async function getStores(){
    try {
        const vendorsCollection = db.collection(VENDOR_COLLECTION);  
        const snapshot = await vendorsCollection.limit(30).get();
    
        if (snapshot.empty) {
          console.log("No matching documents.");
          return;
        }
    
        const vendors = [];
        snapshot.forEach((doc) => {
          vendors.push({ id: doc.id, ...doc.data() }); 
        });
    
         return vendors;
      } catch (error) {
        console.error("Error retrieving vendors: ", error);
      }
}
 
export async function getStoreWithId(id){
    try {
        const vendorsCollection = db.collection(VENDOR_COLLECTION);  
        const snapshot = await vendorsCollection.doc(id).get();
    
        if (snapshot.empty) {
          console.log("No matching documents.");
          return;
        }
    
        const vendor = { id: snapshot.id, ...snapshot.data() };
    
         return vendor;
      } catch (error) {
        console.error("Error retrieving vendors: ", error);
      }
}


export async function getUserDetail(id){
  try {
      const userCollection = db.collection(USERS_COLLECTION);  
      const snapshot = await userCollection.doc(id).get();
  
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
  
      const data = { id: snapshot.id, ...snapshot.data() };
      console.log("Retrieved userDetail:", data);
      return data;
    } catch (error) {
      console.error("Error retrieving vendors: ", error);
    }
}


export async function setUserDetail(id,name){
  try {
    await db.collection(USERS_COLLECTION).doc(id).set({name});  
    
    } catch (error) {
      console.error("Error retrieving vendors: ", error);
    }
}

export async function getProducts(id){
  try {
      const productCollection = db.collection(PRODUCTS_COLLECTION);  
      const snapshot = await productCollection.doc(id).get();
  
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
  
      const products = { id: snapshot.id, ...snapshot.data() };
       return products;
    } catch (error) {
      console.error("Error retrieving vendors: ", error);
    }
}

export async function addItemToCart(obj) {
  const { vendorId, product_id, quantity, customerId } = obj;

  try {
    const userCollection = db.collection(USERS_COLLECTION);
    const snapshot = await userCollection.doc(customerId).get();

    if (!snapshot.exists) {
      console.log("Customer does not exist.");
      return;
    }

    let existingCartItems = snapshot.data().cart_items || {}; 

    if (!existingCartItems[vendorId]) {
      existingCartItems[vendorId] = {};
    }

    if (quantity === 0 && existingCartItems[vendorId][product_id]) {
      delete existingCartItems[vendorId][product_id];
      console.log(Object.keys(existingCartItems[vendorId]).length , vendorId, product_id)
      if (Object.keys(existingCartItems[vendorId]).length === 0) {
        delete existingCartItems[vendorId];
      }
    } else {
      existingCartItems[vendorId][product_id] = quantity;
    }
    
 

    await userCollection.doc(customerId).update({ cart_items: existingCartItems });

   } catch (error) {
    console.error("Error updating cart:", error);
  }
}

export async function storeAddresses(obj, id){
  try {
    const userCollection = db.collection(USERS_COLLECTION).doc(id);
    userCollection.update({ address: obj});
   } catch (error) {
    console.error("Error updating cart:", error);
  }
}

export async function getAddresses(id){
  try {
    const userCollection = db.collection(USERS_COLLECTION).doc(id);
    const data = await userCollection.get();
    
    return data.data().address || [];
   } catch (error) {
    console.error("Error updating cart:", error);
  }
}
 
export async function queryDB(query) {
  try { 

    const productsCollection = db.collection(PRODUCTS_COLLECTION);
    const vendorsCollection = db.collection(VENDOR_COLLECTION);

    const results = {
      products: [],
      shops: [],
    };

    // Search for products
    const productSnapshot = await productsCollection.get();

    productSnapshot.forEach((doc) => {
      const data = doc.data();
      const { items,shopId } = data;

      // Ensure `items` exists and is an array
      if (Array.isArray(items)) {
        // Filter the `items` array for objects where `item_name` matches the query
        const matchingItems = items.filter((item) =>
          item.item_name?.toLowerCase().includes(query.toLowerCase())
        );

        if (matchingItems.length > 0) {
          results.products.push({
            id: shopId,
            ...data,
            items: matchingItems, // Include only the matching items
          });
        }
      }
    });

    // Search for shops
    const vendorSnapshot = await vendorsCollection
      .where("name", ">=", query)
      .where("name", "<=", query + "\uf8ff") // Prefix-based search
      .limit(30)
      .get();

    if (!vendorSnapshot.empty) {
      vendorSnapshot.forEach((doc) => {
        results.shops.push({ id: doc.id, ...doc.data() });
        console.log(doc);
      });
    }

    console.log(results);
    return results;
  } catch (error) {
    console.error("Error querying database:", error);
    throw new Error("Failed to query the database.");
  }
}

export async function placeOrder(order, id) {
  try { 

    const userCollection =await db.collection(USERS_COLLECTION).doc(id).get();
    let items =userCollection.data()['orders'] || []

    let data = []
    for(let obj of order){
      for(let orderDetiai of obj['productDetails']){
        orderDetiai['total'] = orderDetiai['price'] * orderDetiai['quantity']
        orderDetiai['shopId'] = obj['shopDetails']['id']
        data.push(orderDetiai)
      }
    }
    items.push({time: new Date(), data})
    console.log(items)
  
    await db.collection(USERS_COLLECTION).doc(id).update({orders: items, cart_items:{}})

  } catch (error) {
    console.error("Error querying database:", error);
    throw new Error("Failed to query the database.");
  }
}



export async function getOrders( id) {
  try { 
    const userCollection =await db.collection(USERS_COLLECTION).doc(id).get();
    
    let items =userCollection.data()['orders'] || []
    return items
 
  } catch (error) {
    console.error("Error querying database:", error);
    throw new Error("Failed to query the database.");
  }
}
