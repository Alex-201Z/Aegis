import { useEffect, useState } from 'react';
import {
  MonitorSmartphone,
  Plus,
  Mail,
  User,
  Phone,
  Globe,
  Trash2,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader,
} from 'lucide-react';
import { useSecurityStore } from '../stores/securityStore';
import type { MonitoredAsset } from '@aegis/shared';

const assetTypeIcons = {
  email: Mail,
  username: User,
  phone: Phone,
  domain: Globe,
};

const statusConfig = {
  safe: { color: 'text-aegis-success', bg: 'bg-aegis-success/10', icon: CheckCircle },
  at_risk: { color: 'text-aegis-warning', bg: 'bg-aegis-warning/10', icon: AlertTriangle },
  breached: { color: 'text-aegis-danger', bg: 'bg-aegis-danger/10', icon: AlertTriangle },
  checking: { color: 'text-aegis-primary', bg: 'bg-aegis-primary/10', icon: Loader },
};

export default function Assets() {
  const { assets, fetchAssets, addAsset, deleteAsset, isLoading, error } = useSecurityStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ type: 'email', value: '', label: '' });
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!newAsset.value.trim()) {
      setAddError('Value is required');
      return;
    }

    try {
      await addAsset(newAsset.type, newAsset.value.trim(), newAsset.label.trim() || undefined);
      setShowAddModal(false);
      setNewAsset({ type: 'email', value: '', label: '' });
    } catch (err: any) {
      setAddError(err.response?.data?.error?.message || 'Failed to add asset');
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('Are you sure you want to stop monitoring this asset?')) {
      await deleteAsset(assetId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MonitorSmartphone className="w-7 h-7 text-aegis-primary" />
            Monitored Assets
          </h1>
          <p className="text-gray-400 mt-1">
            Track your emails, usernames, and domains for breaches
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Assets"
          value={assets.length}
          icon={MonitorSmartphone}
          color="text-aegis-primary"
        />
        <StatCard
          label="Safe"
          value={assets.filter((a) => a.status === 'safe').length}
          icon={CheckCircle}
          color="text-aegis-success"
        />
        <StatCard
          label="At Risk"
          value={assets.filter((a) => a.status === 'at_risk').length}
          icon={AlertTriangle}
          color="text-aegis-warning"
        />
        <StatCard
          label="Breached"
          value={assets.filter((a) => a.status === 'breached').length}
          icon={AlertTriangle}
          color="text-aegis-danger"
        />
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} onDelete={() => handleDeleteAsset(asset.id)} />
        ))}

        {assets.length === 0 && (
          <div className="col-span-full card text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No assets monitored yet</h3>
            <p className="text-gray-400 mb-4">
              Add your email addresses to start monitoring for data breaches
            </p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Asset
            </button>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-md animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-4">Add New Asset</h2>

            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Asset Type
                </label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  className="input"
                >
                  <option value="email">Email Address</option>
                  <option value="username">Username</option>
                  <option value="phone">Phone Number</option>
                  <option value="domain">Domain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {newAsset.type === 'email'
                    ? 'Email Address'
                    : newAsset.type === 'username'
                    ? 'Username'
                    : newAsset.type === 'phone'
                    ? 'Phone Number'
                    : 'Domain'}
                </label>
                <input
                  type={newAsset.type === 'email' ? 'email' : 'text'}
                  value={newAsset.value}
                  onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                  placeholder={
                    newAsset.type === 'email'
                      ? 'your@email.com'
                      : newAsset.type === 'username'
                      ? 'your_username'
                      : newAsset.type === 'phone'
                      ? '+1234567890'
                      : 'example.com'
                  }
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={newAsset.label}
                  onChange={(e) => setNewAsset({ ...newAsset, label: e.target.value })}
                  placeholder="Personal email, Work account, etc."
                  className="input"
                />
              </div>

              {addError && (
                <p className="text-sm text-aegis-danger">{addError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AssetCard({ asset, onDelete }: { asset: MonitoredAsset; onDelete: () => void }) {
  const Icon = assetTypeIcons[asset.type] || MonitorSmartphone;
  const status = statusConfig[asset.status];
  const StatusIcon = status.icon;

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${status.bg}`}>
          <Icon className={`w-5 h-5 ${status.color}`} />
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon
            className={`w-4 h-4 ${status.color} ${
              asset.status === 'checking' ? 'animate-spin' : ''
            }`}
          />
          <span className={`text-xs font-medium ${status.color} capitalize`}>
            {asset.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <h3 className="text-white font-medium truncate" title={asset.value}>
        {asset.value}
      </h3>
      {asset.label && <p className="text-sm text-gray-400">{asset.label}</p>}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-aegis-border">
        <div className="text-xs text-gray-500">
          {asset.breachCount > 0 ? (
            <span className="text-aegis-danger">
              Found in {asset.breachCount} breach{asset.breachCount > 1 ? 'es' : ''}
            </span>
          ) : (
            <span>No breaches found</span>
          )}
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-aegis-danger transition-colors"
          title="Remove asset"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: 'currentColor' }}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
