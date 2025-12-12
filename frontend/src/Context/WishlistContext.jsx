import React, { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem("wishlistItems");
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
    } catch (error) {
    }
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      const existing = prev.find((i) => i.id === product.id || i.id === product._id);
      if (existing) {
        return prev;
      }
      return [
        ...prev,
        {
          ...product,
          id: product._id || product.id,
        },
      ];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleWishlist = (product) => {
    const productId = product._id || product.id;
    const isInWishlist = wishlistItems.some((i) => i.id === productId);
    
    if (isInWishlist) {
      removeFromWishlist(productId);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((i) => i.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem("wishlistItems");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

