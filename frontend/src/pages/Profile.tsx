import { useEffect, useState } from 'react';
import {
  User,
  Shield,
  Award,
  TrendingUp,
  Settings,
  Bell,
  Eye,
  Palette,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSecurityStore } from '../stores/securityStore';
import ScoreRing from '../components/ScoreRing';
import { RANKS } from '@aegis/shared';

const rankColors: Record<string, string> = {
  novice: '#6B7280',
  defender: '#10B981',
  guardian: '#3B82F6',
  sentinel: '#8B5CF6',
  architect: '#F59E0B',
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { score, fetchScore, alerts, fetchAlerts, actions, fetchActions } = useSecurityStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  useEffect(() => {
    fetchScore();
    fetchAlerts();
    fetchActions();
  }, [fetchScore, fetchAlerts, fetchActions]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentRank = user?.rank || 'novice';
  const rankInfo = RANKS[currentRank as keyof typeof RANKS];
  const xpProgress = user?.xp || 0;
  const xpForNextRank = rankInfo.maxXp === Infinity ? xpProgress : rankInfo.maxXp;
  const xpPercentage = Math.min(100, ((xpProgress - rankInfo.minXp) / (xpForNextRank - rankInfo.minXp)) * 100);

  const stats = [
    { label: 'Alerts Resolved', value: alerts.filter((a) => a.isResolved).length },
    { label: 'Actions Completed', value: actions.completed?.length || 0 },
    { label: 'Days Active', value: Math.floor((Date.now() - new Date(user?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) || 1 },
    { label: 'Current Streak', value: 1 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{ backgroundColor: `${rankColors[currentRank]}20`, color: rankColors[currentRank] }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h1 className="text-xl font-bold text-white mt-3">{user?.username}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>

          {/* Rank & XP */}
          <div className="flex-1 w-full md:w-auto">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" style={{ color: rankColors[currentRank] }} />
              <span className="font-semibold text-white capitalize">{currentRank}</span>
              {user?.isPremium && (
                <span className="badge bg-aegis-warning/20 text-aegis-warning">Premium</span>
              )}
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{xpProgress} XP</span>
                <span className="text-gray-500">
                  {xpForNextRank === xpProgress ? 'Max Rank' : `${xpForNextRank} XP`}
                </span>
              </div>
              <div className="h-3 bg-aegis-dark rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${xpPercentage}%`,
                    backgroundColor: rankColors[currentRank],
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {xpForNextRank === xpProgress
                ? 'You have reached the highest rank!'
                : `${xpForNextRank - xpProgress} XP to next rank`}
            </p>
          </div>

          {/* Security Score */}
          <div className="flex flex-col items-center">
            <ScoreRing score={score?.overall || 0} size="md" />
            <p className="text-sm text-gray-400 mt-2">Security Score</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-aegis-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'text-aegis-primary border-aegis-primary'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'settings'
              ? 'text-aegis-primary border-aegis-primary'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Settings
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="card text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Rank Progression */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Rank Progression</h2>
            <div className="flex items-center justify-between gap-2">
              {Object.entries(RANKS).map(([rank, info], index) => {
                const isCurrentOrPast = Object.keys(RANKS).indexOf(currentRank) >= index;
                const isCurrent = rank === currentRank;

                return (
                  <div key={rank} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all ${
                        isCurrent
                          ? 'ring-2 ring-offset-2 ring-offset-aegis-card'
                          : ''
                      }`}
                      style={{
                        backgroundColor: isCurrentOrPast ? `${info.color}30` : '#1f2937',
                        color: isCurrentOrPast ? info.color : '#6B7280',
                        ringColor: isCurrent ? info.color : undefined,
                      }}
                    >
                      <Shield className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-medium capitalize ${
                        isCurrentOrPast ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {rank}
                    </span>
                    <span className="text-xs text-gray-500">{info.minXp}+ XP</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Notification Settings */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-aegis-primary" />
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
            </div>
            <div className="space-y-3">
              <SettingToggle label="Email alerts for breaches" defaultChecked />
              <SettingToggle label="Push notifications" defaultChecked />
              <SettingToggle label="Weekly security report" defaultChecked />
              <SettingToggle label="Action reminders" defaultChecked />
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-aegis-primary" />
              <h2 className="text-lg font-semibold text-white">Privacy</h2>
            </div>
            <div className="space-y-3">
              <SettingToggle label="Share anonymous usage statistics" />
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300">Data retention period</span>
                <select className="input w-auto">
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                  <option>Forever</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-aegis-primary" />
              <h2 className="text-lg font-semibold text-white">Appearance</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300">Theme</span>
                <select className="input w-auto">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300">Language</span>
                <select className="input w-auto">
                  <option>English</option>
                  <option>Francais</option>
                </select>
              </div>
              <SettingToggle label="Compact mode" />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-aegis-danger/30">
            <h2 className="text-lg font-semibold text-aegis-danger mb-4">Danger Zone</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="btn-secondary flex-1">Export My Data</button>
              <button onClick={handleLogout} className="btn-danger flex-1">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingToggle({
  label,
  defaultChecked = false,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-300">{label}</span>
      <button
        onClick={() => setChecked(!checked)}
        className={`w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-aegis-primary' : 'bg-aegis-border'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
