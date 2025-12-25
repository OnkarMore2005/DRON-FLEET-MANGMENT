import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Map, Package, Shield } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Professional Drone Services at Your Fingertips
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Book certified drone operators for aerial photography, surveys, inspections, and more. 
              Safe, reliable, and affordable.
            </p>
            <div className="flex space-x-4">
              <Link to="/services" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center">
                Explore Services
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose DroneBook?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Certified Operators</h3>
              <p className="text-gray-600">All providers are verified and certified professionals</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">HD Quality</h3>
              <p className="text-gray-600">Professional-grade equipment and 4K/8K cameras</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="text-purple-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nationwide Coverage</h3>
              <p className="text-gray-600">Service providers available across major cities</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-orange-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flexible Packages</h3>
              <p className="text-gray-600">Custom packages for events, surveys, and inspections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Preview */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Aerial Photography',
                desc: 'Stunning aerial shots for events and properties',
                price: '₹5,000',
                image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400'
              },
              {
                title: 'Wedding Coverage',
                desc: 'Capture your special day from the sky',
                price: '₹15,000',
                image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'
              },
              {
                title: 'Real Estate Survey',
                desc: 'Complete property documentation and mapping',
                price: '₹8,000',
                image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'
              },
            ].map((service, index) => (
              <div key={index} className="card hover:shadow-xl transition-shadow">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                  <Link to="/services" className="text-blue-600 hover:underline">
                    Learn more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services" className="btn-primary">
              View All Services
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Flight?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers who trust DroneBook
          </p>
          <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block">
            Book Your First Service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
