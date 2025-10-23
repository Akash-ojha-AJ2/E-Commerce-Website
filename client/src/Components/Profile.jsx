import React, { useContext } from 'react';
import { Context } from '../store/Context';
import { Link } from 'react-router-dom';
import defaultAvatar from '../assets/image1.jpg';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaEdit } from 'react-icons/fa';

const Profile = () => {
  const { user } = useContext(Context);

  if (!user) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          {/* Simple Profile Card - Aapki image ke anusaar */}
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              
              {/* Name and Image Section - As requested (Name Left, Image Right) */}
              <div className="row align-items-center mb-4">
                <div className="col-md-8">
                  <h4 className="fw-bold mb-1">{user.name}</h4>
                  <p className="text-muted mb-0">Welcome to your personal space</p>
                  <Link 
                    to="/edit-profile" 
                    className="btn btn-outline-primary btn-sm mt-3"
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </Link>
                </div>
                <div className="col-md-4 text-center text-md-end">
                  <img
                    src={user.profile || defaultAvatar}
                    alt="Profile"
                    className="img-fluid rounded-circle border"
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover',
                      borderColor: '#667eea !important'
                    }}
                  />
                </div>
              </div>

              {/* Horizontal Line */}
              <hr className="mb-4" />

              {/* Personal Information Section */}
              <div className="mb-4">
                <h6 className="fw-semibold mb-3" style={{ color: '#667eea' }}>
                  <FaUser className="me-2" />
                  Personal Information
                </h6>
                
                {/* Information in simple list format */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start p-3 border rounded-2">
                      <FaUser className="text-primary mt-1 me-3" />
                      <div>
                        <small className="text-muted d-block">Full Name</small>
                        <span className="fw-medium">{user.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start p-3 border rounded-2">
                      <FaEnvelope className="text-success mt-1 me-3" />
                      <div>
                        <small className="text-muted d-block">Email Address</small>
                        <span className="fw-medium">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start p-3 border rounded-2">
                      <FaPhone className="text-warning mt-1 me-3" />
                      <div>
                        <small className="text-muted d-block">Phone Number</small>
                        <span className="fw-medium">{user.phone || 'Not Provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start p-3 border rounded-2">
                      <FaVenusMars className="text-info mt-1 me-3" />
                      <div>
                        <small className="text-muted d-block">Gender</small>
                        <span className="fw-medium">{user.sex || 'Not Specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-start p-3 border rounded-2">
                      <FaMapMarkerAlt className="text-danger mt-1 me-3" />
                      <div>
                        <small className="text-muted d-block">Address</small>
                        <span className="fw-medium">{user.address || 'No address provided yet'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          background: #fff;
        }
        
        .border {
          border-color: #dee2e6 !important;
        }
        
        .btn-outline-primary {
          border-color: #667eea;
          color: #667eea;
        }
        
        .btn-outline-primary:hover {
          background-color: #667eea;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Profile;