const API_URL = 'https://api.cv-library.co.uk/v1/locations?q=';
const TIMEOUT_VALUE = 300; //milliseconds on which to trigger a new search after a new character has been inputted

(function () {
    const locationInput = document.getElementById('location-input');
    const locationLoader = document.getElementById('location-loader');
    const autocompleteItemsContainer = document.getElementById('autocomplete-list');
    let timeoutHandler = null; // timeout handler for key presses
    let selectedItemIndex = -1; // selected autocomplete item index
    let totalItems = 0; // total items fetched from server

    function executeSearchLocation(ev) {
        const {value} = ev.target;
        let foundItems = [];
        locationLoader.classList.remove('hidden');

        //fetch data from API
        fetch(`${API_URL}${value}`, {method: 'get'}).then(response => response.json())
            .then(jsonData => {
                if (jsonData && jsonData.length) {
                    foundItems = jsonData.map((item) => item.terms[0]);
                }
                let listItemHTML = '';
                foundItems.forEach((item) => {
                    listItemHTML += `<div data="${item}" class="listItem"><strong data="${item}">${item.substr(0, value.length)}${item.substr(value.length)}</strong></div>`;
                });
                totalItems = foundItems.length;
                selectedItemIndex = -1;
                autocompleteItemsContainer.innerHTML = listItemHTML;
                showAutocompleteList();
                locationLoader.classList.add('hidden');
            })
            .catch(err => {
                locationLoader.classList.add('hidden');
                console.log(err);
                alert('There was an error. Please se console for details.');
            });
        timeoutHandler = null;
    }

    // handler executing when selecting an item on the locations list
    function autocompleteListClickHandler(ev) {
        const itemValue = ev.target.attributes.getNamedItem('data').value;
        locationInput.value = itemValue;
        autocompleteItemsContainer.classList.add('hidden');
    }

    //handler for keypress event on 'location' input
    function searchForLocationHandler(ev) {
        const {keyCode} = ev;


        //test for ArrowDown/ArrowUp keypress
        if ((keyCode === 40 || keyCode === 38) && !autocompleteItemsContainer.classList.contains('hidden')) {
            const autocompleteItems = autocompleteItemsContainer.children.length && autocompleteItemsContainer.children;
            autocompleteItems[selectedItemIndex > -1 ? selectedItemIndex : 0].classList.remove('selectedItem');
            if (keyCode === 40) {
                if (selectedItemIndex < totalItems - 1) {
                    selectedItemIndex++;
                }
            }
            //test for ArrowUp keypress
            if (keyCode === 38) {
                if (selectedItemIndex > 0) {

                    selectedItemIndex--;
                }
            }

            if (autocompleteItems[selectedItemIndex]) {
                autocompleteItems[selectedItemIndex].classList.add('selectedItem');
            }

            locationInput.value = autocompleteItems[selectedItemIndex].attributes.getNamedItem('data').value || '';
            return;
        }
        //Press ENTER key, hide the list
        if (keyCode === 13) {
            hideAutocompleteList();
            return;
        }

        if (timeoutHandler !== null) {
            clearTimeout(timeoutHandler);
            timeoutHandler = null;
        }

        timeoutHandler = setTimeout(() => {
            executeSearchLocation(ev);
        }, TIMEOUT_VALUE);
    }

    function hideAutocompleteList() {
        autocompleteItemsContainer.classList.add('hidden');
    }

    function showAutocompleteList() {
        autocompleteItemsContainer.classList.remove('hidden');
    }

    locationInput.addEventListener('keyup', searchForLocationHandler);
    locationInput.addEventListener('blur', hideAutocompleteList);
    autocompleteItemsContainer.addEventListener('mousedown', autocompleteListClickHandler);
})()
