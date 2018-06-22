/**
 * Common database helper functions.
 */
class DBHelper {

  static setupIndexedDB() {
    // Open (or create) the database
    const db = window.indexedDB.open('restaurants-db', 1);

    // Create the schema
    db.onupgradeneeded = function() {
      const res = db.result;
      // const restaurantsStore = 
      res.createObjectStore('restaurants', {keyPath: 'id'});
      res.createObjectStore('reviews', {keyPath: 'id'});
      // const index = restaurantsStore.createIndex('restaurants-index', ['name.last', 'name.first']);
    };
  }

  /**
   * IndexedDB Open.
   */
  static get database() {
    return window.indexedDB.open('restaurants-db', 1);
  }

  /**
   * Update IndexedDB with restaurants info
   */
  static updateRestaurantsStorage(key, value) {
    const dbRequest = DBHelper.database;
    dbRequest.onsuccess = function() {
      const db = dbRequest.result;
      const transaction = db.transaction('restaurants','readwrite');
      const store = transaction.objectStore('restaurants');
      value.forEach(v => store.add(v));
    }
    dbRequest.onerror = function(event) {
      // Handle errors!
      console.error('We couldn\'t fetch anything!');
    };    
  }

  /**
   * Fetch from IndexedDB
   */
  static readFromIndexedDb(callback) {
    const dbRequest = DBHelper.database; // OpenDB
    dbRequest.onsuccess = function() {
      const db = dbRequest.result;
      const transaction = db.transaction(['restaurants']);
      const store = transaction.objectStore('restaurants');
      const restaurantsRequest = store.getAll();

      restaurantsRequest.onsuccess = function() {
        callback(restaurantsRequest.result); // callback using data from IDB
      }
    }
    dbRequest.onerror = function(event) {
      // Handle errors!
      console.error('We couldn\'t fetch anything!');
    };
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  static get RESTAURANTS_URL() {
    return DBHelper.DATABASE_URL + '/restaurants';
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.RESTAURANTS_URL)
    .then(response => response.json())
    .then(restaurants => {
      DBHelper.updateRestaurantsStorage('restaurants', restaurants);
      callback(null, restaurants);
    })
    .catch(err => {
      console.error('Oops!. Got an error from server. Fetching saved data only.')
      DBHelper.readFromIndexedDb((res) => callback(null, res));
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (restaurant.photograph ? `dist/img/${restaurant.photograph}.jpg` : `/img/placeholder.jpg`);
  }

  /**
   * Restaurant image srcset.
   */
  static imageSrcsetForRestaurant(photograph) {
    const image = photograph && photograph !== 'undefined' && photograph !== 'null' ? `dist/img/${photograph}` : `dist/img/placeholder`;

    return `    
    <source media="(min-width: 800px)" srcset="${image}.webp, ${image}.webp 2x" type="image/webp" />
    <source media="(min-width: 450px)" srcset="${image}-400px.webp" type="image/webp" />
    
    <source media="(min-width: 800px)" srcset="${image}.jpg, ${image}.jpg 2x" />
    <source media="(min-width: 450px)" srcset="${image}-400px.jpg" />

    <img src="${image}.jpg" class="restaurant-img" alt="restaurant image">
    `;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
