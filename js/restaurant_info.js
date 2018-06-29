let restaurant;
var map;

/**
 * Hide static map and initialize Google map
 */
const swap_restaurant_map = () => {
  if (document.getElementById('static_map').style.display !== 'none') {        
    document.getElementById('static_map').style.display = 'none';
  }

  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: self.restaurant.latlng,
    scrollwheel: false
  });

  DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
}

/**
 * Event listener for the form submission.
 */
const reviewForm = document.querySelector('#review-form');
if (reviewForm) {
  reviewForm.addEventListener('submit', event => {
    event.preventDefault();
    const restaurant_id = getParameterByName('id'); 
    const form = new FormData(event.target);
    const data = {
      id: 'needs_sync',
      restaurant_id,
      name: form.get('name'),
      rating: form.get('rating'),
      comments: form.get('comments'),
    }
    
    // event to put the data into IndexedDB. 
    DBHelper.addReviewToIndexedDB(data);
  
     // request a one-off sync:
    navigator.serviceWorker.ready.then(function(swRegistration) {
      console.log('syncReviews registered');
      return swRegistration.sync.register('syncReviews');
    });

    // clear values
    event.target.reset();
  
    // reload the reviews from server
    loadRestaurantReviews(restaurant_id, (error, reviews) => {
      console.log('reviews', reviews);
      if (!error) { 
        self.restaurant.reviews = reviews;
      }
    });
  });
}

/**
 * Event listener for the favourites btn
 */
const favBtn = document.querySelector('#favoritesBtn');
if (favBtn) {
  favBtn.addEventListener('click', event => {
    const restaurantId = getParameterByName('id');
    const faved = event.target.dataset.faved === 'true';
    fetch(`http://localhost:${1337}/restaurants/${restaurantId}/?is_favorite=${!faved}`, {
      method: 'put',
    }).then(re => {
      if(re.statusText === 'OK') {
        if (faved) {
          event.target.innerHTML = 'Add to your faves list';
        } else {
          event.target.innerHTML = 'Remove from faves list';
        }
        event.target.dataset.faved = !faved;
        self.restaurant.is_favorite = !faved ? "true" : "false";
      }
    })
    .then(isFav => DBHelper.updateRestaurantInfo(self.restaurant))
    .catch(e => console.error('En error occured', e));
  });
}

/**
 * Refresh restaurant reviews
 */
loadRestaurantReviews = (restaurantId, callback) => {
  console.log('attempting to load reviews from server');
  DBHelper.fetchRestaurantReviews(restaurantId, callback)
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = "restaurant image";
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const faveBtn = document.getElementById('favoritesBtn');
  const isFaved = self.restaurant.is_favorite === 'true';
  faveBtn.innerHTML = isFaved ? 'Remove from faves list' : 'Add to your faves list' ;
  faveBtn.dataset.faved = isFaved

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  let reviewsExist = true; 
  const ul = document.getElementById('reviews-list');
  ul.innerHTML = '';

  // fetch reviews from server/indexedDB
  loadRestaurantReviews(self.restaurant.id, (error, reviews) => {
    if (!error) { 
      if (reviews) {
        reviews.reverse();
        reviews.forEach(review => {
          ul.appendChild(createReviewHTML(review));
        });
      } else {
        reviewsExist = false;
      }
    }
  });

  // if there arent default reviews, and the fetch from server returned nothing,
  // then add a No reviews yet notification
  if (!reviews && !reviewsExist) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  
  // add default reviews
  if(reviews) {
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
  }

  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const header = document.createElement('div');
  header.classList.add('review-header')

  const name = document.createElement('span');
  name.innerHTML = review.name;
  header.appendChild(name);

  const date = document.createElement('span');
  date.innerHTML = review.date || formatDate(review.updatedAt);
  header.appendChild(date);

  li.appendChild(header);

  const rating = document.createElement('p');
  rating.classList.add('review-rating');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments || review.review;
  li.appendChild(comments);

  return li;
}

formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const month = date.toLocaleDateString('en-us', {month: 'long'});
  const day = date.getDay();
  const year = date.getYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
