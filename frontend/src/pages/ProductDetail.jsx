import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API, { getImageUrl } from '../utils/api';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/order/${id}`);
  };

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await API.post('/orders', {
        productId: id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: '0000000000',
        quantity: 1
      });
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) return (
    <div>
      <Navbar />
      <div style={styles.loadingPage}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading...</p>
      </div>
    </div>
  );

  // All images — main + extra
  const allImages = [
    getImageUrl(product.image),
    ...(product.images || []).map(img => getImageUrl(img))
  ];

  return (
    <div>
      <Navbar />
      <div style={styles.page}>

        {/* Breadcrumb */}
        <p style={styles.breadcrumb}>
          <span style={styles.breadcrumbLink} onClick={() => navigate('/')}>Home</span>
          {' '} / {' '}
          <span style={styles.breadcrumbLink} onClick={() => navigate('/')}>Collection</span>
          {' '} / {' '}
          <span style={styles.breadcrumbCurrent}>{product.name}</span>
        </p>

        <div style={styles.layout}>
          {/* Image Gallery */}
          <div style={styles.gallery}>
            {/* Main Image */}
            <div style={styles.mainImageBox}>
              <img
                src={allImages[activeImg]}
                alt={product.name}
                style={styles.mainImage}
              />
              {product.stock === 0 && (
                <div style={styles.outOfStock}>Out of Stock</div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={styles.thumbnails}>
                {allImages.map((img, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.thumbnail,
                      border: activeImg === index ? '2px solid #C9A84C' : '2px solid transparent'
                    }}
                    onClick={() => setActiveImg(index)}
                  >
                    <img src={img} alt={`view ${index + 1}`} style={styles.thumbnailImg} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div style={styles.info}>
            <h1 style={styles.productName}>{product.name}</h1>
            <div style={styles.divider} />

            {/* Rating */}
            {product.numReviews > 0 && (
              <div style={styles.ratingRow}>
                <span style={styles.stars}>
                  {'★'.repeat(Math.round(product.rating))}
                  {'☆'.repeat(5 - Math.round(product.rating))}
                </span>
                <span style={styles.ratingCount}>({product.numReviews} reviews)</span>
              </div>
            )}

            <p style={styles.price}>₹{product.price?.toLocaleString()}</p>

            {/* Details */}
            <div style={styles.detailsBox}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Fabric</span>
                <span style={styles.detailValue}>{product.fabric}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Colour</span>
                <span style={styles.detailValue}>{product.colour}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Pattern</span>
                <span style={styles.detailValue}>{product.pattern}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Availability</span>
                <span style={{
                  ...styles.detailValue,
                  color: product.stock > 0 ? '#27AE60' : '#E74C3C'
                }}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Buttons */}
            {product.stock > 0 && (
              <div style={styles.btnRow}>
                <button style={styles.cartBtn} onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button style={styles.buyBtn} onClick={handleBuyNow}>
                  Buy Now
                </button>
              </div>
            )}

            {/* Note */}
            <p style={styles.note}>
  Secure payment · Order confirmation via email
</p>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews?.length > 0 && (
          <div style={styles.reviewsSection}>
            <h2 style={styles.reviewsTitle}>Customer Reviews</h2>
            <div style={styles.reviewsDivider} />
            <div style={styles.reviewsGrid}>
              {product.reviews.map((review, index) => (
                <div key={index} style={styles.reviewCard}>
                  <div style={styles.reviewTop}>
                    <div style={styles.reviewAvatar}>
                      {review.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={styles.reviewName}>{review.name}</p>
                      <p style={styles.reviewStars}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </p>
                    </div>
                  </div>
                  {review.comment && (
                    <p style={styles.reviewComment}>{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  loadingPage: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E2C97E',
    borderTop: '3px solid #6B1B2A',
    borderRadius: '50%',
    animation: 'rotate 1s linear infinite',
  },
  loadingText: {
    fontFamily: 'Cinzel, serif',
    color: '#6B1B2A',
    letterSpacing: '3px',
  },
  page: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  breadcrumb: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '12px',
    color: '#888',
    letterSpacing: '1px',
    marginBottom: '32px',
  },
  breadcrumbLink: {
    color: '#6B1B2A',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  breadcrumbCurrent: {
    color: '#888',
  },
  layout: {
    display: 'flex',
    gap: '60px',
    alignItems: 'flex-start',
  },
  gallery: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mainImageBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: '3/4',
    overflow: 'hidden',
    background: '#F5ECD8',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease',
  },
  outOfStock: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    background: '#6B1B2A',
    color: '#C9A84C',
    padding: '6px 16px',
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    letterSpacing: '2px',
  },
  thumbnails: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: '80px',
    height: '80px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border 0.2s',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingTop: '8px',
  },
  productName: {
    fontFamily: 'Cinzel, serif',
    fontSize: '28px',
    color: '#6B1B2A',
    letterSpacing: '2px',
    lineHeight: 1.3,
  },
  divider: {
    width: '60px',
    height: '2px',
    background: 'linear-gradient(to right, #C9A84C, transparent)',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stars: {
    color: '#C9A84C',
    fontSize: '18px',
  },
  ratingCount: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#888',
  },
  price: {
    fontFamily: 'Cinzel, serif',
    fontSize: '32px',
    color: '#6B1B2A',
  },
  detailsBox: {
    border: '1px solid #F5ECD8',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: '#fff',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid #F5ECD8',
  },
  detailLabel: {
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    color: '#888',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '14px',
    color: '#2C2C2C',
    fontWeight: '500',
  },
  btnRow: {
    display: 'flex',
    gap: '16px',
  },
  cartBtn: {
    flex: 1,
    background: 'transparent',
    border: '1px solid #6B1B2A',
    color: '#6B1B2A',
    padding: '16px',
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    letterSpacing: '2px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.3s',
  },
  buyBtn: {
    flex: 1,
    background: '#6B1B2A',
    border: '1px solid #6B1B2A',
    color: '#C9A84C',
    padding: '16px',
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    letterSpacing: '2px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.3s',
  },
  note: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '12px',
    color: '#aaa',
    letterSpacing: '1px',
  },
  reviewsSection: {
    marginTop: '80px',
    textAlign: 'center',
  },
  reviewsTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '24px',
    color: '#6B1B2A',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  reviewsDivider: {
    width: '60px',
    height: '2px',
    background: 'linear-gradient(to right, transparent, #C9A84C, transparent)',
    margin: '16px auto 40px',
  },
  reviewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    textAlign: 'left',
  },
  reviewCard: {
    background: '#fff',
    border: '1px solid #F5ECD8',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  reviewTop: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#6B1B2A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Cinzel, serif',
    fontSize: '16px',
    color: '#C9A84C',
    flexShrink: 0,
  },
  reviewName: {
    fontFamily: 'Cinzel, serif',
    fontSize: '13px',
    color: '#6B1B2A',
    letterSpacing: '1px',
  },
  reviewStars: {
    color: '#C9A84C',
    fontSize: '14px',
  },
  reviewComment: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '16px',
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
};

export default ProductDetail;