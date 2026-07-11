import React, { useState } from 'react';
import { changePassword, getApiErrorMessage } from '../services/authService';

const ChangePasswordForm = ({ onSuccess, onCancel, compact = false }) => {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.newPassword.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    try {
      setSaving(true);
      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password berhasil diubah.');
      onSuccess?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mengubah password.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Password Lama</span>
        <input
          type="password"
          required
          value={form.oldPassword}
          onChange={(e) => update('oldPassword', e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Password Baru</span>
        <input
          type="password"
          required
          value={form.newPassword}
          onChange={(e) => update('newPassword', e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Konfirmasi Password Baru</span>
        <input
          type="password"
          required
          value={form.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <div className={`flex ${onCancel ? 'justify-end gap-2' : 'flex-col sm:flex-row'}`}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className={`px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors ${onCancel ? '' : 'w-full sm:w-auto'}`}
        >
          {saving ? 'Menyimpan...' : 'Simpan Password'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
