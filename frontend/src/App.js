import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Switch } from './components/ui/switch';
import { Search, Grid, List, TrendingUp, ExternalLink, Star, Trophy, Filter, Sun, Moon } from 'lucide-react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function App() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cheapestServices, setCheapestServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Theme effect
  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

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
      'Hosting': isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
      'LLM/AI': isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800',
      'Database': isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800',
      'Email': isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-800'
    };
    return colors[category] || (isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800');
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

  const handleLogoError = (e) => {
    // Fallback to a default icon if logo fails to load
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    if (parent && !parent.querySelector('.fallback-icon')) {
      const fallbackIcon = document.createElement('div');
      fallbackIcon.className = 'fallback-icon w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm';
      fallbackIcon.textContent = e.target.alt.charAt(0).toUpperCase();
      parent.appendChild(fallbackIcon);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading SaaS services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {/* Header */}
      <header className={`backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/70 border-gray-700/20' : 'bg-white/70 border-white/20'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PlatformGuide
              </h1>
              <p className={`mt-1 text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Compare pricing of popular SaaS providers & AI tools
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Theme Toggle */}
              <div className="flex items-center gap-2 order-2 sm:order-1">
                <Sun className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-yellow-500'}`} />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-indigo-600"
                />
                <Moon className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-gray-500'}`} />
              </div>
              
              <div className="flex items-center justify-between w-full sm:w-auto gap-3 order-1 sm:order-2">
                <Badge variant="secondary" className={`text-xs sm:text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-indigo-100 text-indigo-800'}`}>
                  {services.length} Services
                </Badge>
                
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className={`h-9 w-9 sm:h-8 sm:w-auto sm:px-3 ${viewMode === 'cards' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                  >
                    <Grid className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-2 hidden sm:inline">Cards</span>
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={`h-9 w-9 sm:h-8 sm:w-auto sm:px-3 ${viewMode === 'table' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-2 hidden sm:inline">Table</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className={`backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border transition-all duration-300 ${isDarkMode ? 'bg-gray-800/70 border-gray-700/20' : 'bg-white/70 border-white/20'}`}>
          <div className="flex flex-col gap-4">
            {/* Search bar - full width on mobile */}
            <div className="w-full">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <Input
                  placeholder="Search services, features, or advantages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 h-11 sm:h-10 text-base sm:text-sm transition-all duration-300 ${isDarkMode ? 'bg-gray-700/80 border-gray-600/40 text-white focus:bg-gray-700' : 'bg-white/80 border-white/40 focus:bg-white'}`}
                />
              </div>
            </div>
            
            {/* Filter controls - responsive layout */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className={`h-11 sm:h-10 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/80 border-gray-600/40 text-white' : 'bg-white/80 border-white/40'}`}>
                    <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className={`h-11 sm:h-10 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/80 border-gray-600/40 text-white' : 'bg-white/80 border-white/40'}`}>
                    <TrendingUp className="h-4 w-4 mr-2 flex-shrink-0" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                    <SelectItem value="name" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>Name</SelectItem>
                    <SelectItem value="category" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>Category</SelectItem>
                    <SelectItem value="price" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>Price</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={`h-11 sm:h-10 px-3 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/80 border-gray-600/40 hover:bg-gray-700 text-white' : 'bg-white/80 border-white/40 hover:bg-white'}`}
                >
                  <span className="text-lg sm:text-base">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  <span className="ml-2 text-sm hidden sm:inline">Sort</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsContent value="cards">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedServices.map((service) => (
                <Card key={service.id} className={`group hover:shadow-xl transition-all duration-300 backdrop-blur-md border overflow-hidden hover-lift ${isDarkMode ? 'bg-gray-800/70 border-gray-700/20 hover:bg-gray-800/90' : 'bg-white/70 border-white/20 hover:bg-white/90'}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {service.logo_url && (
                            <img 
                              src={service.logo_url} 
                              alt={service.name}
                              className="w-10 h-10 rounded-lg object-contain"
                              onError={handleLogoError}
                              style={{filter: isDarkMode && service.logo_url.includes('simple-icons') ? 'invert(1)' : 'none'}}
                            />
                          )}
                        </div>
                        <div>
                          <CardTitle className={`text-xl font-bold transition-colors group-hover:text-indigo-600 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
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
                    <CardDescription className={`mt-2 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Pricing Tiers */}
                    <div>
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        <Star className="h-4 w-4 text-indigo-500" />
                        Pricing Tiers
                      </h4>
                      <div className="space-y-2">
                        {service.tiers.slice(0, 3).map((tier, index) => (
                          <div key={index} className={`flex justify-between items-center p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/60' : 'bg-gray-50/80'}`}>
                            <span className={`font-medium text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tier.name}</span>
                            <span className="font-bold text-indigo-600">{formatPrice(tier.price)}</span>
                          </div>
                        ))}
                        {service.tiers.length > 3 && (
                          <p className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>+{service.tiers.length - 3} more tiers</p>
                        )}
                      </div>
                    </div>

                    {/* Advantages */}
                    <div>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Advantages</h4>
                      <div className="flex flex-wrap gap-1">
                        {service.advantages.slice(0, 3).map((advantage, index) => (
                          <Badge key={index} variant="secondary" className={`text-xs ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                            {advantage}
                          </Badge>
                        ))}
                        {service.advantages.length > 3 && (
                          <Badge variant="secondary" className={`text-xs ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
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
            <div className={`backdrop-blur-md rounded-2xl overflow-hidden border transition-all duration-300 ${isDarkMode ? 'bg-gray-800/70 border-gray-700/20' : 'bg-white/70 border-white/20'}`}>
              <Table>
                <TableHeader>
                  <TableRow className={isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50/80'}>
                    <TableHead className={`font-bold ${isDarkMode ? 'text-gray-200' : ''}`}>Service</TableHead>
                    <TableHead className={`font-bold ${isDarkMode ? 'text-gray-200' : ''}`}>Category</TableHead>
                    <TableHead className={`font-bold ${isDarkMode ? 'text-gray-200' : ''}`}>Starting Price</TableHead>
                    <TableHead className={`font-bold ${isDarkMode ? 'text-gray-200' : ''}`}>Top Features</TableHead>
                    <TableHead className={`font-bold ${isDarkMode ? 'text-gray-200' : ''}`}>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedServices.map((service) => (
                    <TableRow key={service.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700/60 border-gray-700' : 'hover:bg-white/60'}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {service.logo_url && (
                              <img 
                                src={service.logo_url} 
                                alt={service.name}
                                className="w-8 h-8 rounded object-contain"
                                onError={handleLogoError}
                                style={{filter: isDarkMode && service.logo_url.includes('simple-icons') ? 'invert(1)' : 'none'}}
                              />
                            )}
                          </div>
                          <div>
                            <div className={`font-semibold flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {service.name}
                              {isCheapest(service) && (
                                <Trophy className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{service.description}</div>
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
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{service.tiers[0].name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {service.advantages.slice(0, 3).map((advantage, index) => (
                            <Badge key={index} variant="secondary" className={`text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : ''}`}>
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
                          className={`transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-700 hover:text-indigo-400 hover:border-indigo-400' : 'hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'}`}
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
            <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No services found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`backdrop-blur-md border-t py-8 mt-16 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/70 border-gray-700/20' : 'bg-white/70 border-white/20'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Built with ❤️ for developers • Compare {services.length} SaaS services
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Prices are approximate and may vary. Always check official websites for current pricing.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
