import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API, { getImageUrl } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // ── added tag: '' to initial form state
  const [form, setForm] = useState({ name: '', fabric: 'Silk', colour: '', pattern: '', price: '', stock: '', tag: '' });
  const [mainImage, setMainImage] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const [mainPreview, setMainPreview] = useState(null);
  const [extraPreviews, setExtraPreviews] = useState([]);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products');
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mainImage) { toast.error('Please select a main image'); return; }
    setAdding(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      formData.append('image', mainImage);
      extraImages.forEach(img => { if (img) formData.append('images', img); });

      await API.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Saree added successfully!');
      // ── reset includes tag
      setForm({ name: '', fabric: 'Silk', colour: '', pattern: '', price: '', stock: '', tag: '' });
      setMainImage(null);
      setExtraImages([]);
      setMainPreview(null);
      setExtraPreviews([]);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add saree');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saree?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Saree deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  // Tag label helper
  const tagLabel = (tag) => {
    if (tag === 'new_arrival') return 'New Arrival';
    if (tag === 'best_selling') return 'Best Selling';
    return null;
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.header}>
          <h2 style={styles.title}>Manage Sarees</h2>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add New Saree'}
          </button>
        </div>
        <div style={styles.divider} />

        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Add New Saree</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label>Saree Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Banarasi Silk Saree" required />
                </div>
                <div style={styles.field}>
                  <label>Fabric</label>
                  <select name="fabric" value={form.fabric} onChange={handleChange} style={styles.select}>
                    {['Silk', 'Cotton', 'Chiffon', 'Georgette', 'Linen', 'Banarasi', 'Kanjivaram', 'Other'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label>Colour</label>
                  <input name="colour" value={form.colour} onChange={handleChange} placeholder="e.g. Red" required />
                </div>
                <div style={styles.field}>
                  <label>Pattern</label>
                  <input name="pattern" value={form.pattern} onChange={handleChange} placeholder="e.g. Floral" required />
                </div>
                <div style={styles.field}>
                  <label>Price (₹)</label>
                  <input name="price" value={form.price} onChange={handleChange} placeholder="e.g. 4500" type="number" required />
                </div>
                <div style={styles.field}>
                  <label>Stock Count</label>
                  <input name="stock" value={form.stock} onChange={handleChange} placeholder="e.g. 10" type="number" required />
                </div>

                {/* ── NEW: Tag dropdown */}
                <div style={styles.field}>
                  <label>Tag (for Home Tabs)</label>
                  <select name="tag" value={form.tag} onChange={handleChange} style={styles.select}>
                    <option value="">No Tag</option>
                    <option value="new_arrival">New Arrival</option>
                    <option value="best_selling">Best Selling</option>
                  </select>
                </div>

              </div>

              {/* Main Image */}
              <div style={styles.imageSection}>
                <label style={styles.imageLabel}>Main Saree Image *</label>
                <div style={styles.uploadBox} onClick={() => document.getElementById('mainImg').click()}>
                  {mainPreview ? (
                    <img src={mainPreview} alt="preview" style={styles.previewImg} />
                  ) : (
                    <div style={styles.uploadPlaceholder}>
                      <span style={styles.uploadIcon}>📷</span>
                      <p style={styles.uploadText}>Click to upload main image</p>
                      <p style={styles.uploadSub}>JPG, PNG, WEBP (auto-resized)</p>
                    </div>
                  )}
                </div>
                <input id="mainImg" type="file" accept="image/*" onChange={handleMainImage} style={{ display: 'none' }} />
              </div>

              {/* Extra Images */}
              <div style={styles.imageSection}>
                <label style={styles.imageLabel}>Additional Style Photos (Optional — max 3)</label>
                <div style={styles.extraImagesRow}>
                  {[0, 1, 2].map(index => (
                    <div key={index} style={{ flex: 1 }}>
                      <div
                        style={styles.extraUploadBox}
                        onClick={() => document.getElementById(`extraImg${index}`).click()}
                      >
                        {extraPreviews[index] ? (
                          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <img src={extraPreviews[index]} alt={`extra ${index + 1}`} style={styles.extraPreviewImg} />
                            <button
                              style={styles.removeBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newPreviews = [...extraPreviews];
                                const newImages = [...extraImages];
                                newPreviews[index] = null;
                                newImages[index] = null;
                                setExtraPreviews(newPreviews);
                                setExtraImages(newImages);
                              }}
                            >✕</button>
                          </div>
                        ) : (
                          <div style={styles.extraPlaceholder}>
                            <span style={{ fontSize: '24px', color: '#C9A84C' }}>+</span>
                            <p style={styles.uploadSub}>Photo {index + 1}</p>
                          </div>
                        )}
                      </div>
                      <input
                        id={`extraImg${index}`}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const newPreviews = [...extraPreviews];
                          const newImages = [...extraImages];
                          newPreviews[index] = URL.createObjectURL(file);
                          newImages[index] = file;
                          setExtraPreviews(newPreviews);
                          setExtraImages(newImages);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p style={styles.extraNote}>Click each box to add a photo — all are optional</p>
              </div>

              <button type="submit" style={styles.submitBtn} disabled={adding}>
                {adding ? 'Adding Saree...' : 'Add Saree to Collection'}
              </button>
            </form>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <p style={styles.loadingText}>Loading sarees...</p>
        ) : products.length === 0 ? (
          <p style={styles.emptyText}>No sarees added yet</p>
        ) : (
          <div style={styles.grid}>
            {products.map(product => (
              <div key={product._id} style={styles.card}>
                <div style={styles.cardImgBox}>
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    style={styles.productImg}
                  />
                  {/* ── show tag badge if set */}
                  {tagLabel(product.tag) && (
                    <div style={{
                      ...styles.extraCount,
                      background: product.tag === 'new_arrival' ? 'rgba(107,27,42,0.85)' : 'rgba(201,168,76,0.95)',
                      color: product.tag === 'new_arrival' ? '#C9A84C' : '#6B1B2A',
                    }}>
                      {tagLabel(product.tag)}
                    </div>
                  )}
                  {product.images?.length > 0 && !product.tag && (
                    <div style={styles.extraCount}>
                      +{product.images.length} photos
                    </div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <p style={styles.productDetail}>{product.fabric} · {product.colour}</p>
                  <p style={styles.productPrice}>₹{product.price?.toLocaleString()}</p>
                  <p style={styles.productStock}>Stock: {product.stock}</p>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: 'Cinzel, serif', fontSize: '28px', color: '#6B1B2A', letterSpacing: '3px' },
  addBtn: {
    background: '#6B1B2A', color: '#C9A84C', border: '1px solid #C9A84C',
    padding: '12px 24px', fontFamily: 'Cinzel, serif', fontSize: '12px',
    letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase',
  },
  divider: { width: '80px', height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)', margin: '16px 0 40px' },
  formCard: { background: '#fff', border: '1px solid #F5ECD8', padding: '32px', marginBottom: '40px' },
  formTitle: { fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#6B1B2A', letterSpacing: '2px', marginBottom: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  select: { padding: '12px 16px', border: '1px solid #C9A84C', fontFamily: 'Raleway, sans-serif', fontSize: '14px', outline: 'none', background: '#fff' },
  imageSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  imageLabel: { fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#6B1B2A', letterSpacing: '2px', textTransform: 'uppercase' },
  uploadBox: {
    width: '100%', height: '300px', border: '2px dashed #C9A84C',
    cursor: 'pointer', overflow: 'hidden', display: 'flex',
    alignItems: 'center', justifyContent: 'center', background: '#FDF6EC',
  },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  uploadIcon: { fontSize: '40px' },
  uploadText: { fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#6B1B2A', letterSpacing: '1px' },
  uploadSub: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa', letterSpacing: '1px' },
  extraImagesRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  extraUploadBox: {
    height: '120px', border: '2px dashed #C9A84C', cursor: 'pointer',
    overflow: 'hidden', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#FDF6EC', minWidth: '80px',
  },
  extraPreviewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  extraPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  extraNote: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa', letterSpacing: '1px' },
  removeBtn: {
    position: 'absolute', top: '4px', right: '4px',
    background: '#6B1B2A', color: '#C9A84C', border: 'none',
    width: '24px', height: '24px', borderRadius: '50%',
    cursor: 'pointer', fontSize: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  submitBtn: {
    background: '#6B1B2A', color: '#C9A84C', border: '1px solid #C9A84C',
    padding: '16px', fontFamily: 'Cinzel, serif', fontSize: '13px',
    letterSpacing: '3px', cursor: 'pointer', textTransform: 'uppercase',
  },
  loadingText: { fontFamily: 'Cinzel, serif', color: '#6B1B2A', textAlign: 'center', padding: '40px', letterSpacing: '2px' },
  emptyText: { fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#6B1B2A', textAlign: 'center', padding: '60px', fontStyle: 'italic' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' },
  card: { background: '#fff', border: '1px solid #F5ECD8', overflow: 'hidden' },
  cardImgBox: { position: 'relative' },
  productImg: { width: '100%', height: '220px', objectFit: 'cover', display: 'block' },
  extraCount: {
    position: 'absolute', bottom: '8px', right: '8px',
    background: 'rgba(107,27,42,0.85)', color: '#C9A84C',
    padding: '4px 10px', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '1px',
  },
  cardBody: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' },
  productName: { fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#6B1B2A', letterSpacing: '1px' },
  productDetail: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#888', letterSpacing: '1px' },
  productPrice: { fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#2C2C2C' },
  productStock: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#aaa' },
  deleteBtn: {
    background: 'transparent', border: '1px solid #E74C3C', color: '#E74C3C',
    padding: '8px', fontFamily: 'Cinzel, serif', fontSize: '11px',
    letterSpacing: '1px', cursor: 'pointer', marginTop: '8px',
  },
};

export default AdminProducts;