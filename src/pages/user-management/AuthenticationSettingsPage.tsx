import { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Clock, 
  CheckCircle,
  Lock,
  Users,
  Eye,
  RefreshCw,
  XCircle
} from 'lucide-react';
import axios from 'axios';

interface AuthSettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiry: number; // days
    preventReuse: number; // last N passwords
  };
  sessionManagement: {
    sessionTimeout: number; // minutes
    maxConcurrentSessions: number;
    requireReauth: boolean;
    rememberMeEnabled: boolean;
    rememberMeDuration: number; // days
  };
  loginSecurity: {
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    enableCaptcha: boolean;
    allowedIpAddresses: string[];
    enableGeoBlocking: boolean;
    blockedCountries: string[];
  };
  twoFactorAuth: {
    enabled: boolean;
    required: boolean;
    allowedMethods: string[];
    backupCodesEnabled: boolean;
    trustedDeviceDuration: number; // days
  };
  socialAuth: {
    googleEnabled: boolean;
    githubEnabled: boolean;
    linkedinEnabled: boolean;
    microsoftEnabled: boolean;
  };
  auditLogging: {
    logLoginAttempts: boolean;
    logPasswordChanges: boolean;
    logRoleChanges: boolean;
    logSessionActivity: boolean;
    retentionPeriod: number; // days
  };
}

