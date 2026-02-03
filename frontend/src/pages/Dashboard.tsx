import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useSecurityStore } from '../stores/securityStore';
import { useAuthStore } from '../stores/authStore';
import ScoreRing from '../components/ScoreRing';
import AlertCard from '../components/AlertCard';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { score, alerts, actions, assets, fetchScore, fetchAlerts, fetchActions, fetchAssets } =
    useSecurityStore();

  useEffect(() => {
    fetchScore();
    fetchAlerts();
    fetchActions();
    fetchAssets();
  }, [fetchScore, fetchAlerts, fetchActions, fetchAssets]);

  const unreadAlerts = alerts.filter((a) => !a.isRead);
  const pendingActions = actions.pending || [];
  const recentAlerts = alerts.slice(0, 3);

  const trendIcon =
    score?.trend === 'up' ? TrendingUp : score?.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    score?.trend === 'up'
      ? 'text-aegis-success'
      : score?.trend === 'down'
      ? 'text-aegis-danger'
      : 'text-gray-400';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.username || 'Sentinel'}
          </h1>
          <p className="text-gray-400 mt-1">Here's your security overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-info capitalize">{user?.rank || 'novice'}</span>
          <span className="text-sm text-gray-400">{user?.xp || 0} XP</span>
        </div>
      </div>

      {/* Score and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Score */}
        <div className="card lg:col-span-1 flex flex-col items-center justify-center py-8">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Security Score</h2>
          <ScoreRing score={score?.overall || 0} size="lg" />
          {score && (
            <div className={`flex items-center gap-1 mt-4 ${trendColor}`}>
              {trendIcon && <trendIcon className="w-4 h-4" />}
              <span className="text-sm">
                {score.trendPercentage > 0 ? '+' : ''}
                {score.trendPercentage}% this week
              </span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Shield}
            label="Monitored Assets"
            value={assets.length}
            color="text-aegis-primary"
          />
          <StatCard
            icon={Bell}
            label="Unread Alerts"
            value={unreadAlerts.length}
            color={unreadAlerts.length > 0 ? 'text-aegis-warning' : 'text-aegis-success'}
          />
          <StatCard
            icon={AlertTriangle}
            label="Pending Actions"
            value={pendingActions.length}
            color={pendingActions.length > 0 ? 'text-aegis-danger' : 'text-aegis-success'}
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={actions.completed?.length || 0}
            color="text-aegis-success"
          />
        </div>
      </div>

      {/* Score Breakdown */}
      {score?.breakdown && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Score Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(score.breakdown).map(([key, component]) => (
              <div key={key} className="p-4 bg-aegis-dark rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 capitalize">{key}</span>
                  <span className="text-lg font-bold" style={{ color: getScoreColor(component.score) }}>
                    {component.score}
                  </span>
                </div>
                <div className="h-2 bg-aegis-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${component.score}%`,
                      backgroundColor: getScoreColor(component.score),
                    }}
                  />
                </div>
                {component.issues.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2 truncate" title={component.issues[0]}>
                    {component.issues[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Alerts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
            <Link to="/alerts" className="text-sm text-aegis-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentAlerts.length > 0 ? (
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No alerts - you're in good shape!</p>
            </div>
          )}
        </div>

        {/* Pending Actions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Pending Actions</h2>
            <span className="badge badge-warning">{pendingActions.length} pending</span>
          </div>
          {pendingActions.length > 0 ? (
            <div className="space-y-3">
              {pendingActions.slice(0, 5).map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-3 p-3 bg-aegis-dark rounded-lg"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      action.priority === 'urgent'
                        ? 'bg-aegis-critical/20'
                        : action.priority === 'high'
                        ? 'bg-aegis-danger/20'
                        : 'bg-aegis-warning/20'
                    }`}
                  >
                    <Zap
                      className={`w-4 h-4 ${
                        action.priority === 'urgent'
                          ? 'text-aegis-critical'
                          : action.priority === 'high'
                          ? 'text-aegis-danger'
                          : 'text-aegis-warning'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.estimatedTime}</p>
                  </div>
                  <span className="badge badge-info text-xs">+{action.xpReward} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>All actions completed!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center py-6">
      <Icon className={`w-8 h-8 ${color} mb-2`} />
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs text-gray-400 text-center">{label}</span>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}
