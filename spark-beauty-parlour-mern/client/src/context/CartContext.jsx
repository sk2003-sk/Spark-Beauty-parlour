import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = 'spark_cart';
const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

function reducer(state, action) {
  switch (action.type) {
    case 'toggle':
      return state.some((s) => s._id === action.service._id)
        ? state.filter((s) => s._id !== action.service._id)
        : [...state, action.service];
    case 'remove':
      return state.filter((s) => s._id !== action.id);
    case 'clear':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  }, [items]);

  const value = useMemo(() => ({
    items,
    total: items.reduce((sum, s) => sum + s.price, 0),
    has: (id) => items.some((s) => s._id === id),
    toggle: (service) => dispatch({ type: 'toggle', service }),
    remove: (id) => dispatch({ type: 'remove', id }),
    clear: () => dispatch({ type: 'clear' }),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