export default function AuthenticationSettingsPage() {
  const [settings, setSettings] = useState<AuthSettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      passwordExpiry: 90,
      preventReuse: 5
    },
    sessionManagement: {
      sessionTimeout: 480,
      maxConcurrentSessions: 3,
      requireReauth: false,
      rememberMeEnabled: true,
      rememberMeDuration: 30
    },
    loginSecurity: {
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      enableCaptcha: true,
      allowedIpAddresses: [],
      enableGeoBlocking: false,
      blockedCountries: []
    },
    twoFactorAuth: {
      enabled: true,
      required: false,
      allowedMethods: ['totp', 'sms'],
      backupCodesEnabled: true,
      trustedDeviceDuration: 30
    },
    socialAuth: {
      googleEnabled: true,
      githubEnabled: false,
      linkedinEnabled: false,
      microsoftEnabled: false
    },
    auditLogging: {
      logLoginAttempts: true,
      logPasswordChanges: true,
      logRoleChanges: true,
      logSessionActivity: true,
      retentionPeriod: 365
    }
  });
  
  const [activeTab, setActiveTab] = useState('password');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('/api/admin/auth-settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load auth settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await axios.put('/api/admin/auth-settings', settings);
      // Show success message
    } catch (error) {
      console.error('Failed to save auth settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const addIpAddress = () => {
    if (newIpAddress.trim()) {
      updateSetting('loginSecurity.allowedIpAddresses', [
        ...settings.loginSecurity.allowedIpAddresses,
        newIpAddress.trim()
      ]);
      setNewIpAddress('');
      setShowIpModal(false);
    }
  };

  const removeIpAddress = (ip: string) => {
    updateSetting('loginSecurity.allowedIpAddresses', 
      settings.loginSecurity.allowedIpAddresses.filter(addr => addr !== ip)
    );
  };

  const tabs = [
    { id: 'password', label: 'Password Policy', icon: Key },
    { id: 'session', label: 'Session Management', icon: Clock },
    { id: 'security', label: 'Login Security', icon: Shield },
    { id: 'twofactor', label: 'Two-Factor Auth', icon: Lock },
    { id: 'social', label: 'Social Auth', icon: Users },
    { id: 'audit', label: 'Audit Logging', icon: Eye }
  ];

  const ToggleSwitch = ({ checked, onChange, label, description }: any) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Authentication Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide authentication and security policies</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'password' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => updateSetting('passwordPolicy.minLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="1"
                  max="64"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicy.passwordExpiry}
                  onChange={(e) => updateSetting('passwordPolicy.passwordExpiry', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">Set to 0 to disable password expiry</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prevent Password Reuse (last N passwords)
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicy.preventReuse}
                  onChange={(e) => updateSetting('passwordPolicy.preventReuse', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="0"
                  max="20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Password Requirements</h4>
              
              <ToggleSwitch
                checked={settings.passwordPolicy.requireUppercase}
                onChange={(value: boolean) => updateSetting('passwordPolicy.requireUppercase', value)}
                label="Require Uppercase Letters"
                description="At least one uppercase letter (A-Z)"
              />

              <ToggleSwitch
                checked={settings.passwordPolicy.requireLowercase}
                onChange={(value: boolean) => updateSetting('passwordPolicy.requireLowercase', value)}
                label="Require Lowercase Letters"
                description="At least one lowercase letter (a-z)"
              />

              <ToggleSwitch
                checked={settings.passwordPolicy.requireNumbers}
                onChange={(value: boolean) => updateSetting('passwordPolicy.requireNumbers', value)}
                label="Require Numbers"
                description="At least one digit (0-9)"
              />

              <ToggleSwitch
                checked={settings.passwordPolicy.requireSpecialChars}
                onChange={(value: boolean) => updateSetting('passwordPolicy.requireSpecialChars', value)}
                label="Require Special Characters"
                description="At least one special character (!@#$%^&*)"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'session' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Session Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionManagement.sessionTimeout}
                  onChange={(e) => updateSetting('sessionManagement.sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Concurrent Sessions
                </label>
                <input
                  type="number"
                  value={settings.sessionManagement.maxConcurrentSessions}
                  onChange={(e) => updateSetting('sessionManagement.maxConcurrentSessions', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remember Me Duration (days)
                </label>
                <input
                  type="number"
                  value={settings.sessionManagement.rememberMeDuration}
                  onChange={(e) => updateSetting('sessionManagement.rememberMeDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="1"
                  max="365"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Session Options</h4>
              
              <ToggleSwitch
                checked={settings.sessionManagement.requireReauth}
                onChange={(value: boolean) => updateSetting('sessionManagement.requireReauth', value)}
                label="Require Re-authentication"
                description="Require password for sensitive operations"
              />

              <ToggleSwitch
                checked={settings.sessionManagement.rememberMeEnabled}
                onChange={(value: boolean) => updateSetting('sessionManagement.rememberMeEnabled', value)}
                label="Enable Remember Me"
                description="Allow users to stay logged in longer"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Login Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.loginSecurity.maxLoginAttempts}
                  onChange={(e) => updateSetting('loginSecurity.maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.loginSecurity.lockoutDuration}
                  onChange={(e) => updateSetting('loginSecurity.lockoutDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed IP Addresses
                </label>
                <div className="space-y-2">
                  {settings.loginSecurity.allowedIpAddresses.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm font-mono">{ip}</span>
                      <button
                        onClick={() => removeIpAddress(ip)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowIpModal(true)}
                    className="w-full px-3 py-2 border border-gray-300 border-dashed rounded-md text-sm text-gray-600 hover:text-gray-800 hover:border-gray-400"
                  >
                    + Add IP Address
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Security Options</h4>
              
              <ToggleSwitch
                checked={settings.loginSecurity.enableCaptcha}
                onChange={(value: boolean) => updateSetting('loginSecurity.enableCaptcha', value)}
                label="Enable CAPTCHA"
                description="Show CAPTCHA after failed login attempts"
              />

              <ToggleSwitch
                checked={settings.loginSecurity.enableGeoBlocking}
                onChange={(value: boolean) => updateSetting('loginSecurity.enableGeoBlocking', value)}
                label="Enable Geo-blocking"
                description="Block login attempts from specific countries"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'twofactor' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trusted Device Duration (days)
                </label>
                <input
                  type="number"
                  value={settings.twoFactorAuth.trustedDeviceDuration}
                  onChange={(e) => updateSetting('twoFactorAuth.trustedDeviceDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="1"
                  max="365"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Allowed 2FA Methods
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'totp', label: 'Authenticator App (TOTP)' },
                    { id: 'sms', label: 'SMS' },
                    { id: 'email', label: 'Email' }
                  ].map(method => (
                    <label key={method.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth.allowedMethods.includes(method.id)}
                        onChange={(e) => {
                          const methods = e.target.checked
                            ? [...settings.twoFactorAuth.allowedMethods, method.id]
                            : settings.twoFactorAuth.allowedMethods.filter(m => m !== method.id);
                          updateSetting('twoFactorAuth.allowedMethods', methods);
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">2FA Settings</h4>
              
              <ToggleSwitch
                checked={settings.twoFactorAuth.enabled}
                onChange={(value: boolean) => updateSetting('twoFactorAuth.enabled', value)}
                label="Enable Two-Factor Authentication"
                description="Allow users to set up 2FA for their accounts"
              />

              <ToggleSwitch
                checked={settings.twoFactorAuth.required}
                onChange={(value: boolean) => updateSetting('twoFactorAuth.required', value)}
                label="Require Two-Factor Authentication"
                description="Force all users to use 2FA"
              />

              <ToggleSwitch
                checked={settings.twoFactorAuth.backupCodesEnabled}
                onChange={(value: boolean) => updateSetting('twoFactorAuth.backupCodesEnabled', value)}
                label="Enable Backup Codes"
                description="Allow users to generate backup codes"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Social Authentication</h3>
          <div className="space-y-4">
            <ToggleSwitch
              checked={settings.socialAuth.googleEnabled}
              onChange={(value: boolean) => updateSetting('socialAuth.googleEnabled', value)}
              label="Google Authentication"
              description="Allow users to sign in with Google accounts"
            />

            <ToggleSwitch
              checked={settings.socialAuth.githubEnabled}
              onChange={(value: boolean) => updateSetting('socialAuth.githubEnabled', value)}
              label="GitHub Authentication"
              description="Allow users to sign in with GitHub accounts"
            />

            <ToggleSwitch
              checked={settings.socialAuth.linkedinEnabled}
              onChange={(value: boolean) => updateSetting('socialAuth.linkedinEnabled', value)}
              label="LinkedIn Authentication"
              description="Allow users to sign in with LinkedIn accounts"
            />

            <ToggleSwitch
              checked={settings.socialAuth.microsoftEnabled}
              onChange={(value: boolean) => updateSetting('socialAuth.microsoftEnabled', value)}
              label="Microsoft Authentication"
              description="Allow users to sign in with Microsoft accounts"
            />
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Logging</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Log Retention Period (days)
                </label>
                <input
                  type="number"
                  value={settings.auditLogging.retentionPeriod}
                  onChange={(e) => updateSetting('auditLogging.retentionPeriod', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Logging Options</h4>
              
              <ToggleSwitch
                checked={settings.auditLogging.logLoginAttempts}
                onChange={(value: boolean) => updateSetting('auditLogging.logLoginAttempts', value)}
                label="Log Login Attempts"
                description="Record all login attempts (successful and failed)"
              />

              <ToggleSwitch
                checked={settings.auditLogging.logPasswordChanges}
                onChange={(value: boolean) => updateSetting('auditLogging.logPasswordChanges', value)}
                label="Log Password Changes"
                description="Record when users change their passwords"
              />

              <ToggleSwitch
                checked={settings.auditLogging.logRoleChanges}
                onChange={(value: boolean) => updateSetting('auditLogging.logRoleChanges', value)}
                label="Log Role Changes"
                description="Record when user roles are modified"
              />

              <ToggleSwitch
                checked={settings.auditLogging.logSessionActivity}
                onChange={(value: boolean) => updateSetting('auditLogging.logSessionActivity', value)}
                label="Log Session Activity"
                description="Record session creation and termination"
              />
            </div>
          </div>
        </div>
      )}

      {/* IP Address Modal */}
      {showIpModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add IP Address</h3>
              <input
                type="text"
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                placeholder="192.168.1.1 or 192.168.1.0/24"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowIpModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addIpAddress}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  Add IP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}