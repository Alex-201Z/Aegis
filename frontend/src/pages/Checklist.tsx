import { useEffect, useState } from 'react';
import {
  CheckSquare,
  Shield,
  Lock,
  Smartphone,
  User,
  Eye,
  Database,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useSecurityStore } from '../stores/securityStore';
import type { ChecklistCategory, ChecklistItem } from '@aegis/shared';

const categoryConfig: Record<
  ChecklistCategory,
  { icon: React.ElementType; label: string; color: string }
> = {
  passwords: { icon: Lock, label: 'Passwords', color: 'text-aegis-primary' },
  authentication: { icon: Shield, label: 'Authentication', color: 'text-aegis-secondary' },
  devices: { icon: Smartphone, label: 'Devices', color: 'text-aegis-accent' },
  accounts: { icon: User, label: 'Accounts', color: 'text-aegis-success' },
  privacy: { icon: Eye, label: 'Privacy', color: 'text-aegis-warning' },
  backup: { icon: Database, label: 'Backup', color: 'text-aegis-danger' },
};

export default function Checklist() {
  const { checklist, fetchChecklist, toggleChecklistItem } = useSecurityStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['passwords', 'authentication']));

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const groupedItems = checklist?.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>) || {};

  const completionPercentage = checklist
    ? Math.round((checklist.completedCount / checklist.totalCount) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-aegis-primary" />
            Security Checklist
          </h1>
          <p className="text-gray-400 mt-1">
            Complete these tasks to improve your security posture
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Overall Progress</h2>
            <p className="text-sm text-gray-400">
              {checklist?.completedCount || 0} of {checklist?.totalCount || 0} tasks completed
            </p>
          </div>
          <div className="text-3xl font-bold text-aegis-primary">{completionPercentage}%</div>
        </div>
        <div className="h-3 bg-aegis-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-aegis-primary to-aegis-secondary rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(categoryConfig).map(([category, config]) => {
          const items = groupedItems[category] || [];
          const completed = items.filter((i) => i.isCompleted).length;
          const total = items.length;
          const Icon = config.icon;

          return (
            <div key={category} className="card text-center">
              <Icon className={`w-8 h-8 mx-auto mb-2 ${config.color}`} />
              <p className="text-sm font-medium text-white">{config.label}</p>
              <p className="text-xs text-gray-400">
                {completed}/{total}
              </p>
            </div>
          );
        })}
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, items]) => {
          const config = categoryConfig[category as ChecklistCategory];
          const isExpanded = expandedCategories.has(category);
          const completed = items.filter((i) => i.isCompleted).length;
          const Icon = config.icon;

          return (
            <div key={category} className="card">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-opacity-20`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">{config.label}</h3>
                    <p className="text-sm text-gray-400">
                      {completed} of {items.length} completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-aegis-dark rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        completed === items.length ? 'bg-aegis-success' : 'bg-aegis-primary'
                      }`}
                      style={{ width: `${(completed / items.length) * 100}%` }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-2 pt-4 border-t border-aegis-border">
                  {items.map((item) => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => toggleChecklistItem(item.id, !item.isCompleted)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChecklistItemRow({
  item,
  onToggle,
}: {
  item: ChecklistItem;
  onToggle: () => void;
}) {
  const importanceColors = {
    essential: 'text-aegis-danger',
    recommended: 'text-aegis-warning',
    advanced: 'text-gray-400',
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
        item.isCompleted ? 'bg-aegis-success/5' : 'bg-aegis-dark hover:bg-aegis-border/50'
      }`}
      onClick={onToggle}
    >
      <button className="mt-0.5 flex-shrink-0">
        {item.isCompleted ? (
          <CheckCircle className="w-5 h-5 text-aegis-success" />
        ) : (
          <Circle className="w-5 h-5 text-gray-500" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium ${
            item.isCompleted ? 'text-gray-400 line-through' : 'text-white'
          }`}
        >
          {item.title}
        </p>
        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
      </div>
      <span
        className={`text-xs font-medium ${importanceColors[item.importance]} capitalize flex-shrink-0`}
      >
        {item.importance}
      </span>
    </div>
  );
}
