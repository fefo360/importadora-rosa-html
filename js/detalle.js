document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('id');
    
    const loader = document.getElementById('detail-loader');
    const content = document.getElementById('detail-content');
    const errorState = document.getElementById('detail-error');

    if (!listingId) {
        showError();
        return;
    }

    // Fetch Details
    async function fetchDetails() {
        try {
            const res = await fetch(`http://146.190.45.102/api/listings/${listingId}?includeSource=1`);
            if (!res.ok) throw new Error('Failed to fetch detail');
            
            const resJson = await res.json();
            const listing = resJson.item || resJson;
            populateData(listing);
            
            loader.classList.add('hidden');
            content.classList.remove('hidden');
        } catch (err) {
            console.error(err);
            showError();
        }
    }

    function showError() {
        loader.classList.add('hidden');
        errorState.classList.remove('hidden');
    }

    function populateData(listing) {
        // Basic Info
        document.getElementById('vehicle-title').textContent = listing.title || 'Vehículo';
        document.getElementById('vehicle-subtitle').innerHTML = '';
        document.getElementById('vehicle-price').textContent = listing.price_text || 'Precio a Consultar';

        // Update WhatsApp Links to include Vehicle Title
        const waMessage = encodeURIComponent(`Hola, estoy interesado en el vehículo ${listing.title} (${listing.price_text}). ¿Sigue disponible?`);
        const waLink = `https://wa.me/18297648711?text=${waMessage}`;
        document.getElementById('whatsapp-btn').href = waLink;
        const floatingWa = document.getElementById('floating-whatsapp');
        if(floatingWa) floatingWa.href = waLink;

        // Populate Images
        const mainImage = document.getElementById('main-image');
        const thumbnailsContainer = document.getElementById('thumbnails-container');
        
        if (listing.images && listing.images.length > 0) {
            mainImage.src = listing.images[0];
            
            listing.images.forEach((imgUrl, index) => {
                const thumb = document.createElement('div');
                thumb.className = `w-20 h-16 sm:w-24 sm:h-20 flex-shrink-0 cursor-pointer rounded overflow-hidden transition-all ${index === 0 ? 'thumb-active' : 'thumb-inactive'}`;
                thumb.innerHTML = `<img src="${imgUrl}" class="w-full h-full object-cover" alt="Thumb ${index}">`;
                
                thumb.addEventListener('click', () => {
                    mainImage.src = imgUrl;
                    // Update active state
                    document.querySelectorAll('#thumbnails-container > div').forEach(t => {
                        t.classList.remove('thumb-active');
                        t.classList.add('thumb-inactive');
                    });
                    thumb.classList.remove('thumb-inactive');
                    thumb.classList.add('thumb-active');
                });
                
                thumbnailsContainer.appendChild(thumb);
            });
        }

        // Quick Specs Grid
        const quickSpecs = document.getElementById('quick-specs');
        const specItems = [
            { label: 'Año', value: listing.year, icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>' },
            { label: 'Millaje', value: listing.mileage_text && listing.mileage_text !== 'N/D Mi' ? listing.mileage_text : 'N/D', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>' },
            { label: 'Transmisión', value: listing.transmission || '-', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>' },
            { label: 'Combustible', value: listing.fuel || '-', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>' }
        ];

        specItems.forEach(item => {
            quickSpecs.innerHTML += `
                <div class="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                    <svg class="w-6 h-6 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
                    <span class="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">${item.label}</span>
                    <span class="font-bold text-gray-900">${item.value}</span>
                </div>
            `;
        });

        // Accessories
        const accList = document.getElementById('accessories-list');
        // Define common scraped navigation/meta links to ignore
        const invalidAccessories = new Set([
            'Portada', 'Búsqueda Avanzada', 'Eléctricos', 'TV', 'Vende tu Vehículo', 
            'Los SuperCarros', 'Financiamiento', 'Directorio Dealers', 'Directorio Marcas', 
            'Blog', 'Mis Favoritos', 'Carros', 'Motores', 'Barcos', 'V. Pesados', 'Otros', 
            'Sonido/Adornos', 'Talleres', 'Talleres de Pintura', 'Repuestos', 'Seguros', 
            'Rent a car', 'Condiciones de Uso y Privacidad', 'Política Devoluciones y Cancelaciones', 
            'Contacto Vendedor', 'Contacto Dealer', 'Enlaces', 'DAIMAR COMPRES', 'GRTE VENTAS'
        ]);

        if (listing.accessories && listing.accessories.length > 0) {
            let addedCount = 0;
            listing.accessories.forEach(acc => {
                // Ignore weird scraped data, meta links, pricing, emails, phone numbers, location, etc.
                if (invalidAccessories.has(acc) || 
                    acc.includes('RD$') || 
                    acc.includes('@') || 
                    acc.includes('809-') || 
                    acc.includes('829-') || 
                    acc.includes('849-') ||
                    acc.includes('visita') || 
                    acc.includes('Santiago') ||
                    acc.includes('Transmisión') ||
                    acc.includes('Tracción') ||
                    acc.includes('Color') ||
                    acc.includes('Gasolina')) return;
                
                accList.innerHTML += `
                    <li class="flex items-start">
                        <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>${acc}</span>
                    </li>
                `;
                addedCount++;
            });

            if (addedCount === 0) {
                accList.innerHTML = `<li class="text-gray-500">No hay accesorios listados.</li>`;
            }
        } else {
            accList.innerHTML = `<li class="text-gray-500">No hay accesorios listados.</li>`;
        }

        // Detailed Sidebar Specs
        const detailsList = document.getElementById('detailed-specs');
        const detailsMap = {
            'Marca': listing.brand,
            'Modelo': listing.model,
            'Color Exterior': listing.exterior_color,
            'Color Interior': listing.interior_color,
            'Motor': listing.engine,
            'Tracción': listing.drivetrain,
            'Puertas': listing.doors,
            'Pasajeros': listing.passengers,
            'Condición': listing.condition
        };

        for (const [key, val] of Object.entries(detailsMap)) {
            if (val && val !== 'N/D') {
                detailsList.innerHTML += `
                    <li class="py-3 flex justify-between items-center group">
                        <span class="text-gray-500 group-hover:text-gray-700 transition-colors">${key}</span>
                        <span class="font-medium text-gray-900 text-right max-w-[50%]">${val}</span>
                    </li>
                `;
            }
        }
    }

    fetchDetails();
});
