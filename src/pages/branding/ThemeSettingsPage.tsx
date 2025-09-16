import { useState } from 'react';
import { Save, Palette, Monitor, Sun, Moon, Smartphone } from 'lucide-react';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontSize: string;
  fontFamily: string;
  darkMode: boolean;
  customCSS: string;
}

export default function ThemeSettingsPage() {
  const [settings, setSettings] = useState<ThemeSettings>({
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    accentColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    borderRadius: '8',
    fontSize: '14',
    fontFamily: 'Inter',
    darkMode: false,
    customCSS: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const colorPresets = [
    { name: 'Blue', primary: '#3B82F6', secondary: '#6B7280', accent: '#10B981' },
    { name: 'Purple', primary: '#8B5CF6', secondary: '#6B7280', accent: '#F59E0B' },
    { name: 'Green', primary: '#10B981', secondary: '#6B7280', accent: '#EF4444' },
    { name: 'Red', primary: '#EF4444', secondary: '#6B7280', accent: '#3B82F6' },
    { name: 'Orange', primary: '#F97316', secondary: '#6B7280', accent: '#8B5CF6' }
  ];

  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro'
  ];

  const handleColorChange = (field: keyof ThemeSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save theme settings
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Apply theme to document root
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
      document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    } catch (error) {
      console.error('Failed to save theme settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewClass = () => {
    switch (previewMode) {
      case 'tablet': return 'max-w-md';
      case 'mobile': return 'max-w-sm';
      default: return 'max-w-4xl';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Theme Settings</h1>
          <p className="text-gray-600">Customize the look and feel of your application</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Theme
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Color Presets */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Color Presets</h3>
            <div className="grid grid-cols-1 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <span className="text-sm font-medium">{preset.name}</span>
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }}></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Colors</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Typography</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => handleColorChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Font Size</label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleColorChange('fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="12">12px - Small</option>
                  <option value="14">14px - Default</option>
                  <option value="16">16px - Large</option>
                  <option value="18">18px - Extra Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                <select
                  value={settings.borderRadius}
                  onChange={(e) => handleColorChange('borderRadius', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="0">None</option>
                  <option value="4">4px - Small</option>
                  <option value="8">8px - Default</option>
                  <option value="12">12px - Large</option>
                  <option value="16">16px - Extra Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dark Mode */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Display Mode</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {settings.darkMode ? <Moon className="h-5 w-5 mr-2" /> : <Sun className="h-5 w-5 mr-2" />}
                <span className="text-sm font-medium">
                  {settings.darkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                onClick={() => handleColorChange('darkMode', !settings.darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.darkMode ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div 
                className={`mx-auto bg-white rounded-lg shadow-sm p-6 ${getPreviewClass()}`}
                style={{ 
                  fontFamily: settings.fontFamily,
                  fontSize: `${settings.fontSize}px`,
                  borderRadius: `${settings.borderRadius}px`
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold" style={{ color: settings.textColor }}>
                      Dashboard Preview
                    </h2>
                    <div 
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ 
                        backgroundColor: settings.primaryColor,
                        borderRadius: `${settings.borderRadius}px`
                      }}
                    >
                      Primary Button
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="p-4 rounded"
                      style={{ 
                        backgroundColor: settings.backgroundColor,
                        border: `1px solid ${settings.secondaryColor}`,
                        borderRadius: `${settings.borderRadius}px`
                      }}
                    >
                      <h3 className="font-medium" style={{ color: settings.textColor }}>Card Title</h3>
                      <p className="text-sm mt-1" style={{ color: settings.secondaryColor }}>
                        Sample card content with secondary text color.
                      </p>
                    </div>

                    <div 
                      className="p-4 rounded"
                      style={{ 
                        backgroundColor: settings.accentColor + '20',
                        border: `1px solid ${settings.accentColor}`,
                        borderRadius: `${settings.borderRadius}px`
                      }}
                    >
                      <h3 className="font-medium" style={{ color: settings.accentColor }}>Accent Card</h3>
                      <p className="text-sm mt-1" style={{ color: settings.textColor }}>
                        Card with accent color scheme.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      className="px-4 py-2 rounded text-white"
                      style={{ 
                        backgroundColor: settings.primaryColor,
                        borderRadius: `${settings.borderRadius}px`
                      }}
                    >
                      Primary
                    </button>
                    <button 
                      className="px-4 py-2 rounded border"
                      style={{ 
                        borderColor: settings.secondaryColor,
                        color: settings.secondaryColor,
                        borderRadius: `${settings.borderRadius}px`
                      }}
                    >
                      Secondary
                    </button>
                    <button 
                      className="px-4 py-2 rounded text-white"
                      style={{ 
                        backgroundColor: settings.accentColor,
                        borderRadius: `${settings.borderRadius}px`
                      }}
                    >
                      Accent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}