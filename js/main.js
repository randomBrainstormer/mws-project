let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Callback for the observer
 */
const observerCallback = (entries, observer) => { 
  entries.forEach(entry => {
    const lazyImage = entry.target;
    if (lazyImage.hasAttribute('data-src') && (lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
      const photograph = entry.target.getAttribute('data-src');
      entry.target.innerHTML = DBHelper.imageSrcsetForRestaurant(photograph);
      entry.target.removeAttribute('data-src');
    }
  });
};

// Intersect all the things!
const observer = new IntersectionObserver(observerCallback, {
  // The root to use for intersection.
  // If not provided, use the top-level document’s viewport.
  root: null,
  // Same as margin, can be 1, 2, 3 or 4 components, possibly negative lengths.
  // If an explicit root element is specified, components may be percentages of the
  // root element size.  If no explicit root element is specified, using a percentage
  // is an error.
  rootMargin: "0px",
  // Threshold(s) at which to trigger callback, specified as a ratio, or list of
  // ratios, of (visible area / total area) of the observed element (hence all
  // entries must be in the range [0, 1]).  Callback will be invoked when the visible
  // ratio of the observed element crosses a threshold in the list.
  threshold: [0],
});

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initLocalStorage();
  const isRestaurantsPage = window.location.href.indexOf('/restaurant.html') > -1;
  if(isRestaurantsPage) {
    fetchRestaurantFromURL((error, restaurant) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        document.querySelector('#map').innerHTML = `
        <img id="static_map" onclick="swap_restaurant_map()" alt="Google maps image with restaurants" src="https://maps.googleapis.com/maps/api/staticmap?center=${restaurant.latlng.lat},${restaurant.latlng.lng}&zoom=16&size=640x640&maptype=roadmap
        &markers=color:red%7C${restaurant.latlng.lat},${restaurant.latlng.lng}
        &key=AIzaSyBDWVakzxJSRtpMhMzaX8tt9b2vHc38cpE"></img>
        `;
      }
    });
  } else {
    fetchNeighborhoods();
    fetchCuisines();
    updateRestaurants();
  }
});

window.addEventListener('load', (event) => {
  // start observing the images
  [].slice.call(document.querySelectorAll('picture[data-src]')).forEach(image => {
    observer.observe(image);
  });
});

const swap_map = () => {    
  if (document.getElementById('static_map').style.display !== 'none') {        
    document.getElementById('static_map').style.display = 'none';
  }

  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  addMarkersToMap();
}

/**
 * Initiate IndexedDB 
 */
initLocalStorage = () => {
  DBHelper.setupIndexedDB();
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');
  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  if (typeof google === 'object' && typeof google.maps === 'object') {
    addMarkersToMap();
  } else {
    fetchImageMap();
  }
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const picture = document.createElement('picture');
  // the alt element is returned within the generated HTML of the <picture> element.
  picture.className = 'restaurant-img';
  picture.dataset.src = restaurant.photograph;

  li.append(picture);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

/**
 * Fetch the image version of the map in main page.
 */
fetchImageMap = (restaurants = self.restaurants) => {
  const markers = restaurants.map(restaurant => `&markers=${restaurant.latlng.lat},${restaurant.latlng.lng}`);
  document.querySelector('#map').innerHTML = `
  <img id="static_map" onclick="swap_map()" alt="Google maps image with restaurants" src="https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&zoom=12&size=640x640&maptype=roadmap
  ${markers.join('')}
  &key=AIzaSyBDWVakzxJSRtpMhMzaX8tt9b2vHc38cpE"></img>
  `;
}
