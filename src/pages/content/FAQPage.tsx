import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setFaqs([
        {
          id: '1',
          question: 'How do I get started with the platform?',
          answer: 'Getting started is easy! Simply create an account, verify your email, and follow our onboarding guide. You can start with our free plan to explore the features.',
          category: 'Getting Started',
          isPublished: true,
          order: 1,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15'
        },
        {
          id: '2',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards including Visa, MasterCard, and American Express. We also support bank transfers for enterprise customers.',
          category: 'Billing',
          isPublished: true,
          order: 2,
          createdAt: '2024-01-16',
          updatedAt: '2024-01-16'
        },
        {
          id: '3',
          question: 'Can I upgrade or downgrade my plan?',
          answer: 'Yes! You can change your subscription plan at any time from your account settings. Changes take effect immediately for upgrades, or at the next billing cycle for downgrades.',
          category: 'Billing',
          isPublished: true,
          order: 3,
          createdAt: '2024-01-17',
          updatedAt: '2024-01-17'
        },
        {
          id: '4',
          question: 'How do I integrate with my existing systems?',
          answer: 'Our platform provides comprehensive REST APIs and webhooks. Check our developer documentation for detailed integration guides and examples.',
          category: 'Integration',
          isPublished: true,
          order: 4,
          createdAt: '2024-01-18',
          updatedAt: '2024-01-18'
        },
        {
          id: '5',
          question: 'What security measures do you have in place?',
          answer: 'We implement enterprise-grade security including encryption at rest and in transit, regular security audits, SOC2 compliance, and multi-factor authentication.',
          category: 'Security',
          isPublished: false,
          order: 5,
          createdAt: '2024-01-19',
          updatedAt: '2024-01-19'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const categories = [...new Set(faqs.map(faq => faq.category))];
  
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
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
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600">Manage frequently asked questions for your help center</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
              {filteredFaqs.length} of {faqs.length} FAQs
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Preview */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-primary-600" />
            FAQ Preview (Customer View)
          </h3>
          <p className="text-sm text-gray-600 mt-1">This is how customers will see your FAQs</p>
        </div>
        <div className="p-6 space-y-4">
          {filteredFaqs.filter(faq => faq.isPublished).map((faq) => (
            <div key={faq.id} className="border rounded-lg">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedFaq === faq.id && (
                <div className="px-4 pb-3 text-gray-700 border-t bg-gray-50">
                  <p className="pt-3">{faq.answer}</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      {faq.category}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Management Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">FAQ Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFaqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {faq.question}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 truncate">
                        {faq.answer.substring(0, 100)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {faq.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      faq.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {faq.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{faq.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(faq.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <HelpCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total FAQs</p>
              <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{faqs.filter(f => f.isPublished).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-yellow-600 font-bold">📄</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{faqs.filter(f => !f.isPublished).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">📚</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}