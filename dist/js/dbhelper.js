class DBHelper{static setupIndexedDB(){const e=window.indexedDB.open("restaurants-db",1);e.onupgradeneeded=function(){const t=e.result;t.createObjectStore("restaurants",{keyPath:"id"}),t.createObjectStore("reviews",{keyPath:"id"})}}static get database(){return window.indexedDB.open("restaurants-db",1)}static updateRestaurantsStorage(e,t){const r=DBHelper.database;r.onsuccess=function(){const n=r.result.transaction(e,"readwrite").objectStore(e);t.forEach(e=>n.put(e))},r.onerror=function(e){console.error("We couldn't fetch anything!")}}static addReviewToIndexedDB(e){const t=DBHelper.database;t.onsuccess=function(){t.result.transaction("reviews","readwrite").objectStore("reviews").add(e)},t.onerror=function(e){console.error("We couldn't fetch anything!")}}static getUnsyncReviews(e){const t=DBHelper.database;t.onsuccess=function(){const r=t.result.transaction("reviews","readwrite").objectStore("reviews").get("needs_sync");r.onsuccess=function(){e(r.result)}},t.onerror=function(e){console.error("We couldn't fetch anything!")}}static readFromIndexedDb(e){const t=DBHelper.database;t.onsuccess=function(){const r=t.result.transaction(["restaurants"]).objectStore("restaurants").getAll();r.onsuccess=function(){e(r.result)}},t.onerror=function(e){console.error("We couldn't fetch anything!")}}static get DATABASE_URL(){return"http://localhost:1337"}static get RESTAURANTS_URL(){return DBHelper.DATABASE_URL+"/restaurants"}static get REVIEWS_URL(){return DBHelper.DATABASE_URL+"/reviews/?restaurant_id="}static fetchRestaurants(e){fetch(DBHelper.RESTAURANTS_URL).then(e=>e.json()).then(t=>{DBHelper.updateRestaurantsStorage("restaurants",t),e(null,t)}).catch(t=>{console.error("Oops!. Got an error from server.",t,". Fetching saved data only."),DBHelper.readFromIndexedDb(t=>e(null,t))})}static fetchRestaurantReviews(e,t){fetch(DBHelper.REVIEWS_URL+e).then(e=>e.json()).then(e=>{DBHelper.updateRestaurantsStorage("reviews",e),t(null,e)}).catch(e=>{console.error("Oops!. Got an error from server.",e,". Fetching saved data only."),DBHelper.readFromIndexedDb(e=>t(null,e))})}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((r,n)=>{if(r)t(r,null);else{const r=n.find(t=>t.id==e);r?t(null,r):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((r,n)=>{if(r)t(r,null);else{const r=n.filter(t=>t.cuisine_type==e);t(null,r)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((r,n)=>{if(r)t(r,null);else{const r=n.filter(t=>t.neighborhood==e);t(null,r)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,r){DBHelper.fetchRestaurants((n,s)=>{if(n)r(n,null);else{let n=s;"all"!=e&&(n=n.filter(t=>t.cuisine_type==e)),"all"!=t&&(n=n.filter(e=>e.neighborhood==t)),r(null,n)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,r)=>{if(t)e(t,null);else{const t=r.map((e,t)=>r[t].neighborhood),n=t.filter((e,r)=>t.indexOf(e)==r);e(null,n)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,r)=>{if(t)e(t,null);else{const t=r.map((e,t)=>r[t].cuisine_type),n=t.filter((e,r)=>t.indexOf(e)==r);e(null,n)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph?`dist/img/${e.photograph}.jpg`:"/img/placeholder.jpg"}static imageSrcsetForRestaurant(e){const t=e&&"undefined"!==e&&"null"!==e?`dist/img/${e}`:"dist/img/placeholder";return`    \n    <source media="(min-width: 800px)" srcset="${t}.webp, ${t}.webp 2x" type="image/webp" />\n    <source media="(min-width: 450px)" srcset="${t}-400px.webp" type="image/webp" />\n    \n    <source media="(min-width: 800px)" srcset="${t}.jpg, ${t}.jpg 2x" />\n    <source media="(min-width: 450px)" srcset="${t}-400px.jpg" />\n\n    <img src="${t}.jpg" class="restaurant-img" alt="restaurant image">\n    `}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}