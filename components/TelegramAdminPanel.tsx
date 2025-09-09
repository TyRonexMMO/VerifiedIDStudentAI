import React, { useState, useEffect } from 'react';
import { telegramService, GroupMember } from '../services/telegramService';

interface TelegramAdminPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TelegramAdminPanel: React.FC<TelegramAdminPanelProps> = ({ isVisible, onClose }) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [configStatus, setConfigStatus] = useState<any>(null);

  useEffect(() => {
    if (isVisible) {
      loadMembers();
      checkConfig();
    }
  }, [isVisible]);

  const loadMembers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await telegramService.getGroupMembers();
      if (response.success && response.members) {
        setMembers(response.members);
      } else {
        setError(response.message || 'Failed to load group members');
      }
    } catch (error) {
      setError('Error loading group members');
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = async () => {
    try {
      const response = await fetch('/api/telegram/validate-config');
      const config = await response.json();
      setConfigStatus(config);
    } catch (error) {
      console.error('Error checking config:', error);
    }
  };

  const formatUserName = (member: GroupMember) => {
    const user = member.user;
    if (user.username) {
      return `@${user.username}`;
    }
    return `${user.first_name} ${user.last_name || ''}`.trim();
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      creator: 'bg-purple-100 text-purple-800',
      administrator: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
      restricted: 'bg-yellow-100 text-yellow-800',
      left: 'bg-red-100 text-red-800',
      kicked: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Telegram Administration</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Configuration Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Configuration Status</h3>
            {configStatus ? (
              <div className={`p-4 rounded-lg ${
                configStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    configStatus.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`font-medium ${
                    configStatus.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {configStatus.success ? 'Configuration Valid' : 'Configuration Error'}
                  </span>
                </div>
                {configStatus.message && (
                  <p className={`mt-2 text-sm ${
                    configStatus.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {configStatus.message}
                  </p>
                )}
                {configStatus.botInfo && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p><strong>Bot:</strong> @{configStatus.botInfo.username} ({configStatus.botInfo.first_name})</p>
                  </div>
                )}
                {configStatus.chatInfo && (
                  <div className="mt-1 text-sm text-gray-600">
                    <p><strong>Group:</strong> {configStatus.chatInfo.title} ({configStatus.chatInfo.type})</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
            )}
          </div>

          {/* Group Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Group Members</h3>
              <button
                onClick={loadMembers}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-16 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : members.length > 0 ? (
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {member.user.first_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatUserName(member)}
                          </p>
                          <p className="text-sm text-gray-600">
                            ID: {member.user.id}
                            {member.user.is_bot && (
                              <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">BOT</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(member.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">No members found or unable to fetch member list</p>
                <p className="text-xs text-gray-400 mt-1">
                  For large groups, only administrators may be visible
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Users must be members of your Telegram group to access the application</li>
              <li>• The bot verifies membership when users try to log in</li>
              <li>• Only group members with active status can authenticate</li>
              <li>• Remove users from the group to revoke their access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};