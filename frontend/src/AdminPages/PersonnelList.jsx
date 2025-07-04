import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ADMIN_PATH } from '../constant';
import { FaTrash, FaEdit } from 'react-icons/fa';

const PersonnelList = () => {
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [salesPartners, setSalesPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingPartner, setEditingPartner] = useState(null);
  const [editType, setEditType] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const [deletingPartner, setDeletingPartner] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const [deliveryRes, salesRes] = await Promise.all([
        axios.get(`${ADMIN_PATH}/get-del-partner`),
        axios.get(`${ADMIN_PATH}/get-sales-partner`),
      ]);
      setDeliveryPartners(deliveryRes.data);
      setSalesPartners(salesRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch personnel data.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (partner, type) => {
    setEditingPartner(partner);
    setEditType(type);
    setFormData({ name: partner.name, phone: partner.phone });
  };

  const handleDeleteClick = (partner, type) => {
    setDeletingPartner(partner);
    setDeleteType(type);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const endpoint = editType === 'delivery' ? 'delivery/update' : 'sales/update';
      await axios.put(`${ADMIN_PATH}/${endpoint}`, {
        id: editingPartner.id,
        ...formData,
      });
      if (editType === 'delivery') {
        setDeliveryPartners((prev) =>
          prev.map((p) => (p.id === editingPartner.id ? { ...p, ...formData } : p))
        );
      } else {
        setSalesPartners((prev) =>
          prev.map((p) => (p.id === editingPartner.id ? { ...p, ...formData } : p))
        );
      }
      setEditingPartner(null);
    } catch (err) {
      console.error('Error updating partner:', err);
      alert('Failed to update partner.');
    }
  };

  const handleDelete = async () => {
    try {
      const endpoint = deleteType === 'delivery' ? 'delivery/delete' : 'sales/delete';
      await axios.delete(`${ADMIN_PATH}/${endpoint}`, { data: { id: deletingPartner.id } });
      if (deleteType === 'delivery') {
        setDeliveryPartners((prev) => prev.filter((p) => p.id !== deletingPartner.id));
      } else {
        setSalesPartners((prev) => prev.filter((p) => p.id !== deletingPartner.id));
      }
      setDeletingPartner(null);
    } catch (err) {
      console.error('Error deleting partner:', err);
      alert('Failed to delete partner.');
    }
  };

  if (loading) return <div className="text-center py-10 text-xl font-semibold">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-600 text-xl">{error}</div>;

  const renderPartnerList = (partners, type) =>
    partners.map((partner) => (
      <li
        key={partner.id}
        className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md transition-transform hover:scale-[1.02]"
      >
        <div>
          <span className="font-medium text-sm text-gray-800">Name: {partner.name}</span>
          <br />
          <span className="font-bold text-sm text-gray-600">Phone: {partner.phone}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleEditClick(partner, type)}>
            <FaEdit className="text-blue-500 hover:text-blue-700" />
          </button>
          <button onClick={() => handleDeleteClick(partner, type)}>
            <FaTrash className="text-red-500 hover:text-red-700" />
          </button>
        </div>
      </li>
    ));

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-blue-100 to-purple-200 flex flex-col items-center">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-300">
          <h3 className="text-2xl font-bold mb-6 text-center text-blue-700">Delivery Partners</h3>
          {deliveryPartners.length === 0 ? (
            <p className="text-gray-500 text-center">No delivery partners found.</p>
          ) : (
            <ul className="space-y-4">{renderPartnerList(deliveryPartners, 'delivery')}</ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-300">
          <h3 className="text-2xl font-bold mb-6 text-center text-green-700">Sales Partners</h3>
          {salesPartners.length === 0 ? (
            <p className="text-gray-500 text-center">No sales partners found.</p>
          ) : (
            <ul className="space-y-4">{renderPartnerList(salesPartners, 'sales')}</ul>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPartner && (
        <div className="fixed inset-0 flex items-center justify-center z-50 ">
          <div className="bg-gradient-to-r from-blue-100 to-purple-200 p-8 rounded-2xl shadow-2xl w-11/12 max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Partner</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="text-sm border border-purple-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Partner Name"
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="text-sm border border-purple-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Phone Number"
              />
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditingPartner(null)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPartner && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-purple-200 p-8 rounded-2xl shadow-2xl w-11/12 max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Confirm Delete</h2>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete {deletingPartner.name}?
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingPartner(null)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelList;
