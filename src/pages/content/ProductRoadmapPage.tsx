import { useState, useEffect } from 'react';
import { Plus, Search, ArrowUp, Calendar, Target, CheckCircle } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  votes: number;
  estimatedQuarter: string;
  createdAt: string;
  updatedAt: string;
  userHasVoted?: boolean;
}

export default function ProductRoadmapPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setFeatures([
        {
          id: '1',
          title: 'Advanced Analytics Dashboard',
          description: 'Enhanced dashboard with customizable widgets, real-time data visualization, and advanced filtering options.',
          category: 'Analytics',
          status: 'in_progress',
          priority: 'high',
          votes: 127,
          estimatedQuarter: 'Q1 2024',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-15',
          userHasVoted: false
        },
        {
          id: '2',
          title: 'Mobile App Development',
          description: 'Native mobile applications for iOS and Android with offline capabilities and push notifications.',
          category: 'Mobile',
          status: 'planned',
          priority: 'medium',
          votes: 203,
          estimatedQuarter: 'Q2 2024',
          createdAt: '2024-01-08',
          updatedAt: '2024-01-12',
          userHasVoted: true
        },
        {
          id: '3',
          title: 'AI-Powered Insights',
          description: 'Machine learning algorithms to provide predictive analytics and automated insights.',
          category: 'AI/ML',
          status: 'planned',
          priority: 'critical',
          votes: 89,
          estimatedQuarter: 'Q3 2024',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-10',
          userHasVoted: false
        },
        {
          id: '4',
          title: 'Third-party Integrations',
          description: 'Seamless integration with popular tools like Slack, Trello, Asana, and more.',
          category: 'Integrations',
          status: 'completed',
          priority: 'medium',
          votes: 156,
          estimatedQuarter: 'Q4 2023',
          createdAt: '2023-10-15',
          updatedAt: '2024-01-01',
          userHasVoted: false
        },
        {
          id: '5',
          title: 'Advanced Security Features',
          description: 'Enhanced security with SOC2 compliance, advanced audit logs, and multi-factor authentication.',
          category: 'Security',
          status: 'in_progress',
          priority: 'high',
          votes: 94,
          estimatedQuarter: 'Q1 2024',
          createdAt: '2024-01-12',
          updatedAt: '2024-01-16',
          userHasVoted: true
        },
        {
          id: '6',
          title: 'Workflow Automation',
          description: 'Visual workflow builder with conditional logic, triggers, and automated actions.',
          category: 'Automation',
          status: 'planned',
          priority: 'medium',
          votes: 78,
          estimatedQuarter: 'Q2 2024',
          createdAt: '2024-01-14',
          updatedAt: '2024-01-18',
          userHasVoted: false
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const categories = [...new Set(features.map(feature => feature.category))];
  
  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || feature.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || feature.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleVote = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? {
            ...feature,
            votes: feature.userHasVoted ? feature.votes - 1 : feature.votes + 1,
            userHasVoted: !feature.userHasVoted
          }
        : feature
    ));
  };


  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Roadmap</h1>
          <p className="text-gray-600">Track feature development and let users vote on priorities</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search features..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredFeatures.length} of {features.length} features
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planned */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Planned ({filteredFeatures.filter(f => f.status === 'planned').length})
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {filteredFeatures
              .filter(feature => feature.status === 'planned')
              .sort((a, b) => b.votes - a.votes)
              .map((feature) => (
              <div key={feature.id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{feature.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(feature.priority)}`}>
                    {feature.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote(feature.id)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        feature.userHasVoted
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ArrowUp className="h-3 w-3" />
                      <span>{feature.votes}</span>
                    </button>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {feature.category}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {feature.estimatedQuarter}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <div className="h-5 w-5 mr-2 bg-yellow-400 rounded-full animate-pulse"></div>
              In Progress ({filteredFeatures.filter(f => f.status === 'in_progress').length})
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {filteredFeatures
              .filter(feature => feature.status === 'in_progress')
              .map((feature) => (
              <div key={feature.id} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{feature.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(feature.priority)}`}>
                    {feature.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote(feature.id)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        feature.userHasVoted
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ArrowUp className="h-3 w-3" />
                      <span>{feature.votes}</span>
                    </button>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {feature.category}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {feature.estimatedQuarter}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Completed ({filteredFeatures.filter(f => f.status === 'completed').length})
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {filteredFeatures
              .filter(feature => feature.status === 'completed')
              .map((feature) => (
              <div key={feature.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{feature.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(feature.priority)}`}>
                    {feature.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      <ArrowUp className="h-3 w-3" />
                      <span>{feature.votes}</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {feature.category}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                    Delivered
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Features</p>
              <p className="text-2xl font-bold text-gray-900">{features.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <div className="w-3 h-3 bg-yellow-600 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{features.filter(f => f.status === 'in_progress').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{features.filter(f => f.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <ArrowUp className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-gray-900">{features.reduce((sum, f) => sum + f.votes, 0)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}