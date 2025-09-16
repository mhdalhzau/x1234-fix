import { Github, Mail, Chrome } from 'lucide-react';

interface SocialLoginProps {
  disabled?: boolean;
}

export default function SocialLogin({ disabled = false }: SocialLoginProps) {
  const handleSocialLogin = async (provider: string) => {
    if (disabled) return;
    
    try {
      // TODO: Implement social login redirect
      window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    }
  };

  const socialProviders = [
    {
      name: 'Google',
      icon: Chrome,
      provider: 'google',
      bgColor: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-white'
    },
    {
      name: 'GitHub',
      icon: Github,
      provider: 'github',
      bgColor: 'bg-gray-900 hover:bg-gray-800',
      textColor: 'text-white'
    },
    {
      name: 'Microsoft',
      icon: Mail,
      provider: 'microsoft',
      bgColor: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {socialProviders.map((social) => {
          const IconComponent = social.icon;
          return (
            <button
              key={social.provider}
              onClick={() => handleSocialLogin(social.provider)}
              disabled={disabled}
              className={`w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${social.bgColor} ${social.textColor} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              <IconComponent className="h-5 w-5 mr-2" />
              Continue with {social.name}
            </button>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-primary-600 hover:text-primary-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary-600 hover:text-primary-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}