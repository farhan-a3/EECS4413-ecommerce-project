const initialState = [];

const handleCart = (state = initialState, action) => {
  const product = action.payload;

  switch (action.type) {
    case "ADDITEM": {
      const exist = state.find((x) => x.id === product.id);

      if (exist) {
        return state.map((x) =>
          x.id === product.id ? { ...x, qty: x.qty + 1 } : x
        );
      }

      return [...state, { ...product, qty: 1 }];
    }

    case "DELITEM": {
      const exist = state.find((x) => x.id === product.id);
      if (!exist) return state;

      if (exist.qty === 1) {
        return state.filter((x) => x.id !== product.id);
      }

      return state.map((x) =>
        x.id === product.id ? { ...x, qty: x.qty - 1 } : x
      );
    }

    case "EMPTY_CART": {
      return [];
    }

    // replaces the entire cart from DB (or merged result)
    // payload must be an array shaped like [{ ...productFields, qty }, ...]
    case "SET_CART": {
      const items = Array.isArray(action.payload) ? action.payload : [];
      return items;
    }

    default:
      return state;
  }
};

export default handleCart;
