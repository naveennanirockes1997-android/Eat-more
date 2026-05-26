import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useDispatch, useSelector } from 'react-redux';
import { cartActions } from '../store/slices/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Star,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ShoppingBag,
} from 'lucide-react';

import FoodDetailsModal from './FoodDetailsModal';

const CategoryCarousel = ({
  category,
  items,
  onSelect,
  onAddToCart,
}) => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;

      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div style={{ marginBottom: '50px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h3
          style={{
            fontSize: '26px',
            fontWeight: 'bold',
          }}
        >
          {category}
        </h3>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => scroll('left')}
            className="glass"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => scroll('right')}
            className="glass"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={carouselRef}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          paddingBottom: '20px',
          scrollSnapType: 'x mandatory',
        }}
      >
        {items.map((item) => (
          <motion.div
            key={item._id}
            id={item._id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{
              scale: 1.03,
              y: -8,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
            className="glass"
            style={{
              minWidth: '300px',
              maxWidth: '300px',
              overflow: 'hidden',
              cursor: 'pointer',
              scrollSnapAlign: 'start',
              flexShrink: 0,
            }}
            onClick={() => onSelect(item)}
          >
            {/* Image */}
            <div
              style={{
                height: '220px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={
                  item.imageUrl &&
                  !item.imageUrl.endsWith('/')
                    ? item.imageUrl
                    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'
                }
                alt={item.itemName}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
                }}
              />

              {/* Rating */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '6px 10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                <Star
                  size={14}
                  fill="var(--primary)"
                  color="var(--primary)"
                />

                {item.rating}

                <span style={{ color: 'var(--text-muted)' }}>
                  ({item.reviews})
                </span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.itemName}
                </h3>

                <span
                  style={{
                    color: 'var(--primary)',
                    fontWeight: '700',
                  }}
                >
                  ${item.itemPrice}
                </span>
              </div>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  marginBottom: '20px',
                  height: '40px',
                  overflow: 'hidden',
                }}
              >
                {item.itemDescription ||
                  'Chef-recommended gourmet meal.'}
              </p>

              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item);
                }}
              >
                <Plus size={18} /> Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Menu = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [sortOption, setSortOption] =
    useState('top-rated');

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [toast, setToast] = useState(null);

  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const { userInfo } = useSelector(
    (state) => state.user
  );

  const location = useLocation();

  /* =========================
      CATEGORY FUNCTION
  ========================== */

  const getCategory = (item) => {
    const name = item.itemName.toLowerCase();

    if (
      name.includes('biryani') ||
      name.includes('pulav') ||
      name.includes('rice')
    ) {
      return 'Rice & Biryani';
    }

    if (
      name.includes('kebab') ||
      name.includes('tikka') ||
      name.includes('fry') ||
      name.includes('grilled')
    ) {
      return 'Starters & Grills';
    }

    if (
      name.includes('curry') ||
      name.includes('makhani') ||
      name.includes('masala') ||
      name.includes('korma')
    ) {
      return 'Main Course';
    }

    if (
      name.includes('dessert') ||
      name.includes('sweet') ||
      name.includes('kulfi')
    ) {
      return 'Desserts';
    }

    if (
      name.includes('coffee') ||
      name.includes('lassi') ||
      name.includes('drink')
    ) {
      return 'Beverages';
    }

    if (
      name.includes('pizza') ||
      name.includes('burger') ||
      name.includes('pasta')
    ) {
      return 'Fast Food';
    }

    return 'Other Delicacies';
  };

  /* =========================
      TOAST AUTO HIDE
  ========================== */

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  /* =========================
      SCROLL TO HASH, CLEAR FILTERS & OPEN MODAL
  ========================== */

  useEffect(() => {
    if (location.hash && items.length > 0) {
      const id = location.hash.replace('#', '');
      
      const targetItem = items.find(item => item._id === id || item.itemID === id);
      if (targetItem) {
        // 1. If a category filter is active and hides this item, reset category filter to 'All'
        if (selectedCategory !== 'All' && selectedCategory !== targetItem.category) {
          setSelectedCategory('All');
          setFilteredItems(items);
        }
        
        // 2. Open the FoodDetailsModal for the selected item
        setSelectedItem(targetItem);
        
        // 3. Smoothly scroll the card into view (with a tiny delay to allow layout to settle if category was reset)
        setTimeout(() => {
          const element = document.getElementById(targetItem._id);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center',
            });
          }
        }, 150);
      }
    }
  }, [location.hash, items]);

  /* =========================
      FETCH ITEMS
  ========================== */

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/menu`
        );

        const data = response.data.data;

        const categorizedData = data.map((item) => {
          const hash = item.itemName
            .split('')
            .reduce(
              (acc, char) => acc + char.charCodeAt(0),
              0
            );

          const mockRating = (
            4.0 +
            (hash % 10) / 10
          ).toFixed(1);

          const mockReviews = 50 + (hash % 200);

          return {
            ...item,
            category: getCategory(item),
            rating: parseFloat(mockRating),
            reviews: mockReviews,
          };
        });

        categorizedData.sort(
          (a, b) => b.rating - a.rating
        );

        setItems(categorizedData);
        setFilteredItems(categorizedData);

        const uniqueCategories = [
          'All',
          ...new Set(
            categorizedData.map(
              (item) => item.category
            )
          ),
        ];

        setCategories(uniqueCategories);

        setLoading(false);
      } catch (error) {
        console.error(
          'Error fetching menu items:',
          error
        );

        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  /* =========================
      CATEGORY FILTER
  ========================== */

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    if (category === 'All') {
      setFilteredItems(items);
    } else {
      setFilteredItems(
        items.filter(
          (item) => item.category === category
        )
      );
    }
  };

  /* =========================
      ADD TO CART
  ========================== */

  const addToCartHandler = (item) => {
    if (!userInfo) {
      setToast(
        'Please login first to add items to cart!'
      );

      return;
    }

    dispatch(
      cartActions.addItemToCart({
        id: item.itemID,
        name: item.itemName,
        price: item.itemPrice,
        image: item.imageUrl,
        category: item.category,
      })
    );

    setToast(`${item.itemName} added to cart`);
  };

  /* =========================
      LOADING
  ========================== */

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '100px',
        }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

  /* =========================
      SORTING
  ========================== */

  const getSortedItems = (itemsList) => {
    return [...itemsList].sort((a, b) => {
      if (sortOption === 'top-rated') {
        return b.rating - a.rating;
      }

      if (sortOption === 'price-low-high') {
        return a.itemPrice - b.itemPrice;
      }

      if (sortOption === 'price-high-low') {
        return b.itemPrice - a.itemPrice;
      }

      return 0;
    });
  };

  return (
    <section
      id="menu"
      className="container"
      style={{ padding: '80px 0' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          marginBottom: '60px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '40px',
              marginBottom: '12px',
            }}
          >
            Our{' '}
            <span className="text-gradient">
              Menu
            </span>
          </h2>

          <p style={{ color: 'var(--text-muted)' }}>
            Curated dishes prepared with fresh
            ingredients.
          </p>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          {/* Categories */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  handleCategoryChange(cat)
                }
                className="glass"
                style={{
                  padding: '10px 24px',
                  borderRadius: '30px',
                  background:
                    selectedCategory === cat
                      ? 'var(--primary)'
                      : 'var(--glass)',
                  color:
                    selectedCategory === cat
                      ? 'white'
                      : 'var(--text)',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sorting */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                fontWeight: '600',
              }}
            >
              Sort by:
            </span>

            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value)
              }
              className="glass"
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background:
                  'rgba(255,255,255,0.05)',
                color: 'white',
                border:
                  '1px solid var(--glass-border)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="top-rated">
                Top Rated
              </option>

              <option value="price-low-high">
                Price: Low to High
              </option>

              <option value="price-high-low">
                Price: High to Low
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div>
        {selectedCategory === 'All' ? (
          categories
            .filter((c) => c !== 'All')
            .map((category) => {
              const categoryItems =
                getSortedItems(
                  filteredItems.filter(
                    (item) =>
                      item.category === category
                  )
                );

              if (categoryItems.length === 0) {
                return null;
              }

              return (
                <CategoryCarousel
                  key={category}
                  category={category}
                  items={categoryItems}
                  onSelect={setSelectedItem}
                  onAddToCart={addToCartHandler}
                />
              );
            })
        ) : (
          <CategoryCarousel
            category={selectedCategory}
            items={getSortedItems(filteredItems)}
            onSelect={setSelectedItem}
            onAddToCart={addToCartHandler}
          />
        )}
      </div>

      {/* Modal */}
      <FoodDetailsModal
        item={selectedItem}
        allItems={filteredItems}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCartHandler}
      />

      {/* Premium Dynamic Toast */}
      <AnimatePresence>
        {toast && (() => {
          const isObject = typeof toast === 'object' && toast !== null;
          const msg = isObject ? toast.message : toast;
          const isWarning = isObject 
            ? toast.type === 'warning' 
            : (msg.toLowerCase().includes('login') || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail'));
          
          return (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
              exit={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{
                position: 'fixed',
                top: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                width: '90%',
                maxWidth: '400px',
              }}
            >
              <div
                style={{
                  background: isWarning 
                    ? 'rgba(239, 68, 68, 0.12)' 
                    : 'rgba(16, 185, 129, 0.12)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isWarning
                    ? '1px solid rgba(239, 68, 68, 0.25)'
                    : '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: isWarning
                    ? '0 10px 30px -5px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 10px 30px -5px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Left Color Accent Pill */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '6px',
                  background: isWarning ? '#ef4444' : '#10b981'
                }} />

                {/* Icon wrapper */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isWarning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: isWarning ? '#f87171' : '#34d399',
                  flexShrink: 0
                }}>
                  {isWarning ? <AlertCircle size={20} /> : <ShoppingBag size={20} />}
                </div>

                {/* Msg text */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    margin: '0 0 2px 0', 
                    fontSize: '14px', 
                    fontWeight: '700',
                    color: isWarning ? '#f87171' : '#34d399',
                    letterSpacing: '0.3px'
                  }}>
                    {isWarning ? 'System Notification' : 'Success'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4', fontWeight: '500' }}>
                    {msg}
                  </p>
                </div>

                {/* Countdown progress line */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: 3, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    background: isWarning ? '#ef4444' : '#10b981',
                    opacity: 0.7
                  }}
                />
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
};

export default Menu;