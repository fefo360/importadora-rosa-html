document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('inventory-loader');
    const grid = document.getElementById('inventory-grid');
    const errorState = document.getElementById('inventory-error');
    const noResults = document.getElementById('no-results');
    const resultsCount = document.getElementById('results-count');
    const searchInput = document.getElementById('search-input');
    
    let allListings = [];

    // Fetch listings
    async function fetchListings() {
        try {
            const res = await fetch('http://146.190.45.102/api/listings?limit=200&includeSource=1');
            if (!res.ok) throw new Error('Failed to fetch');
            
            const data = await res.json();
            allListings = data.items || [];
            
            // Hide loader
            loader.classList.add('hidden');
            
            if (allListings.length === 0) {
                noResults.classList.remove('hidden');
                resultsCount.textContent = '0 vehículos';
            } else {
                renderCards(allListings);
                grid.classList.remove('hidden');
                resultsCount.textContent = `${allListings.length} vehículos`;
            }
        } catch (err) {
            console.error(err);
            loader.classList.add('hidden');
            errorState.classList.remove('hidden');
            resultsCount.textContent = 'Error';
        }
    }

    // Render cards
    function renderCards(listings) {
        grid.innerHTML = '';
        
        if (listings.length === 0) {
            grid.classList.add('hidden');
            noResults.classList.remove('hidden');
            resultsCount.textContent = '0 vehículos encontrados';
            return;
        }

        noResults.classList.add('hidden');
        grid.classList.remove('hidden');
        resultsCount.textContent = `${listings.length} vehículos`;

        listings.forEach(listing => {
            const card = document.createElement('a');
            // Extract listing ID from details if includeSource is not enough, 
            // but since includeSource is there, let's see where listing_id is.
            // Wait, we didn't test '?includeSource=1' yet, but it's usually listing_id.
            // If it's missing, fallback to parsing from details.Anuncio
            let listingId = listing.listing_id;
            if (!listingId && listing.details && listing.details['Anuncio']) {
                listingId = listing.details['Anuncio'].replace('#', '').trim();
            }

            // Route to detalle.html
            card.href = `detalle.html?id=${listingId}`;
            card.className = 'group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-row sm:flex-col overflow-hidden cursor-pointer';
            
            const mainImg = (listing.images && listing.images.length > 0) ? listing.images[0] : 'images/importadora-rosa-logo.jpg';
            
            // For a list view on mobile, we use w-2/5 or w-1/3 for the image, and the rest for text. On sm+ screens, it restores to grid stacked view.
            card.innerHTML = `
                <div class="relative w-2/5 sm:w-full h-32 sm:h-56 flex-shrink-0 overflow-hidden bg-gray-100">
                    <img src="${mainImg}" alt="${listing.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-3 sm:p-5 flex flex-col flex-grow justify-center sm:justify-start">
                    <h3 class="text-sm sm:text-lg md:text-xl font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors mb-1 sm:mb-2 line-clamp-3 sm:line-clamp-none">${listing.title}</h3>
                    <p class="text-lg sm:text-2xl font-black text-gray-900 mt-1 sm:mt-auto">${listing.price_text}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Basic Search Functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const queryText = e.target.value.toLowerCase().trim();
            const terms = queryText ? queryText.split(/\s+/) : [];
            
            if (terms.length === 0) {
                renderCards(allListings);
                return;
            }

            // Normalize terms to ignore hyphens (crv matches cr-v, f150 matches f-150, etc.)
            const normalizedTerms = terms.map(t => t.replace(/-/g, ''));

            const filtered = allListings.filter(l => {
                const searchableText = `${l.title || ''} ${l.brand || ''} ${l.model || ''} ${l.year || ''}`.toLowerCase();
                const normalizedText = searchableText.replace(/-/g, '');
                
                return normalizedTerms.every(term => normalizedText.includes(term));
            });
            renderCards(filtered);
        });
    }

    // Call fetch on load
    fetchListings();
});
