import React, { createContext, useReducer, useContext, useEffect } from 'react';

const CartContext = createContext();

// Load cart from localStorage on initialization
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

const initialState = {
  cart: loadCartFromStorage(),
  buyNowProduct: null,
};

function cartReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case 'ADD_TO_CART': {
      const item = state.cart.find(i => i.id === action.product.id);
      if (item) {
        newState = {
          ...state,
          cart: state.cart.map(i =>
            i.id === action.product.id ? { ...i, quantity: i.quantity + (action.product.quantity || 1) } : i
          ),
        };
      } else {
        newState = {
          ...state,
          cart: [...state.cart, { ...action.product, quantity: action.product.quantity || 1 }],
        };
      }
      break;
    }
    case 'REMOVE_FROM_CART':
      newState = {
        ...state,
        cart: state.cart.filter(i => i.id !== action.id),
      };
      break;
    case 'UPDATE_QUANTITY':
      newState = {
        ...state,
        cart: state.cart.map(i =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
      break;
    case 'CLEAR_CART':
      newState = { ...state, cart: [] };
      break;
    case 'BUY_NOW':
      newState = { ...state, buyNowProduct: { ...action.product, quantity: action.product.quantity || 1 } };
      break;
    case 'CLEAR_BUY_NOW':
      newState = { ...state, buyNowProduct: null };
      break;
    default:
      return state;
  }
  
  // Save cart to localStorage whenever it changes
  if (newState && newState.cart !== state.cart) {
    try {
      localStorage.setItem('cart', JSON.stringify(newState.cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
  
  return newState;
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  return (
    <CartContext.Provider value={{ cart: state.cart, buyNowProduct: state.buyNowProduct, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 