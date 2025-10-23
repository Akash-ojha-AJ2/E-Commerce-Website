import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../store/Context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaCamera, FaArrowLeft } from 'react-icons/fa';

const EditProfile = () => {
  const { user, setUser, backend } = useContext(Context);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    sex: 'other',
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Pre-fill form with existing user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        address: user.address || '',
        sex: user.sex || 'other',
      });
      setPreview(user.profile || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('address', formData.address);
      data.append('sex', formData.sex);
      if (file) data.append('profile', file);

      const response = await fetch(`${backend}/api/v1/user/update`, {
        method: 'PUT',
        credentials: 'include',
        body: data,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      toast.success('Profile updated successfully!');
      setUser(result.user);
      navigate('/profile');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Gradient */}

       

        <div style={styles.card}>
          {/* Profile Image Section */}
          <div style={styles.imageSection}>
            <div style={styles.avatarContainer}>
              <img
                src={preview}
                alt="Profile Preview"
                style={styles.avatar}
              />
              <label style={styles.cameraButton}>
                <FaCamera style={styles.cameraIcon} />
                <input
                  type="file"
                  style={styles.fileInput}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p style={styles.imageHint}>Click camera icon to change photo</p>
          </div>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div style={styles.formGrid}>
              
              {/* Name Field */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaUser style={styles.labelIcon} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field (Read-only) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaEnvelope style={styles.labelIcon} />
                  Email Address
                </label>
                <input
                  type="email"
                  style={styles.readOnlyInput}
                  value={user.email}
                  readOnly
                />
              </div>

              {/* Phone Field (Read-only) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaPhone style={styles.labelIcon} />
                  Phone Number
                </label>
                <input
                  type="text"
                  style={styles.readOnlyInput}
                  value={user.phone}
                  readOnly
                />
              </div>

              {/* Gender Field */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FaVenusMars style={styles.labelIcon} />
                  Gender
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Address Field */}
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>
                  <FaMapMarkerAlt style={styles.labelIcon} />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter your complete address"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                style={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={isLoading ? styles.submitButtonDisabled : styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div style={styles.buttonSpinner}></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
   
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    position: 'relative',
   
    padding: '20px',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '300px',
 
    zIndex: 1,
  },
  mainContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '30px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
  },
  backIcon: {
    fontSize: '14px',
  },
  headerContent: {
    textAlign: 'center',
    marginTop: '20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '8px',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  imageSection: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  avatarContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '10px',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #667eea',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    cursor: 'pointer',
    border: '3px solid white',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
  },
  cameraIcon: {
    fontSize: '14px',
  },
  fileInput: {
    display: 'none',
  },
  imageHint: {
    color: '#718096',
    fontSize: '0.9rem',
    margin: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px',
    marginBottom: '40px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
  },
  labelIcon: {
    color: '#667eea',
    fontSize: '14px',
  },
  input: {
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    background: 'white',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  readOnlyInput: {
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    background: '#f8fafc',
    color: '#718096',
    cursor: 'not-allowed',
  },
  select: {
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    background: 'white',
    transition: 'all 0.3s ease',
    outline: 'none',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '14px 30px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    background: 'white',
    color: '#4a5568',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  submitButton: {
    padding: '14px 30px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  submitButtonDisabled: {
    padding: '14px 30px',
    border: 'none',
    borderRadius: '12px',
    background: '#a0aec0',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: 0.7,
  },
  buttonSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRight: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#666',
    fontSize: '1.1rem',
  },
};

// Add keyframes for spinner animation
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default EditProfile;