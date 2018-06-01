class DBHelper{static setupIndexedDB(){const e=window.indexedDB.open("restaurants-db",1);e.onupgradeneeded=function(){e.result.createObjectStore("restaurants",{keyPath:"id"})}}static get database(){return window.indexedDB.open("restaurants-db",1)}static updateIndexedDb(e,t){const n=DBHelper.database;n.onsuccess=function(){const e=n.result.transaction("restaurants","readwrite").objectStore("restaurants");t.forEach(t=>e.add(t))},n.onerror=function(e){console.error("We couldn't fetch anything!")}}static readFromIndexedDb(e){const t=DBHelper.database;t.onsuccess=function(){const n=t.result.transaction(["restaurants"]).objectStore("restaurants").getAll();n.onsuccess=function(){e(n.result)}},t.onerror=function(e){console.error("We couldn't fetch anything!")}}static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static fetchRestaurants(e){fetch(DBHelper.DATABASE_URL).then(e=>e.json()).then(t=>{DBHelper.updateIndexedDb("restaurants",t),e(null,t)}).catch(t=>{console.error("Oops!. Got an error from server. Fetching saved data only."),DBHelper.readFromIndexedDb(t=>e(null,t))})}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.find(t=>t.id==e);n?t(null,n):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){DBHelper.fetchRestaurants((r,s)=>{if(r)n(r,null);else{let r=s;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),n(null,r)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph?`dist/img/${e.photograph}.jpg`:"/img/placeholder.jpg"}static imageSrcsetForRestaurant(e){const t=e&&"undefined"!==e&&"null"!==e?`dist/img/${e}`:"dist/img/placeholder";return`    \n    <source media="(min-width: 800px)" srcset="${t}.webp, ${t}.webp 2x" type="image/webp" />\n    <source media="(min-width: 450px)" srcset="${t}-400px.webp" type="image/webp" />\n    \n    <source media="(min-width: 800px)" srcset="${t}.jpg, ${t}.jpg 2x" />\n    <source media="(min-width: 450px)" srcset="${t}-400px.jpg" />\n\n    <img src="${t}.jpg" class="restaurant-img" alt="restaurant image">\n    `}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}