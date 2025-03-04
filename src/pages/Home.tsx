import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ShoppingBag, ChevronRight, Star, TrendingUp, Shield, Truck, Heart } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"

const Home = () => {
  const { isDarkMode } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular Customer",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      text: "EcoShop has completely changed how I shop. Their sustainable products are high quality and the service is exceptional!",
      stars: 5
    },
    {
      name: "Michael Chen",
      role: "Eco Enthusiast",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
      text: "I've been searching for a one-stop shop for eco-friendly products, and EcoShop exceeds all my expectations.",
      stars: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Sustainable Living Blogger",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      text: "As someone who writes about sustainable living, I can confidently say EcoShop offers some of the best eco-friendly products on the market.",
      stars: 4
    }
  ]

  const featuredProducts = [
    {
      id: 1,
      name: "Bamboo Toothbrush Set",
      price: "$12.99",
      image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
      tag: "Bestseller"
    },
    {
      id: 2,
      name: "Reusable Water Bottle",
      price: "$24.99",
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      tag: "New"
    },
    {
      id: 3,
      name: "Organic Cotton Tote",
      price: "$18.99",
      image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      tag: "Popular"
    }
  ]

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className={`relative min-h-[90vh] bg-gradient-to-br ${isDarkMode ? 'from-gray-900 via-primary-900 to-secondary-900' : 'from-primary-50 via-primary-100 to-secondary-200'} overflow-hidden transition-all duration-700 ease-in-out`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Animated Circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-400 dark:bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary-400 dark:bg-secondary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col md:flex-row items-center justify-between py-20">
          <div className={`text-center md:text-left md:w-1/2 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              <span className="block">Sustainable Shopping</span>
              <span className="block mt-2 bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-400 text-transparent bg-clip-text">
                for a Better Tomorrow
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 dark:text-gray-300 max-w-xl">
              Discover our curated collection of eco-friendly products that help you live sustainably without compromising on quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/products"
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-md font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 px-6 py-3 rounded-md font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              >
                Learn More
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div className={`mt-12 md:mt-0 md:w-1/2 ${isVisible ? 'animate-fade-in animation-delay-300' : 'opacity-0'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"></div>
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80" 
                alt="Eco-friendly products" 
                className="relative z-10 rounded-lg shadow-2xl transform transition-transform duration-500 hover:scale-105 max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path 
              fill={isDarkMode ? '#111827' : '#ffffff'} 
              fillOpacity="1" 
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className={`py-20 bg-white dark:bg-gray-900 transition-colors duration-300 ${isVisible ? 'animate-fade-in animation-delay-500' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our most popular eco-friendly products that customers love
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 ${isVisible ? `animate-slide-up animation-delay-${(index + 1) * 200}` : 'opacity-0'}`}
              >
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {product.tag}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">{product.price}</span>
                    <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              View All Products
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300 ${isVisible ? 'animate-fade-in animation-delay-700' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose EcoShop?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're committed to making sustainable living accessible to everyone
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Premium Quality</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We carefully select products that meet the highest quality and sustainability standards
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Carbon-neutral shipping with quick and reliable delivery to your doorstep
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Secure Shopping</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Safe and secure payment processing with a 30-day satisfaction guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className={`py-20 bg-white dark:bg-gray-900 transition-colors duration-300 ${isVisible ? 'animate-fade-in animation-delay-900' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          
          <div className="relative max-w-3xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`transition-all duration-500 ${
                  activeTestimonial === index 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 absolute top-0 translate-x-8'
                }`}
              >
                <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-16 h-16 rounded-full mr-4 border-2 border-primary-500"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < testimonial.stars 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.text}"</p>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeTestimonial === index 
                      ? 'bg-primary-600 dark:bg-primary-400 w-6' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className={`py-20 bg-gradient-to-br ${isDarkMode ? 'from-gray-900 via-primary-900 to-secondary-900' : 'from-primary-500 to-secondary-600'} transition-all duration-700 ease-in-out ${isVisible ? 'animate-fade-in animation-delay-1100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Shop Sustainably?</h2>
          <p className="text-xl text-white opacity-90 max-w-2xl mx-auto mb-10">
            Join thousands of eco-conscious shoppers making a difference with every purchase
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-md font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home

