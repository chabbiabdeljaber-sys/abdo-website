import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const initializeSampleProducts = async () => {
  const sampleProducts = [
    {
      product_name: 'Organic Cotton T-Shirt',
      product_price: 29.99,
      category: 'Clothing',
      product_description: 'Made from 100% organic cotton, this t-shirt is both comfortable and eco-friendly.',
      product_img_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      feature_product: true
    },
    {
      product_name: 'Bamboo Toothbrush',
      product_price: 12.99,
      category: 'Personal Care',
      product_description: 'Eco-friendly bamboo toothbrush with soft bristles.',
      product_img_url: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      feature_product: false
    },
    {
      product_name: 'Reusable Water Bottle',
      product_price: 24.99,
      category: 'Accessories',
      product_description: 'Stainless steel water bottle that keeps drinks cold for 24 hours.',
      product_img_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      feature_product: true
    }
  ];

  try {
    const productsCollection = collection(db, 'products');
    for (const product of sampleProducts) {
      await addDoc(productsCollection, product);
    }
    return true;
  } catch (err) {
    console.error('Error initializing sample products:', err);
    return false;
  }
}; 