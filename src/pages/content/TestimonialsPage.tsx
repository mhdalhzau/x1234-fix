import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Star, User, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  customerName: string;
  customerTitle: string;
  customerCompany: string;
  testimonial: string;
  rating: number;
  isPublished: boolean;
  isFeatured: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setTestimonials([
        {
          id: '1',
          customerName: 'Sarah Johnson',
          customerTitle: 'CEO',
          customerCompany: 'TechCorp Solutions',
          testimonial: 'This platform has revolutionized our business operations. The analytics and insights have helped us make better decisions and increase our revenue by 40%.',
          rating: 5,
          isPublished: true,
          isFeatured: true,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15'
        },
        {
          id: '2',
          customerName: 'Michael Chen',
          customerTitle: 'Operations Manager',
          customerCompany: 'Retail Plus',
          testimonial: 'The user interface is intuitive and the customer support is outstanding. We were up and running within days, not weeks.',
          rating: 5,
          isPublished: true,
          isFeatured: false,
          createdAt: '2024-01-16',
          updatedAt: '2024-01-16'
        },
        {
          id: '3',
          customerName: 'Emily Rodriguez',
          customerTitle: 'CTO',
          customerCompany: 'StartupVenture',
          testimonial: 'As a growing startup, we needed a scalable solution. This platform grows with us and the pricing is very reasonable for the value we get.',
          rating: 4,
          isPublished: true,
          isFeatured: true,
          createdAt: '2024-01-17',
          updatedAt: '2024-01-17'
        },
        {
          id: '4',
          customerName: 'David Park',
          customerTitle: 'Marketing Director',
          customerCompany: 'Growth Agency',
          testimonial: 'The reporting features are exactly what we needed. We can now track our campaigns more effectively and show clear ROI to our clients.',
          rating: 5,
          isPublished: false,
          isFeatured: false,
          createdAt: '2024-01-18',
          updatedAt: '2024-01-18'
        },
        {
          id: '5',
          customerName: 'Lisa Thompson',
          customerTitle: 'Product Manager',
          customerCompany: 'Innovation Labs',
          testimonial: 'The integration capabilities are fantastic. We connected all our existing tools seamlessly and the workflow automation saves us hours every day.',
          rating: 5,
          isPublished: true,
          isFeatured: false,
          createdAt: '2024-01-19',
          updatedAt: '2024-01-19'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.testimonial.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && testimonial.isPublished) ||
                         (statusFilter === 'draft' && !testimonial.isPublished) ||
                         (statusFilter === 'featured' && testimonial.isFeatured);
    return matchesSearch && matchesStatus;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
          <h1 className="text-2xl font-bold text-gray-900">Testimonials Management</h1>
          <p className="text-gray-600">Manage customer testimonials and reviews</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
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
                placeholder="Search testimonials..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredTestimonials.length} of {testimonials.length} testimonials
            </div>
          </div>
        </div>
      </div>

      {/* Featured Testimonials Preview */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Featured Testimonials (Customer View)
          </h3>
          <p className="text-sm text-gray-600 mt-1">These testimonials will be highlighted on your website</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.filter(t => t.isFeatured && t.isPublished).map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6 relative">
              <Quote className="absolute top-4 right-4 h-6 w-6 text-gray-300" />
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{testimonial.customerName}</p>
                  <p className="text-sm text-gray-600">
                    {testimonial.customerTitle} at {testimonial.customerCompany}
                  </p>
                  <div className="flex mt-1">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.testimonial}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Management Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">All Testimonials</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Testimonial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {filteredTestimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {testimonial.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {testimonial.customerTitle} at {testimonial.customerCompany}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate">
                        "{testimonial.testimonial.substring(0, 100)}..."
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex">
                      {renderStars(testimonial.rating)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        testimonial.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {testimonial.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {testimonial.isFeatured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(testimonial.updatedAt).toLocaleDateString()}
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
              <Quote className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Testimonials</p>
              <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{testimonials.filter(t => t.isPublished).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">{testimonials.filter(t => t.isFeatured).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">★</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}