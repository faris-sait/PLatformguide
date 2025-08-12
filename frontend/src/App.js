import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Search, Grid, List, TrendingUp, ExternalLink, Star, Trophy, Filter } from 'lucide-react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cheapestServices, setCheapestServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, categoriesRes, cheapestRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/services`),
          axios.get(`${API_BASE_URL}/api/categories`),
          axios.get(`${API_BASE_URL}/api/cheapest`)
        ]);
        
        setServices(servicesRes.data);
        setCategories(['all', ...categoriesRes.data.categories]);
        setCheapestServices(cheapestRes.data);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort services
  const processedServices = useMemo(() => {
    let filtered = services;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => 
        service.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.advantages.some(advantage => 
          advantage.toLowerCase().includes(searchLower)
        )
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === 'price') {
        const getPrice = (service) => {
          const price = service.tiers[0].price;
          if (price.includes('₹0') || price.includes('Free')) return 0;
          if (price.includes('Custom')) return 999999;
          const numbers = price.match(/[\d,]+/g);
          return numbers ? parseInt(numbers[0].replace(',', '')) : 999999;
        };
        comparison = getPrice(a) - getPrice(b);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [services, selectedCategory, searchTerm, sortBy, sortOrder]);

  const getCategoryColor = (category) => {
    const colors = {
      'Hosting': 'bg-blue-100 text-blue-800',
      'LLM/AI': 'bg-purple-100 text-purple-800',
      'Database': 'bg-green-100 text-green-800',
      'Email': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const isCheapest = (service) => {
    const cheapest = cheapestServices[service.category];
    return cheapest && cheapest.service && cheapest.service.id === service.id;
  };

  const formatPrice = (price) => {
    if (price.includes('/M')) {
      return price.replace('/M', '/Million');
    }
    return price;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading SaaS services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SaaS Scout
              </h1>
              <p className="text-gray-600 mt-1">Compare pricing of popular SaaS providers & AI tools</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                {services.length} Services
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={viewMode === 'cards' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search services, features, or advantages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 border-white/40 focus:bg-white transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex gap-4 flex-wrap lg:flex-nowrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48 bg-white/80 border-white/40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-40 bg-white/80 border-white/40">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-white/80 border-white/40 hover:bg-white"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsContent value="cards">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedServices.map((service) => (
                <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-md border-white/20 hover:bg-white/90 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {service.logo_url && (
                          <img 
                            src={service.logo_url} 
                            alt={service.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                            {service.name}
                            {isCheapest(service) && (
                              <Trophy className="inline-block ml-2 h-4 w-4 text-yellow-500" />
                            )}
                          </CardTitle>
                          <Badge className={getCategoryColor(service.category)}>
                            {service.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-gray-600 mt-2 leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Pricing Tiers */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-indigo-500" />
                        Pricing Tiers
                      </h4>
                      <div className="space-y-2">
                        {service.tiers.slice(0, 3).map((tier, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50/80 rounded-lg">
                            <span className="font-medium text-sm text-gray-700">{tier.name}</span>
                            <span className="font-bold text-indigo-600">{formatPrice(tier.price)}</span>
                          </div>
                        ))}
                        {service.tiers.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">+{service.tiers.length - 3} more tiers</p>
                        )}
                      </div>
                    </div>

                    {/* Advantages */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Advantages</h4>
                      <div className="flex flex-wrap gap-1">
                        {service.advantages.slice(0, 3).map((advantage, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {advantage}
                          </Badge>
                        ))}
                        {service.advantages.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            +{service.advantages.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white group-hover:shadow-lg transition-all duration-300"
                      onClick={() => window.open(service.link, '_blank')}
                    >
                      View Pricing
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="font-bold">Service</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Starting Price</TableHead>
                    <TableHead className="font-bold">Top Features</TableHead>
                    <TableHead className="font-bold">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedServices.map((service) => (
                    <TableRow key={service.id} className="hover:bg-white/60 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {service.logo_url && (
                            <img 
                              src={service.logo_url} 
                              alt={service.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-gray-800 flex items-center gap-2">
                              {service.name}
                              {isCheapest(service) && (
                                <Trophy className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{service.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(service.category)}>
                          {service.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-indigo-600">
                          {formatPrice(service.tiers[0].price)}
                        </div>
                        <div className="text-sm text-gray-500">{service.tiers[0].name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {service.advantages.slice(0, 3).map((advantage, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {advantage}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(service.link, '_blank')}
                          className="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {processedServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No services found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/70 backdrop-blur-md border-t border-white/20 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            Built with ❤️ for developers • Compare {services.length} SaaS services
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Prices are approximate and may vary. Always check official websites for current pricing.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;