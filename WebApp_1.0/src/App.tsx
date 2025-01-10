import React from 'react';
import { Layout } from './components/Layout';
import { MapPin, Search, Filter } from 'lucide-react';
import { EventDialog } from './components/events/EventDialog'; 

function App() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Search and Filter Section */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search for sports, events, or players..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Featured Events */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img
                  src={`https://source.unsplash.com/800x600/?sports,${i}`}
                  alt="Event"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">Weekend Soccer Match</h3>
                  <p className="text-gray-600 text-sm mt-1">Casual friendly match, all skill levels welcome</p>
                  <div className="flex items-center mt-3 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    Central Park, Field 3
                  </div>
                {/* ... card content ... */}
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-indigo-600">3 spots left</span>
                  <EventDialog 
                    event={{
                      id: i,
                      title: "Weekend Soccer Match",
                      description: "Casual friendly match, all skill levels welcome",
                      location: "Central Park, Field 3",
                      spotsLeft: 3,
                      date: new Date(),
                      image: `https://source.unsplash.com/800x600/?sports,${i}`
                    }}
                  >
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Join
                    </button>
                  </EventDialog>
                </div>
              </div>
            </div>  
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default App;